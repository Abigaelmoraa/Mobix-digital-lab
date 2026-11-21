import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  Building2,
  GraduationCap,
  Laptop,
  MapPin,
  MessageCircle,
  Rocket,
  Sparkles,
  Users,
} from "lucide-react";

import studio from "@/assets/mobix-studio.jpg";
import { ApplicationDialog } from "@/components/application-dialog";
import { EnrollmentDialog } from "@/components/enrollment-dialog";
import { EmptyNote } from "@/components/listings";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { coursesQuery } from "@/lib/public-queries";
import type { PublicCourse } from "@/lib/public-content.functions";

export const Route = createFileRoute("/_public/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(coursesQuery),
  head: () => ({
    meta: [
      { title: "MØBIX Digital Lab — Practical technology training in Nairobi" },
      {
        name: "description",
        content:
          "Hands-on courses in software, web design, digital skills and AI, with online registration and flexible study paths.",
      },
      {
        property: "og:title",
        content: "MØBIX Digital Lab — Practical technology training in Nairobi",
      },
      {
        property: "og:description",
        content:
          "Hands-on courses in software, web design, digital skills and AI, with online registration and flexible study paths.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { data: courses } = useSuspenseQuery(coursesQuery);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-ink-foreground">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(12, 13, 20, 0.95) 0%, rgba(12, 13, 20, 0.78) 52%, rgba(12, 13, 20, 0.3) 100%), url(${studio})`,
          }}
          aria-hidden="true"
        />
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
            <Sparkles className="size-4" />
            Nairobi · Technology training studio
          </p>
          <h1 className="mt-7 max-w-4xl font-display text-5xl font-bold leading-[1.06] md:text-6xl">
            A hands-on tech school for software, design and digital skills
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
            MØBIX Digital Lab equips learners with practical technology skills through project-based
            courses, clear guidance, and training that matches real work. Learn at our Nairobi
            studio or join online.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ApplicationDialog label="Apply now" />
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link to="/courses">
                Browse courses
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-[1fr_1fr] md:py-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
              Our mission
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-primary md:text-4xl">
              Real skills, taught in practice
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-muted-foreground">
            We help beginners, career changers, and working professionals build useful digital
            skills. Every course combines clear explanation with hands-on work, so learners leave
            with something they can show — not just notes.
          </p>
          <div className="grid gap-6 sm:grid-cols-3 md:col-span-2">
            <MissionStat value="Practical" label="Project-based learning" />
            <MissionStat value="Flexible" label="In-person and online" />
            <MissionStat value="Local" label="Nairobi-based support" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
              Our courses
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold text-primary md:text-5xl">
              Programmes built around real outcomes
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Choose a course, register online, and our team will follow up with schedule and
              joining details.
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1 text-base font-semibold text-secondary hover:underline"
          >
            See all courses
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-10">
          {courses.length ? (
            <div className="grid gap-5 md:grid-cols-3">
              {courses.slice(0, 3).map((course) => (
                <LandingCourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <EmptyNote>New courses will be announced soon.</EmptyNote>
          )}
        </div>
      </section>

      <section className="bg-accent/40">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
            Study your way
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-primary md:text-5xl">
            Flexible learning paths
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Whether you want the energy of a classroom or the convenience of learning from anywhere,
            there is a path that fits.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <PathCard
              icon={Building2}
              title="In-person"
              text="Join us at the Nairobi studio for guided, face-to-face sessions and practical labs."
            />
            <PathCard
              icon={Laptop}
              title="Online"
              text="Attend live sessions from anywhere and keep the same practical, project-based approach."
            />
            <PathCard
              icon={Users}
              title="Hybrid"
              text="Mix studio days with remote learning when you need flexibility around work or study."
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
              Your path
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-primary md:text-5xl">
              Beginner-friendly to career-ready
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Start with the foundations, then move into focused programmes that help you build a
              portfolio and confidence.
            </p>
            <Button asChild className="mt-7">
              <Link to="/admissions">
                How admissions work
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            <PathStep
              icon={BookOpen}
              title="Start with the basics"
              text="Digital confidence, computer packages, and the essentials you need to begin."
            />
            <PathStep
              icon={GraduationCap}
              title="Choose a specialisation"
              text="Web design, software development, or AI training with clear milestones."
            />
            <PathStep
              icon={Rocket}
              title="Build and launch"
              text="Finish with practical projects you can show to employers or clients."
            />
          </div>
        </div>
      </section>

      <section className="bg-card py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">FAQ</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-primary">Common questions</h2>
          <Accordion type="single" collapsible className="mt-8">
            <AccordionItem value="modes">
              <AccordionTrigger>What study modes do you offer?</AccordionTrigger>
              <AccordionContent>
                In-person, online, and hybrid options. Each course card shows the duration and fee,
                and our team confirms the schedule during registration.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="courses">
              <AccordionTrigger>Which courses can I register for?</AccordionTrigger>
              <AccordionContent>
                Browse the course catalogue for current programmes in software, web design, digital
                skills, and AI. New courses are added as they are published.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="registration">
              <AccordionTrigger>How do I register?</AccordionTrigger>
              <AccordionContent>
                Choose a course and use the Register button. You can register with your details, and
                creating an account lets you track everything from your dashboard.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="support">
              <AccordionTrigger>Where is the studio?</AccordionTrigger>
              <AccordionContent>
                We are in Westlands, Nairobi, opposite The Alchemist. You can also reach us by phone
                or WhatsApp from the contact page.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 md:flex-row md:items-center md:justify-between md:py-20">
          <div>
            <MessageCircle className="size-8 text-secondary" />
            <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">
              Ready to start learning?
            </h2>
            <p className="mt-3 max-w-xl text-lg opacity-80">
              Register for a course or talk to us about the right path for your goals.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/admissions">Apply now</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/contact">
                <MapPin aria-hidden="true" />
                Contact us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function MissionStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <p className="font-display text-2xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function LandingCourseCard({ course }: { course: PublicCourse }) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-border bg-card p-7">
      <div className="flex flex-wrap gap-2 text-sm font-semibold">
        <span className="rounded-full bg-accent px-3 py-1 text-primary">{course.level}</span>
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
          {course.category}
        </span>
      </div>
      <h3 className="mt-5 font-display text-2xl font-bold leading-tight text-primary">
        {course.title}
      </h3>
      <p className="mt-3 flex-1 text-base leading-relaxed text-muted-foreground">
        {course.description}
      </p>
      <p className="mt-5 text-sm text-muted-foreground">
        {course.duration || "Duration on enquiry"}
      </p>
      <EnrollmentDialog course={course} className="mt-5 w-full" label="Register now" />
    </article>
  );
}

function PathCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Building2;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-7">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-accent text-secondary">
        <Icon className="size-6" />
      </div>
      <h3 className="mt-5 font-display text-xl font-bold text-primary">{title}</h3>
      <p className="mt-2 text-base leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function PathStep({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof BookOpen;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4 rounded-3xl border border-border bg-card p-6">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-secondary">
        <Icon className="size-5" />
      </div>
      <div>
        <h3 className="font-display text-lg font-bold text-primary">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
