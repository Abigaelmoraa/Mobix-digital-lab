import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Search,
  Sparkles,
  Wallet,
} from "lucide-react";

import { EmptyNote, LoadError } from "@/components/listings";
import { EnrollmentDialog } from "@/components/enrollment-dialog";
import { Input } from "@/components/ui/input";
import { formatKes } from "@/lib/contact";
import { coursesQuery } from "@/lib/public-queries";
import type { PublicCourse } from "@/lib/public-content.functions";

export const Route = createFileRoute("/_public/courses")({
  loader: ({ context }) => context.queryClient.ensureQueryData(coursesQuery),
  head: () => ({
    meta: [
      { title: "Courses — MØBIX Digital Lab" },
      {
        name: "description",
        content: "Practical technology courses in Nairobi, with levels, durations and fees in KES.",
      },
      { property: "og:title", content: "Courses — MØBIX Digital Lab" },
      {
        property: "og:description",
        content: "Practical technology courses in Nairobi, with levels, durations and fees in KES.",
      },
    ],
  }),
  errorComponent: LoadError,
  component: Courses,
});

function Courses() {
  const { data } = useSuspenseQuery(coursesQuery);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All courses");

  const categories = useMemo(
    () => ["All courses", ...new Set(data.map((course) => course.category).filter(Boolean))],
    [data],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.filter((course) => {
      const matchesCategory = category === "All courses" || course.category === category;
      const matchesTerm =
        !term ||
        [course.title, course.description, course.level, course.category]
          .join(" ")
          .toLowerCase()
          .includes(term);
      return matchesCategory && matchesTerm;
    });
  }, [category, data, search]);

  const freeCount = data.filter((course) => course.is_free).length;

  return (
    <div>
      <section className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(180,91,180,0.16),transparent_42%)]">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-secondary">
            <Sparkles className="size-4" />
            Learn with MØBIX
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold leading-tight text-primary md:text-6xl">
            Practical courses, taught in practice
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Browse our current courses, compare levels and fees, and register online in a few
            minutes. Our team will follow up with the next steps.
          </p>
          <div className="mt-9 flex flex-wrap gap-6 text-base">
            <HeroStat icon={BookOpen} value={String(data.length)} label="Courses available" />
            <HeroStat
              icon={GraduationCap}
              value={String(categories.length - 1)}
              label="Categories"
            />
            <HeroStat icon={Wallet} value={String(freeCount)} label="Free courses" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-primary">Course catalogue</h2>
            <p className="mt-2 text-base text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "course" : "courses"} found
            </p>
          </div>
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search courses"
              className="pl-9"
              aria-label="Search courses"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                category === item
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-primary"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-9">
          {filtered.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((course) => (
                <CourseCatalogCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <EmptyNote>
              No courses match your search. Try a different keyword or category.
            </EmptyNote>
          )}
        </div>
      </section>

      <section className="border-t border-border bg-accent/40">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="font-display text-3xl font-bold text-primary">How registration works</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Step
              icon={Search}
              title="Choose a course"
              text="Compare the level, duration, topics, and fee before you register."
            />
            <Step
              icon={CheckCircle2}
              title="Register online"
              text="Send your details using the registration button on any course card."
            />
            <Step
              icon={CalendarDays}
              title="We follow up"
              text="The studio team contacts you with schedule, payment, and joining details."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof BookOpen;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-2xl bg-accent text-secondary">
        <Icon className="size-5" />
      </span>
      <span>
        <span className="block font-display text-2xl font-bold text-primary">{value}</span>
        <span className="block text-sm text-muted-foreground">{label}</span>
      </span>
    </div>
  );
}

function Step({ icon: Icon, title, text }: { icon: typeof BookOpen; title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-accent text-secondary">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-5 font-display text-xl font-bold text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function CourseCatalogCard({ course }: { course: PublicCourse }) {
  const price = course.is_free
    ? "Free"
    : course.price_kes != null
      ? formatKes(course.price_kes)
      : "Fee on enquiry";
  const highlights = course.learning_outcomes.length ? course.learning_outcomes : course.topics;

  return (
    <article className="flex h-full flex-col rounded-3xl border border-border bg-card p-7 transition-shadow hover:shadow-lg">
      <div className="flex flex-wrap gap-2 text-sm font-semibold">
        <span className="rounded-full bg-accent px-3 py-1 text-primary">{course.level}</span>
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
          {course.category}
        </span>
        {course.is_free && (
          <span className="rounded-full bg-secondary/15 px-3 py-1 text-secondary">Free</span>
        )}
      </div>
      <h3 className="mt-5 font-display text-2xl font-bold leading-tight text-primary">
        {course.title}
      </h3>
      <p className="mt-3 flex-1 text-base leading-relaxed text-muted-foreground">
        {course.description}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4 border-y border-border py-5 text-sm">
        <div>
          <p className="text-muted-foreground">Duration</p>
          <p className="mt-1 font-semibold text-primary">{course.duration || "To be confirmed"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Fee</p>
          <p className="mt-1 font-semibold text-secondary">{price}</p>
        </div>
      </div>
      {highlights.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            What you&apos;ll gain
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {highlights.slice(0, 3).map((item) => (
              <li key={item} className="flex gap-2 text-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-7 flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">Online registration</span>
        <EnrollmentDialog course={course} label="Register" />
      </div>
    </article>
  );
}
