import { useEffect, useState, type ComponentProps, type FormEvent, type ReactNode } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { hasStudioAccess } from "@/lib/studio-access";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/studio")({
  head: () => ({
    meta: [
      { title: "Studio dashboard — MØBIX Digital Lab" },
      { name: "description", content: "Manage MØBIX Digital Lab services and course listings." },
      { property: "og:title", content: "Studio dashboard — MØBIX Digital Lab" },
      { property: "og:description", content: "Manage MØBIX Digital Lab services and course listings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudioDashboard,
});

type ServiceRow = Tables<"services">;
type CourseRow = Tables<"courses">;
type Tab = "services" | "courses";
const serviceSchema = z.object({
  title: z.string().trim().min(2).max(160),
  category: z.string().trim().min(2).max(100),
  description: z.string().trim().max(3000),
  deliverables: z.string().max(3000),
  isPublished: z.boolean(),
});
const courseSchema = z.object({
  title: z.string().trim().min(2).max(160),
  category: z.string().trim().min(2).max(100),
  description: z.string().trim().max(3000),
  level: z.string().trim().min(2).max(80),
  duration: z.string().trim().max(100),
  priceKes: z.string().trim().regex(/^$|^\d+$/, "Enter a whole amount in KES."),
  isFree: z.boolean(),
  isPublished: z.boolean(),
});
const blankService = { title: "", category: "Digital solutions", description: "", deliverables: "", isPublished: false };
const blankCourse = { title: "", category: "Technology", description: "", level: "Beginner", duration: "", priceKes: "", isFree: false, isPublished: false };

function StudioDashboard() {
  const { canManageStudio, loading, user, studioRole } = useAuth();
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [tab, setTab] = useState<Tab>("services");
  const [serviceForm, setServiceForm] = useState(blankService);
  const [courseForm, setCourseForm] = useState(blankCourse);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (loading || !canManageStudio) return;
    let active = true;
    setFetching(true);
    void Promise.all([
      supabase.from("services").select("*").order("sort_order").order("title"),
      supabase.from("courses").select("*").order("sort_order").order("title"),
    ]).then(([serviceResult, courseResult]) => {
      if (!active) return;
      if (serviceResult.error || courseResult.error) {
        setError("Your listings could not be loaded. Please refresh and try again.");
      } else {
        setServices(serviceResult.data ?? []);
        setCourses(courseResult.data ?? []);
      }
      setFetching(false);
    });
    return () => { active = false; };
  }, [loading, canManageStudio]);

  async function saveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setMessage("");
    const parsed = serviceSchema.safeParse(serviceForm);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check the service details."); return; }
    setSaving(true);
    const values = {
      title: parsed.data.title,
      category: parsed.data.category,
      description: parsed.data.description,
      deliverables: parsed.data.deliverables.split("\n").map((item) => item.trim()).filter(Boolean),
      is_published: parsed.data.isPublished,
      updated_at: new Date().toISOString(),
    };
    const result = editingService
      ? await supabase.from("services").update(values).eq("id", editingService).select().single()
      : await supabase.from("services").insert(values).select().single();
    setSaving(false);
    if (result.error) { setError("Could not save this service. Confirm your studio access and try again."); return; }
    setServices((current) => editingService
      ? current.map((item) => item.id === editingService ? result.data : item)
      : [...current, result.data]);
    setServiceForm(blankService); setEditingService(null); setMessage("Service saved.");
    await refreshPublicListings();
  }

  async function saveCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setMessage("");
    const parsed = courseSchema.safeParse(courseForm);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check the course details."); return; }
    const price = parsed.data.priceKes === "" ? null : Number(parsed.data.priceKes);
    if (price !== null && !Number.isSafeInteger(price)) { setError("Enter a valid whole amount in KES."); return; }
    setSaving(true);
    const values = {
      title: parsed.data.title,
      category: parsed.data.category,
      description: parsed.data.description,
      level: parsed.data.level,
      duration: parsed.data.duration,
      is_free: parsed.data.isFree,
      price_kes: parsed.data.isFree ? null : price,
      is_published: parsed.data.isPublished,
      updated_at: new Date().toISOString(),
    };
    const result = editingCourse
      ? await supabase.from("courses").update(values).eq("id", editingCourse).select().single()
      : await supabase.from("courses").insert(values).select().single();
    setSaving(false);
    if (result.error) { setError("Could not save this course. Confirm your studio access and try again."); return; }
    setCourses((current) => editingCourse
      ? current.map((item) => item.id === editingCourse ? result.data : item)
      : [...current, result.data]);
    setCourseForm(blankCourse); setEditingCourse(null); setMessage("Course saved.");
    await refreshPublicListings();
  }

  async function refreshPublicListings() {
    await queryClient.invalidateQueries({ queryKey: ["public", "services"] });
    await queryClient.invalidateQueries({ queryKey: ["public", "courses"] });
    await router.invalidate();
  }

  function editService(item: ServiceRow) {
    setTab("services"); setEditingService(item.id); setEditingCourse(null);
    setServiceForm({ title: item.title, category: item.category, description: item.description, deliverables: item.deliverables.join("\n"), isPublished: item.is_published });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editCourse(item: CourseRow) {
    setTab("courses"); setEditingCourse(item.id); setEditingService(null);
    setCourseForm({ title: item.title, category: item.category, description: item.description, level: item.level, duration: item.duration, priceKes: item.price_kes == null ? "" : String(item.price_kes), isFree: item.is_free, isPublished: item.is_published });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) return <div className="mx-auto max-w-6xl px-5 py-20 text-sm text-muted-foreground">Checking studio access…</div>;

  if (!canManageStudio) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20">
        <p className="text-sm font-semibold text-secondary">MØBIX Digital Lab</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-primary">Studio access pending</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">{user?.email} is signed in, but this account does not have permission to manage or publish studio listings.</p>
        <p className="mt-3 text-sm text-muted-foreground">Only an authorized studio administrator can grant publishing access. Your account remains private and cannot change services or courses.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-7">
        <div>
          <p className="text-sm font-semibold text-secondary">MØBIX Digital Lab · {studioRole}</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-primary">Studio dashboard</h1>
          <p className="mt-2 text-muted-foreground">Create, update, and publish services and courses.</p>
        </div>
        <p className="text-sm text-muted-foreground">{services.length} services · {courses.length} courses</p>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)} className="mt-8">
        <TabsList aria-label="Studio content type">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>
        <TabsContent value="services" className="mt-7 grid items-start gap-10 lg:grid-cols-[minmax(280px,0.8fr)_1.2fr]">
          <form onSubmit={saveService} className="space-y-5 border-b border-border pb-8 lg:border-b-0 lg:border-r lg:pr-8">
            <div><h2 className="font-display text-2xl font-bold text-primary">{editingService ? "Edit service" : "New service"}</h2><p className="mt-1 text-sm text-muted-foreground">Unpublished services stay off the public site.</p></div>
            <TextField label="Service name" value={serviceForm.title} onChange={(value) => setServiceForm({ ...serviceForm, title: value })} required maxLength={160} />
            <TextField label="Category" value={serviceForm.category} onChange={(value) => setServiceForm({ ...serviceForm, category: value })} required maxLength={100} />
            <TextAreaField label="Description" value={serviceForm.description} onChange={(value) => setServiceForm({ ...serviceForm, description: value })} rows={4} maxLength={3000} />
            <TextAreaField label="Deliverables · one per line" value={serviceForm.deliverables} onChange={(value) => setServiceForm({ ...serviceForm, deliverables: value })} rows={4} maxLength={3000} />
            <PublishToggle checked={serviceForm.isPublished} onCheckedChange={(value) => setServiceForm({ ...serviceForm, isPublished: value })} />
            <FormActions editing={Boolean(editingService)} saving={saving} onCancel={() => { setServiceForm(blankService); setEditingService(null); }} />
          </form>
          <ListingList loading={fetching} empty={!services.length} kind="service">
            {services.map((item) => <ListingRow key={item.id} title={item.title} category={item.category} published={item.is_published} onEdit={() => editService(item)} />)}
          </ListingList>
        </TabsContent>

        <TabsContent value="courses" className="mt-7 grid items-start gap-10 lg:grid-cols-[minmax(280px,0.8fr)_1.2fr]">
          <form onSubmit={saveCourse} className="space-y-5 border-b border-border pb-8 lg:border-b-0 lg:border-r lg:pr-8">
            <div><h2 className="font-display text-2xl font-bold text-primary">{editingCourse ? "Edit course" : "New course"}</h2><p className="mt-1 text-sm text-muted-foreground">Set the course details and publication state.</p></div>
            <TextField label="Course name" value={courseForm.title} onChange={(value) => setCourseForm({ ...courseForm, title: value })} required maxLength={160} />
            <TextField label="Category" value={courseForm.category} onChange={(value) => setCourseForm({ ...courseForm, category: value })} required maxLength={100} />
            <TextAreaField label="Description" value={courseForm.description} onChange={(value) => setCourseForm({ ...courseForm, description: value })} rows={4} maxLength={3000} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Level" value={courseForm.level} onChange={(value) => setCourseForm({ ...courseForm, level: value })} required maxLength={80} />
              <TextField label="Duration" value={courseForm.duration} onChange={(value) => setCourseForm({ ...courseForm, duration: value })} maxLength={100} />
            </div>
            <TextField label="Fee in KES · blank if not set" type="number" min="0" step="1" value={courseForm.priceKes} onChange={(value) => setCourseForm({ ...courseForm, priceKes: value })} disabled={courseForm.isFree} />
            <PublishToggle checked={courseForm.isFree} onCheckedChange={(value) => setCourseForm({ ...courseForm, isFree: value })} label="Free course" />
            <PublishToggle checked={courseForm.isPublished} onCheckedChange={(value) => setCourseForm({ ...courseForm, isPublished: value })} />
            <FormActions editing={Boolean(editingCourse)} saving={saving} onCancel={() => { setCourseForm(blankCourse); setEditingCourse(null); }} />
          </form>
          <ListingList loading={fetching} empty={!courses.length} kind="course">
            {courses.map((item) => <ListingRow key={item.id} title={item.title} category={item.category} published={item.is_published} onEdit={() => editCourse(item)} />)}
          </ListingList>
        </TabsContent>
      </Tabs>

      {error && <p role="alert" className="mt-6 text-sm text-destructive">{error}</p>}
      {message && <p role="status" className="mt-6 text-sm text-secondary">{message}</p>}
    </section>
  );
}

