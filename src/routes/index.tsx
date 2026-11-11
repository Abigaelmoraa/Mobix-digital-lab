import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import studio from "@/assets/mobix-studio.jpg";
import { coursesQuery, servicesQuery } from "@/lib/public-queries";
import { CourseCard, EmptyNote, LoadError, ServiceCard } from "@/components/listings";
import { WHATSAPP_URL } from "@/lib/contact";

export const Route = createFileRoute("/")({
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(servicesQuery), context.queryClient.ensureQueryData(coursesQuery)]),
  head: () => ({
    meta: [
      { title: "MØBIX Digital Lab — Digital studio in Nairobi" },
      { name: "description", content: "MØBIX Digital Lab builds digital solutions and runs practical technology courses in Nairobi, Kenya." },
      { property: "og:title", content: "MØBIX Digital Lab — Digital studio in Nairobi" },
      { property: "og:description", content: "MØBIX Digital Lab builds digital solutions and runs practical technology courses in Nairobi, Kenya." },
      { property: "og:url", content: "https://exact-look-screen-studio.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://exact-look-screen-studio.lovable.app/" }],
  }),
  errorComponent: LoadError,
  component: Home,
});

function Home() {
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: courses } = useSuspenseQuery(coursesQuery);
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">Nairobi · Kenya</p>
          <h1 className="mt-4 font-display text-5xl font-bold leading-[1.05] text-primary md:text-6xl">Digital work, built with care. Skills, taught in practice.</h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">MØBIX Digital Lab is a Nairobi studio offering digital services and hands-on technology courses.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/contact" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">Start an enquiry</Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="rounded-full border border-secondary px-6 py-3 text-sm font-semibold text-secondary hover:bg-accent">Chat on WhatsApp</a>
          </div>
        </div>
        <img src={studio} alt="Inside the MØBIX Digital Lab studio" className="aspect-[4/3] w-full rounded-3xl object-cover shadow-2xl" />
      </section>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <Heading title="Services" to="/services" />
        {services.length ? <div className="grid gap-5 md:grid-cols-3">{services.slice(0, 3).map((s) => <ServiceCard key={s.id} s={s} />)}</div> : <EmptyNote>Our service list is being prepared. Contact us to discuss your project.</EmptyNote>}
      </section>
      <section className="bg-accent py-16">
        <div className="mx-auto max-w-6xl px-5">
          <Heading title="Courses" to="/courses" />
          {courses.length ? <div className="grid gap-5 md:grid-cols-3">{courses.slice(0, 3).map((c) => <CourseCard key={c.id} c={c} />)}</div> : <EmptyNote>New courses will be announced soon.</EmptyNote>}
        </div>
      </section>
    </>
  );
}

function Heading({ title, to }: { title: string; to: "/services" | "/courses" }) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <h2 className="font-display text-3xl font-bold text-primary">{title}</h2>
      <Link to={to} className="text-sm font-semibold text-secondary hover:underline">See all →</Link>
    </div>
  );
}
