import type { PublicCourse, PublicService } from "@/lib/public-content.functions";
import { formatKes } from "@/lib/contact";

export function ServiceCard({ s }: { s: PublicService }) {
  return (
    <article className="rounded-3xl border border-border bg-card p-7 transition-shadow hover:shadow-lg">
      <p className="text-sm font-semibold uppercase tracking-widest text-secondary">{s.category}</p>
      <h3 className="mt-3 font-display text-2xl font-bold text-primary">{s.title}</h3>
      {s.description && (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{s.description}</p>
      )}
      {s.deliverables.length > 0 && (
        <ul className="mt-4 space-y-2 text-base">
          {s.deliverables.map((d) => (
            <li key={d} className="before:mr-2 before:text-secondary before:content-['—']">
              {d}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export function CourseCard({ c }: { c: PublicCourse }) {
  const price = c.is_free
    ? "Free"
    : c.price_kes != null
      ? formatKes(c.price_kes)
      : "Fee on enquiry";
  return (
    <article className="flex flex-col rounded-3xl border border-border bg-card p-7">
      <div className="flex flex-wrap gap-2 text-sm font-semibold">
        <span className="rounded-full bg-accent px-3 py-1 text-primary">{c.level}</span>
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">{c.category}</span>
      </div>
      <h3 className="mt-4 font-display text-2xl font-bold text-primary">{c.title}</h3>
      {c.description && (
        <p className="mt-3 flex-1 text-base leading-relaxed text-muted-foreground">
          {c.description}
        </p>
      )}
      <div className="mt-6 flex items-end justify-between gap-3 border-t border-border pt-5 text-base">
        <span className="text-muted-foreground">{c.duration || "Duration to be confirmed"}</span>
        <span className="font-semibold text-secondary">{price}</span>
      </div>
    </article>
  );
}

export function EmptyNote({ children }: { children: string }) {
  return (
    <p className="rounded-3xl border border-dashed border-border bg-muted/50 p-8 text-center text-base text-muted-foreground">
      {children}
    </p>
  );
}

export function LoadError() {
  return (
    <EmptyNote>
      This list could not be loaded right now. Please refresh or contact us on WhatsApp.
    </EmptyNote>
  );
}
