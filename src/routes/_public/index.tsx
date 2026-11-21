import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, Laptop, Sparkles } from "lucide-react";

import studio from "@/assets/mobix-studio.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_public/")({
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
      <section className="relative isolate overflow-hidden bg-ink text-ink-foreground">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(12, 13, 20, 0.94) 0%, rgba(12, 13, 20, 0.74) 48%, rgba(12, 13, 20, 0.28) 100%), url(${studio})`,
          }}
          aria-hidden="true"
        />
        <div className="mx-auto max-w-6xl px-5 py-24 md:py-36">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
            <Sparkles className="size-4" />
            Nairobi · Digital studio &amp; training lab
          </p>
          <h1 className="mt-7 max-w-3xl font-display text-5xl font-bold leading-[1.05] md:text-7xl">
            Learn the skills. Build the work.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
            MØBIX Digital Lab pairs practical technology training with real digital projects. Create
            an account to follow your courses, projects, and studio updates in one place.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link to="/auth" search={{ mode: "sign-up" }}>
                Get started
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <p className="mt-5 text-sm text-white/60">
            Already registered? Sign in to open your dashboard.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
            What you&apos;ll find
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-primary md:text-5xl">
            A studio that works the way you do
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Explore short courses, see what we can build together, and reach the team directly — all
            from one place.
          </p>
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
