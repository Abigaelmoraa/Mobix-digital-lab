import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { coursesQuery } from "@/lib/public-queries";
import { CourseCard, EmptyNote, LoadError } from "@/components/listings";

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
  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <h1 className="font-display text-5xl font-bold text-primary">Courses</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        Hands-on learning, taught in practice. Fees are shown in Kenyan Shillings.
      </p>
      <div className="mt-10">
        {data.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.map((c) => (
              <CourseCard key={c.id} c={c} />
            ))}
          </div>
        ) : (
          <EmptyNote>New courses will be announced soon.</EmptyNote>
        )}
      </div>
      <Link
        to="/contact"
        className="mt-10 inline-block rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground"
      >
        Ask about a course
      </Link>
    </div>
  );
}
