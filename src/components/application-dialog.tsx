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
  course_id: z.string().min(1, "Choose a course to enrol in"),
  course_title: z.string().trim().max(160),
  study_mode: z.string().min(1, "Choose a study mode"),
  experience_level: z.string().min(1, "Choose your experience level"),
  preferred_start: z.string().min(1, "Choose a preferred start"),
  location: z.string().trim().min(2, "Enter your location").max(120),
  source: z.string().trim().max(120),
  goals: z.string().trim().min(10, "Tell us what you want to achieve").max(1500),
  notes: z.string().trim().max(1000),
});

const blankForm = {
  full_name: "",
  email: "",
  phone: "",
  course_id: "",
  course_title: "",
  study_mode: "",
  experience_level: "",
  preferred_start: "",
  location: "",
  source: "",
  goals: "",
  notes: "",
};

const studyModes = [
  { value: "in-person", label: "In-person at the Nairobi studio" },
  { value: "online", label: "Online live sessions" },
  { value: "hybrid", label: "Hybrid (in-person and online)" },
];

const experienceLevels = [
  { value: "beginner", label: "Beginner — I am starting from scratch" },
  { value: "some", label: "Some experience — I have tried the basics" },
  { value: "professional", label: "Working professional — I want to level up" },
];

const startOptions = [
  { value: "asap", label: "As soon as possible" },
  { value: "this-month", label: "This month" },
  { value: "next-month", label: "Next month" },
  { value: "exploring", label: "I am still exploring" },
];

const sourceOptions = [
  { value: "search", label: "Search engine" },
  { value: "social", label: "Social media" },
  { value: "friend", label: "Friend or colleague" },
  { value: "studio", label: "Visited the studio" },
  { value: "other", label: "Other" },
];

function optionLabel(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

type ApplicationDialogProps = {
  className?: string;
  label?: string;
};

export function ApplicationDialog({ className, label = "Apply now" }: ApplicationDialogProps = {}) {
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
    if (form.course_id !== "other" && !selectedCourse) {
      setError("Choose a published course.");
      return;
    }
    if (otherSelected && form.course_title.trim().length < 2) {
      setError("Tell us which course you want to enrol in.");
      return;
    }

    const details = [
      `Study mode: ${optionLabel(studyModes, form.study_mode)}`,
      `Experience: ${optionLabel(experienceLevels, form.experience_level)}`,
      `Preferred start: ${optionLabel(startOptions, form.preferred_start)}`,
      `Location: ${form.location.trim()}`,
      `Heard about us: ${optionLabel(sourceOptions, form.source)}`,
      "",
      `Goals: ${form.goals.trim()}`,
    ];
    if (form.notes.trim()) details.push("", `Additional notes: ${form.notes.trim()}`);

    setSending(true);
    try {
      await contentApi.submitApplication({
        full_name: parsed.data.full_name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        course_id: form.course_id,
        course_title: otherSelected ? form.course_title.trim() : (selectedCourse?.title ?? ""),
        message: details.join("\n"),
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
        <Button type="button" className={className}>
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply for admission</DialogTitle>
          <DialogDescription>
            Tell us about yourself, your goals, and the course you would like to join. Our team will
            contact you with the next steps.
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
            <div className="grid gap-4 sm:grid-cols-2">
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

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                id="application-mode"
                label="Preferred study mode"
                value={form.study_mode}
                onChange={(value) => setForm({ ...form, study_mode: value })}
                options={studyModes}
                placeholder="Choose a study mode"
              />
              <SelectField
                id="application-experience"
                label="Current experience"
                value={form.experience_level}
                onChange={(value) => setForm({ ...form, experience_level: value })}
                options={experienceLevels}
                placeholder="Choose your experience level"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                id="application-start"
                label="Preferred start"
                value={form.preferred_start}
                onChange={(value) => setForm({ ...form, preferred_start: value })}
                options={startOptions}
                placeholder="Choose a start window"
              />
              <div className="space-y-2">
                <Label htmlFor="application-location">Location</Label>
                <Input
                  id="application-location"
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                  placeholder="Town or city"
                  maxLength={120}
                  required
                />
              </div>
            </div>

            <SelectField
              id="application-source"
              label="How did you hear about us?"
              value={form.source}
              onChange={(value) => setForm({ ...form, source: value })}
              options={sourceOptions}
              placeholder="Choose an option"
            />

            <div className="space-y-2">
              <Label htmlFor="application-goals">What do you want to achieve?</Label>
              <Textarea
                id="application-goals"
                value={form.goals}
                onChange={(event) => setForm({ ...form, goals: event.target.value })}
                rows={4}
                maxLength={1500}
                placeholder="Tell us about your goals and why this course interests you."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="application-notes">Anything else? (optional)</Label>
              <Textarea
                id="application-notes"
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                rows={3}
                maxLength={1000}
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

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
        required
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
