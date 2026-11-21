import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ClipboardList, MessageCircle, Send } from "lucide-react";

import { ApplicationDialog } from "@/components/application-dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_public/admissions")({
  head: () => ({
    meta: [
      { title: "Admissions — MØBIX Digital Lab" },
      {
        name: "description",
        content: "Apply to MØBIX Digital Lab courses and get help choosing the right programme.",
      },
    ],
  }),
  component: Admissions,
});

function Admissions() {
  return (
    <div>
      <section className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(180,91,180,0.16),transparent_42%)]">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
            Admissions
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-bold leading-tight text-primary md:text-6xl">
            Join MØBIX Digital Lab
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Applying takes a few minutes. Our team will contact you to confirm your programme, study
            mode, and start date.
          </p>
          <ApplicationDialog className="mt-8" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">How it works</h2>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          <Step
            icon={ClipboardList}
            title="Choose a programme"
            text="Browse the courses and pick the one that matches your goals."
          />
          <Step
            icon={Send}
            title="Send your application"
            text="Share your details and the course you want to join."
          />
          <Step
            icon={CheckCircle2}
            title="Get confirmed"
            text="We follow up with schedule, fees, and the next step."
          />
        </div>
      </section>

      <section className="bg-accent/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-16 md:flex-row md:items-center md:justify-between">
          <div>
            <MessageCircle className="size-8 text-secondary" />
            <h2 className="mt-4 font-display text-3xl font-bold text-primary">
              Not sure which course fits?
            </h2>
            <p className="mt-2 max-w-xl text-base text-muted-foreground">
              Talk to us about your goals and we will help you choose a practical path.
            </p>
          </div>
          <Button asChild>
            <Link to="/contact">
              Contact admissions
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function Step({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof ClipboardList;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-7">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-accent text-secondary">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-5 font-display text-xl font-bold text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
