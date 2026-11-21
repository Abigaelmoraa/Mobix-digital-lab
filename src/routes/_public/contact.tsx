import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { contentApi } from "@/lib/api";
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from "@/lib/contact";

export const Route = createFileRoute("/_public/contact")({
  head: () => ({
    meta: [
      { title: "Contact — MØBIX Digital Lab" },
      {
        name: "description",
        content: "Call, WhatsApp or send an enquiry to MØBIX Digital Lab in Nairobi, Kenya.",
      },
      { property: "og:title", content: "Contact — MØBIX Digital Lab" },
      {
        property: "og:description",
        content: "Call, WhatsApp or send an enquiry to MØBIX Digital Lab in Nairobi, Kenya.",
      },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(40),
  service_requested: z.string().trim().max(160),
  message: z.string().trim().min(5, "Tell us a little more").max(4000),
});

function Contact() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const parsed = schema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success)
      return setError(parsed.error.issues[0]?.message ?? "Please check the form");
    setError("");
    setState("sending");
    try {
      await contentApi.submitEnquiry(parsed.data);
      form.reset();
      setState("sent");
    } catch (err) {
      setState("idle");
      setError(
        err instanceof Error ? err.message : "Sending failed. Please try again or use WhatsApp.",
      );
    }
  }
  const field =
    "w-full rounded-xl border border-input bg-card px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ring";
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1fr_1.3fr]">
      <div>
        <h1 className="font-display text-5xl font-bold text-primary">Contact</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Based in Nairobi, Kenya. Reach us directly or send an enquiry.
        </p>
        <div className="mt-8 space-y-3">
          <a
            href={PHONE_TEL}
            className="block rounded-2xl bg-accent p-5 font-semibold text-primary"
          >
            Call {PHONE_DISPLAY}
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl bg-secondary p-5 font-semibold text-secondary-foreground"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
      {state === "sent" ? (
        <div className="rounded-2xl border border-border bg-card p-8">
          <h2 className="font-display text-2xl font-bold text-primary">Enquiry received</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Thank you — the MØBIX team will review it and get back to you.
          </p>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-6"
          noValidate
        >
          <input name="full_name" placeholder="Full name" className={field} maxLength={120} />
          <input name="email" type="email" placeholder="Email" className={field} maxLength={255} />
          <input name="phone" placeholder="Phone (optional)" className={field} maxLength={40} />
          <input
            name="service_requested"
            placeholder="Service or course of interest"
            className={field}
            maxLength={160}
          />
          <textarea
            name="message"
            rows={5}
            placeholder="How can we help?"
            className={field}
            maxLength={4000}
          />
          {error && (
            <p role="alert" className="text-base text-destructive">
              {error}
            </p>
          )}
          <button
            disabled={state === "sending"}
            className="w-full rounded-full bg-primary py-4 text-base font-semibold text-primary-foreground disabled:opacity-60"
          >
            {state === "sending" ? "Sending…" : "Send enquiry"}
          </button>
        </form>
      )}
    </div>
  );
}
