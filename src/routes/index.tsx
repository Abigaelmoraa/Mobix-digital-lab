import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  GraduationCap,
  Lightbulb,
  MessageCircle,
  Palette,
  Sparkles,
  Users,
} from "lucide-react";

import studio from "@/assets/mobix-studio.jpg";
import { CourseCard, EmptyNote, LoadError, ServiceCard } from "@/components/listings";
import { WHATSAPP_URL } from "@/lib/contact";
import { coursesQuery, servicesQuery } from "@/lib/public-queries";

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(servicesQuery),
      context.queryClient.ensureQueryData(coursesQuery),
    ]),
  head: () => ({
    meta: [
      { title: "MØBIX Digital Lab — Digital studio in Nairobi" },
      {
        name: "description",
        content:
          "MØBIX Digital Lab builds digital solutions and runs practical technology courses in Nairobi, Kenya.",
      },
      { property: "og:title", content: "MØBIX Digital Lab — Digital studio in Nairobi" },
      {
        property: "og:description",
        content:
          "MØBIX Digital Lab builds digital solutions and runs practical technology courses in Nairobi, Kenya.",
      },
    ],
  }),
  errorComponent: LoadError,
  component: Home,
});

const features = [
  {
    icon: Palette,
    title: "Design with purpose",
    text: "Clear, usable interfaces shaped around the people who will actually use them.",
  },
  {
    icon: Code2,
    title: "Built to last",
    text: "Practical engineering, careful handover, and room to grow after launch.",
  },
  {
    icon: GraduationCap,
    title: "Skills you keep",
    text: "Hands-on training that takes learners from first steps to confident practice.",
  },
];

const steps = [
  {
    icon: MessageCircle,
    title: "Tell us the goal",
    text: "Share the project, the learners, or the problem you want solved.",
  },
  {
    icon: Lightbulb,
    title: "Shape the approach",
    text: "We agree on scope, timeline, and the simplest route to a useful result.",
  },
  {
    icon: CheckCircle2,
    title: "Build and hand over",
    text: "We deliver, test together, and leave you with everything needed to continue.",
  },
];

function Home() {
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: courses } = useSuspenseQuery(coursesQuery);

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
              Digital work, built with care. Skills, taught in practice.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              MØBIX Digital Lab helps businesses launch useful digital products and helps learners
              gain technology skills they can actually use.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Start an enquiry
                <ArrowRight className="size-5" />
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-secondary px-7 py-4 text-base font-semibold text-secondary transition hover:bg-accent"
              >
                <MessageCircle className="size-5" />
                Chat on WhatsApp
              </a>
            </div>
            <div className="mt-10 grid gap-4 border-t border-border pt-8 sm:grid-cols-3">
              <Stat value="1:1" label="Project attention" />
              <Stat value="Practical" label="Training approach" />
              <Stat value="Local" label="Nairobi based" />
            </div>
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
        <SectionIntro
          eyebrow="What we do"
          title="One lab, built for making things happen"
          text="We work with founders, teams, and curious learners. The thread is always the same: useful outcomes, explained clearly."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl border border-border bg-card p-7">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-accent text-secondary">
                <Icon className="size-6" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold text-primary">{title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 md:pb-20">
        <Heading title="Services" to="/services" />
        {services.length ? (
          <div className="grid gap-5 md:grid-cols-3">
            {services.slice(0, 3).map((s) => (
              <ServiceCard key={s.id} s={s} />
            ))}
          </div>
        ) : (
          <EmptyNote>
            Our service list is being prepared. Contact us to discuss your project.
          </EmptyNote>
        )}
      </section>

      <section className="bg-accent py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Heading title="Courses" to="/courses" />
          {courses.length ? (
            <div className="grid gap-5 md:grid-cols-3">
              {courses.slice(0, 3).map((c) => (
                <CourseCard key={c.id} c={c} />
              ))}
            </div>
          ) : (
            <EmptyNote>New courses will be announced soon.</EmptyNote>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <SectionIntro
          eyebrow="How we work"
          title="A clear path from idea to outcome"
          text="No jargon, no mystery. Just a focused process that keeps the goal visible."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <div key={title} className="relative rounded-3xl border border-border bg-card p-7">
              <span className="font-display text-5xl font-bold text-secondary/20">
                0{index + 1}
              </span>
              <Icon className="mt-3 size-7 text-secondary" />
              <h3 className="mt-4 text-xl font-bold text-primary">{title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 py-16 md:flex-row md:items-center md:py-20">
          <div className="max-w-2xl">
            <Users className="size-8 text-secondary" />
            <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">
              Have a project or a class in mind?
            </h2>
            <p className="mt-3 text-lg opacity-80">
              Tell us what you are working on. We will help you find the next practical step.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-primary-foreground px-7 py-4 text-base font-semibold text-primary"
            >
              Send an enquiry
              <ArrowRight className="size-5" />
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-current px-7 py-4 text-base font-semibold"
            >
              <MessageCircle className="size-5" />
              WhatsApp us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold text-primary">{value}</p>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

function SectionIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-primary md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function Heading({ title, to }: { title: string; to: "/services" | "/courses" }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">{title}</h2>
      <Link
        to={to}
        className="inline-flex items-center gap-1 text-base font-semibold text-secondary hover:underline"
      >
        See all
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
