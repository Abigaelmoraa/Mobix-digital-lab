import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
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
import { useAuth } from "@/hooks/use-auth";
import { formatKes } from "@/lib/contact";
import { enrollmentApi } from "@/lib/api";
import type { PublicCourse } from "@/lib/public-content.functions";

const schema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(40),
  message: z.string().trim().max(2000).optional().default(""),
});

export function EnrollmentDialog({
  course,
  className,
  label = "Register now",
}: {
  course: PublicCourse;
  className?: string;
  label?: string;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<"registered" | "existing" | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm((current) => ({
        ...current,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || current.phone,
      }));
    }
  }, [user]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setForm({ full_name: "", email: "", phone: "", message: "" });
      setResult(null);
      setError("");
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
    setSending(true);
    try {
      const response = await enrollmentApi.enroll({ ...parsed.data, course_id: course.id });
      setResult(response.alreadyEnrolled ? "existing" : "registered");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete registration. Try again.");
    } finally {
      setSending(false);
    }
  }

  const price = course.is_free
    ? "Free"
    : course.price_kes != null
      ? formatKes(course.price_kes)
      : "Fee on enquiry";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className={className}>
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register for a course</DialogTitle>
          <DialogDescription>
            {course.title} · {course.level || "All levels"} · {price}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <p role="status" className="text-base text-secondary">
              {result === "registered"
                ? "Registration received. The MØBIX team will contact you with next steps."
                : "You are already registered for this course. We will be in touch with next steps."}
            </p>
            {!user && (
              <p className="text-sm text-muted-foreground">
                Create an account with this email to track your registration in your dashboard.
              </p>
            )}
            <Button type="button" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            {!user && (
              <p className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                You can register without an account.{" "}
                <Link
                  to="/auth"
                  search={{ mode: "sign-up" }}
                  className="font-semibold text-secondary underline underline-offset-4"
                >
                  Create an account
                </Link>{" "}
                to see your courses in the dashboard.
              </p>
            )}
            <form onSubmit={(event) => void onSubmit(event)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor={`enroll-name-${course.id}`}>Full name</Label>
                <Input
                  id={`enroll-name-${course.id}`}
                  value={form.full_name}
                  onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                  maxLength={120}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`enroll-email-${course.id}`}>Email</Label>
                <Input
                  id={`enroll-email-${course.id}`}
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  maxLength={255}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`enroll-phone-${course.id}`}>Phone</Label>
                <Input
                  id={`enroll-phone-${course.id}`}
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  maxLength={40}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`enroll-message-${course.id}`}>Anything else? (optional)</Label>
                <Textarea
                  id={`enroll-message-${course.id}`}
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
                {sending ? "Registering…" : "Submit registration"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
