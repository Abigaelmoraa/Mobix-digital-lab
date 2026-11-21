import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contentApi } from "@/lib/api";
import { coursesQuery } from "@/lib/public-queries";

const schema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(40),
  message: z.string().trim().max(2000),
});

const blankForm = {
  full_name: "",
  email: "",
  phone: "",
  course_id: "",
  course_title: "",
  message: "",
};

export function ApplicationDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const { data: courses = [], isLoading, isError } = useQuery({ ...coursesQuery, enabled: open });

  const selectedCourse = courses.find((course) => course.id === form.course_id);
  const otherSelected = form.course_id === "other";

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setForm(blankForm);
      setError("");
      setSent(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    if (!form.course_id) {
      setError("Choose a course to enrol in.");
      return;
    }
    if (otherSelected && form.course_title.trim().length < 2) {
      setError("Tell us which course you want to enrol in.");
      return;
    }
    setSending(true);
    try {
      await contentApi.submitApplication({
        ...parsed.data,
        course_id: form.course_id,
        course_title: otherSelected ? form.course_title.trim() : (selectedCourse?.title ?? ""),
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your application. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button">Apply now</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for admission</DialogTitle>
          <DialogDescription>
            Tell us about yourself and the course you would like to join. We will be in touch with
            the next steps.
          </DialogDescription>
        </DialogHeader>
        {sent ? (
          <div className="space-y-4">
            <p role="status" className="text-base text-secondary">
              Application received. Thank you — the MØBIX team will contact you soon.
            </p>
            <Button type="button" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={(event) => void onSubmit(event)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="application-name">Full name</Label>
              <Input
                id="application-name"
                value={form.full_name}
                onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                maxLength={120}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="application-email">Email</Label>
              <Input
                id="application-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                maxLength={255}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="application-phone">Phone</Label>
              <Input
                id="application-phone"
                type="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                maxLength={40}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="application-course">Course to enrol in</Label>
              <select
                id="application-course"
                value={form.course_id}
                onChange={(event) => setForm({ ...form, course_id: event.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
                required
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                    {course.is_free ? " (Free)" : ""}
                  </option>
                ))}
                <option value="other">Other / not sure yet</option>
              </select>
              {isLoading && <p className="text-sm text-muted-foreground">Loading courses…</p>}
              {isError && (
                <p className="text-sm text-destructive">
                  Courses could not be loaded. You can still tell us what you need below.
                </p>
              )}
            </div>
            {otherSelected && (
              <div className="space-y-2">
                <Label htmlFor="application-course-title">Course name</Label>
                <Input
                  id="application-course-title"
                  value={form.course_title}
                  onChange={(event) => setForm({ ...form, course_title: event.target.value })}
                  maxLength={160}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="application-message">Anything else? (optional)</Label>
              <Textarea
                id="application-message"
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                rows={3}
                maxLength={2000}
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={sending} className="w-full">
              {sending ? "Sending…" : "Submit application"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
