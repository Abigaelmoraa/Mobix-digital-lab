import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { servicesQuery } from "@/lib/public-queries";
import { EmptyNote, LoadError, ServiceCard } from "@/components/listings";

export const Route = createFileRoute("/services")({
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  head: () => ({
    meta: [
      { title: "Services — MØBIX Digital Lab" },
      {
        name: "description",
        content:
          "Digital services from MØBIX Digital Lab in Nairobi. Tell us about your project for a tailored quotation.",
      },
      { property: "og:title", content: "Services — MØBIX Digital Lab" },
      {
        property: "og:description",
        content:
          "Digital services from MØBIX Digital Lab in Nairobi. Tell us about your project for a tailored quotation.",
      },
    ],
  }),
  errorComponent: LoadError,
  component: Services,
});

function Services() {
  const { data } = useSuspenseQuery(servicesQuery);
  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <h1 className="font-display text-5xl font-bold text-primary">Services</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        Every project is quoted to its scope. Share what you need and we will reply with next steps.
      </p>
      <div className="mt-10">
        {data.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.map((s) => (
              <ServiceCard key={s.id} s={s} />
            ))}
          </div>
        ) : (
          <EmptyNote>Our service list is being prepared.</EmptyNote>
        )}
      </div>
      <Link
        to="/contact"
        className="mt-10 inline-block rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground"
      >
        Request a quotation
      </Link>
    </div>
  );
}
