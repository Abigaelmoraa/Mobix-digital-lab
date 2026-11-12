import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from "@/lib/contact";

const nav = [
  { to: "/", label: "Studio" },
  { to: "/services", label: "Services" },
  { to: "/courses", label: "Courses" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-primary">
          MØBIX <span className="font-sans text-sm font-semibold text-secondary">Digital Lab</span>
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm font-medium">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:text-primary"
              activeProps={{ className: "bg-accent text-primary" }}
            >
              {n.label}
            </Link>
          ))}
          {!loading && (user
            ? <><Link to="/studio" className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:text-primary">Studio</Link><Button type="button" variant="ghost" size="sm" onClick={() => void signOut()}>Sign out</Button></>
            : <Link to="/auth" className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:text-primary">Sign in</Link>)}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold">MØBIX</p>
          <p className="mt-2 text-sm opacity-75">Digital Lab · Nairobi, Kenya</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Talk to us</p>
          <a href={PHONE_TEL} className="mt-2 block opacity-80 hover:opacity-100">Call {PHONE_DISPLAY}</a>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="block opacity-80 hover:opacity-100">WhatsApp</a>
        </div>
        <div className="text-sm opacity-75">© {new Date().getFullYear()} MØBIX Digital Lab</div>
      </div>
    </footer>
  );
}
