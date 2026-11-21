import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, GraduationCap, MapPin, Target } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_public/about")({
  head: () => ({
    meta: [{ title: "About — MØBIX Digital Lab" }],
  }),
  component: About,
});

function About() {
  return (
    <div>
      <section className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(180,91,180,0.16),transparent_42%)]">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
            About MØBIX
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-bold leading-tight text-primary md:text-6xl">
            A technology school built around practical skills
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            We train learners for the modern digital economy through hands-on courses, real
            projects, and guidance from a local team that understands the work.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <ValueCard
            icon={Target}
            title="Our mission"
            text="To make useful technology skills accessible through clear teaching, practical projects, and support that continues after the course."
          />
          <ValueCard
            icon={GraduationCap}
            title="Our vision"
            text="To be a trusted hub for digital skills in East Africa, helping learners build confidence and create real opportunities."
          />
        </div>
      </section>

      <section className="bg-accent/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">
              Learn at our Nairobi studio or from anywhere
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              In-person sessions take place at our Westlands studio, opposite The Alchemist. Online
              learners join live sessions remotely, and hybrid students can combine both.
            </p>
            <Button asChild className="mt-7">
              <Link to="/courses">
                Explore courses
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="rounded-3xl border border-border bg-card p-8">
            <Building2 className="size-8 text-secondary" />
            <p className="mt-5 font-display text-2xl font-bold text-primary">Our campus</p>
            <p className="mt-3 flex items-start gap-2 text-base text-muted-foreground">
              <MapPin className="mt-1 size-4 shrink-0 text-secondary" />
              Westlands, opposite The Alchemist, Nairobi
            </p>
            <p className="mt-4 text-base text-muted-foreground">
              Visit us to ask about a course, speak with the team, or see where the practical work
              happens.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Target;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-8">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-accent text-secondary">
        <Icon className="size-6" />
      </div>
      <h2 className="mt-5 font-display text-2xl font-bold text-primary">{title}</h2>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
