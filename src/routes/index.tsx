import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, Laptop, Sparkles } from "lucide-react";

import studio from "@/assets/mobix-studio.jpg";
import { ApplicationDialog } from "@/components/application-dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MØBIX Digital Lab — Learn, build, launch" },
      {
        name: "description",
        content:
          "A Nairobi digital studio for practical technology training and useful digital products.",
      },
      { property: "og:title", content: "MØBIX Digital Lab — Learn, build, launch" },
      {
        property: "og:description",
        content:
          "A Nairobi digital studio for practical technology training and useful digital products.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(180,91,180,0.18),transparent_42%)]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
              <Sparkles className="size-4" />
              Nairobi · Digital studio &amp; training lab
            </p>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] text-primary md:text-7xl">
              Learn the skills. Build the work.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              MØBIX Digital Lab combines hands-on technology courses with real digital product work.
              Sign in to explore your courses, projects, and studio updates.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth">
                  Sign in
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <ApplicationDialog className="h-10 px-7" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              New here? Create an account from the sign-in page.
            </p>
          </div>
          <div className="relative">
            <img
              src={studio}
              alt="Inside the MØBIX Digital Lab studio"
              className="aspect-[4/3] w-full rounded-4xl object-cover shadow-2xl"
            />
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-border bg-card px-5 py-4 shadow-xl sm:block">
              <p className="font-display text-2xl font-bold text-primary">Learn. Build. Launch.</p>
              <p className="mt-1 text-sm text-muted-foreground">One studio, two ways to grow.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
            What you'll find
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-primary md:text-5xl">
            A studio that works the way you do
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <LandingCard
            icon={GraduationCap}
            title="Practical courses"
            text="Short, focused training that takes you from first steps to confident practice."
            to="/courses"
            linkLabel="Browse courses"
          />
          <LandingCard
            icon={Laptop}
            title="Digital projects"
            text="Websites, design, and automations built with clear scope and honest handover."
            to="/services"
            linkLabel="See services"
          />
          <LandingCard
            icon={Sparkles}
            title="Local support"
            text="A Nairobi team that explains the work and stays available after launch."
            to="/contact"
            linkLabel="Talk to us"
          />
        </div>
      </section>
    </>
  );
}

function LandingCard({
  icon: Icon,
  title,
  text,
  to,
  linkLabel,
}: {
  icon: typeof GraduationCap;
  title: string;
  text: string;
  to: "/courses" | "/services" | "/contact";
  linkLabel: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-7">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-accent text-secondary">
        <Icon className="size-6" />
      </div>
      <h3 className="mt-5 font-display text-2xl font-bold text-primary">{title}</h3>
      <p className="mt-2 text-base leading-relaxed text-muted-foreground">{text}</p>
      <Link
        to={to}
        className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:underline"
      >
        {linkLabel}
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
