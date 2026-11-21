import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";

import { EmptyNote, LoadError } from "@/components/listings";
import { useAuth } from "@/hooks/use-auth";
import { coursesQuery, servicesQuery } from "@/lib/public-queries";

export const Route = createFileRoute("/_authenticated/home")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(servicesQuery),
      context.queryClient.ensureQueryData(coursesQuery),
    ]),
  head: () => ({
    meta: [
      { title: "Dashboard — MØBIX Digital Lab" },
      {
        name: "description",
        content: "Your MØBIX Digital Lab dashboard for courses, services, and studio updates.",
      },
    ],
  }),
  errorComponent: LoadError,
  component: Dashboard,
});

function Dashboard() {
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: courses } = useSuspenseQuery(coursesQuery);
  const { user, canManageStudio } = useAuth();

  const firstName = user?.full_name.trim().split(/\s+/)[0] ?? "there";
  const today = new Intl.DateTimeFormat("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const actions = [
    {
      title: "Browse courses",
      text: "Find practical training you can start right away.",
      icon: GraduationCap,
      to: "/courses",
    },
    {
      title: "Explore services",
      text: "See what the studio can design, build, and automate.",
      icon: BriefcaseBusiness,
      to: "/services",
    },
    {
      title: "Send an enquiry",
      text: "Tell us about a project or a class you have in mind.",
      icon: MessageCircle,
      to: "/contact",
    },
    ...(canManageStudio
      ? [
          {
            title: "Studio admin",
            text: "Manage published content and studio activity.",
            icon: LayoutDashboard,
            to: "/studio" as const,
          },
        ]
      : []),
    {
      title: "Your profile",
      text: "Update the details saved on your account.",
      icon: UserRound,
      to: "/profile",
    },
    {
      title: "Settings",
      text: "Adjust your account preferences.",
      icon: Settings,
      to: "/settings",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <section className="overflow-hidden rounded-4xl border border-border bg-[radial-gradient(circle_at_top_right,rgba(180,91,180,0.2),transparent_45%)] bg-card p-7 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-secondary">
              <Sparkles className="size-4" />
              Your workspace
            </p>
            <h1 className="mt-5 font-display text-4xl font-bold text-primary md:text-5xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Here is what is happening at MØBIX Digital Lab. Pick up where you left off or explore
              something new.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background px-5 py-4 text-base shadow-sm">
            <p className="flex items-center gap-2 font-semibold text-primary">
              <CalendarDays className="size-4 text-secondary" />
              Today
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{today}</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Published courses"
          value={String(courses.length)}
          hint="Available to learners"
        />
        <StatCard
          icon={BriefcaseBusiness}
          label="Studio services"
          value={String(services.length)}
          hint="Ready to explore"
        />
        <StatCard
          icon={CheckCircle2}
          label="Account status"
          value="Active"
          hint="Signed in and ready"
        />
        <StatCard
          icon={LayoutDashboard}
          label="Your access"
          value={canManageStudio ? "Admin" : (user?.role ?? "Member")}
          hint={canManageStudio ? "Studio management enabled" : "Standard member access"}
        />
      </section>

      <section className="mt-10">
        <SectionHeading title="Quick actions" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map(({ title, text, icon: Icon, to }) => (
            <Link
              key={title}
              to={to}
              className="group rounded-3xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <div className="flex size-11 items-center justify-center rounded-2xl bg-accent text-secondary">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-primary">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-secondary group-hover:underline">
                Open
                <ArrowRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <PreviewPanel title="Latest courses" to="/courses" linkLabel="All courses">
          {courses.length ? (
            <ul className="divide-y divide-border">
              {courses.slice(0, 4).map((course) => (
                <li
                  key={course.id}
                  className="flex items-center justify-between gap-4 py-4 first:pt-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-primary">{course.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {course.level} · {course.duration || "Duration on enquiry"}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-secondary">
                    {course.is_free ? "Free" : "Paid"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyNote>New courses will be announced soon.</EmptyNote>
          )}
        </PreviewPanel>

        <PreviewPanel title="Studio services" to="/services" linkLabel="All services">
          {services.length ? (
            <ul className="divide-y divide-border">
              {services.slice(0, 4).map((service) => (
                <li key={service.id} className="py-4 first:pt-0">
                  <p className="font-semibold text-primary">{service.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{service.category}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyNote>Our service list is being prepared.</EmptyNote>
          )}
        </PreviewPanel>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-accent text-secondary">
        <Icon className="size-5" />
      </div>
      <p className="mt-5 text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="font-display text-2xl font-bold text-primary md:text-3xl">{title}</h2>
    </div>
  );
}

function PreviewPanel({
  title,
  to,
  linkLabel,
  children,
}: {
  title: string;
  to: "/courses" | "/services";
  linkLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-7">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
        <h2 className="font-display text-xl font-bold text-primary">{title}</h2>
        <Link
          to={to}
          className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:underline"
        >
          {linkLabel}
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="pt-5">{children}</div>
    </div>
  );
}