function TextField({ label, value, onChange, ...props }: { label: string; value: string; onChange: (value: string) => void } & Omit<ComponentProps<typeof Input>, "value" | "onChange">) {
  const id = `studio-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} value={value} onChange={(event) => onChange(event.target.value)} {...props} /></div>;
}

function TextAreaField({ label, value, onChange, ...props }: { label: string; value: string; onChange: (value: string) => void } & Omit<ComponentProps<typeof Textarea>, "value" | "onChange">) {
  const id = `studio-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} {...props} /></div>;
}

function PublishToggle({ checked, onCheckedChange, label = "Published on public site" }: { checked: boolean; onCheckedChange: (checked: boolean) => void; label?: string }) {
  const id = `toggle-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return <div className="flex items-center justify-between gap-4 border-y border-border py-4"><Label htmlFor={id}>{label}</Label><Switch id={id} checked={checked} onCheckedChange={onCheckedChange} /></div>;
}

function FormActions({ editing, saving, onCancel }: { editing: boolean; saving: boolean; onCancel: () => void }) {
  return <div className="flex flex-wrap gap-3"><Button type="submit" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Create listing"}</Button>{editing && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}</div>;
}

function ListingList({ loading, empty, kind, children }: { loading: boolean; empty: boolean; kind: "service" | "course"; children: ReactNode }) {
  return <div aria-live="polite">
    {loading ? <p className="py-6 text-sm text-muted-foreground">Loading {kind} listings…</p>
      : empty ? <p className="border-b border-dashed border-border py-8 text-sm text-muted-foreground">No {kind} listings yet.</p>
        : <div className="divide-y divide-border">{children}</div>}
  </div>;
}

function ListingRow({ title, category, published, onEdit }: { title: string; category: string; published: boolean; onEdit: () => void }) {
  return <article className="flex flex-wrap items-center justify-between gap-4 py-5">
    <div className="min-w-0"><h3 className="break-words font-semibold text-foreground">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{category} · {published ? "Published" : "Unpublished"}</p></div>
    <Button type="button" variant="outline" size="sm" onClick={onEdit}>Edit</Button>
  </article>;
}