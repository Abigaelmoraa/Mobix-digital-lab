import type { PublicCourse, PublicService } from "@/lib/public-content.functions";
import { formatKes } from "@/lib/contact";

export function ServiceCard({ s }: { s: PublicService }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-widest text-secondary">{s.category}</p>
      <h3 className="mt-2 font-display text-xl font-bold text-primary">{s.title}</h3>
      {s.description && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.description}</p>}
      {s.deliverables.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm">
          {s.deliverables.map((d) => <li key={d} className="before:mr-2 before:text-secondary before:content-['—']">{d}</li>)}
        </ul>
      )}
    </article>
  );
}

export function CourseCard({ c }: { c: PublicCourse }) {
  const price = c.is_free ? "Free" : c.price_kes != null ? formatKes(c.price_kes) : "Fee on enquiry";
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full bg-accent px-2.5 py-1 text-primary">{c.level}</span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">{c.category}</span>
      </div>
      <h3 className="mt-3 font-display text-xl font-bold text-primary">{c.title}</h3>
      {c.description && <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{c.description}</p>}
      <div className="mt-5 flex items-end justify-between border-t border-border pt-4 text-sm">
        <span className="text-muted-foreground">{c.duration || "Duration to be confirmed"}</span>
        <span className="font-semibold text-secondary">{price}</span>
      </div>
    </article>
  );
}

export function EmptyNote({ children }: { children: string }) {
  return <p className="rounded-2xl border border-dashed border-border bg-muted/50 p-8 text-center text-sm text-muted-foreground">{children}</p>;
}

export function LoadError() {
  return <EmptyNote>This list could not be loaded right now. Please refresh or contact us on WhatsApp.</EmptyNote>;
}
