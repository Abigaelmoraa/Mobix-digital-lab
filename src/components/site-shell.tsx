import { Link, useNavigate } from "@tanstack/react-router";
import { Facebook, Instagram, MapPin, MessageCircle, Send } from "lucide-react";

import { ApplicationDialog } from "@/components/application-dialog";
import { MobixLogo } from "@/components/mobix-logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

const nav = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/courses", label: "Courses" },
  { to: "/contact", label: "Contact" },
] as const;

const LOCATION_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "Westlands opposite The Alchemist Nairobi Kenya",
)}`;

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.08z" />
    </svg>
  );
}

export function SiteHeader() {
  const { user, loading, signOut: signUserOut } = useAuth();
  const navigate = useNavigate();

  async function signOut() {
    await signUserOut();
    await navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
        <Link to="/" aria-label="MØBIX Digital Lab home">
          <MobixLogo />
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-base font-medium">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-full px-4 py-2 text-muted-foreground transition-colors hover:text-primary"
              activeProps={{ className: "bg-accent text-primary" }}
            >
              {n.label}
            </Link>
          ))}
          <ApplicationDialog />
          {!loading &&
            (user ? (
              <>
                <Link
                  to="/studio"
                  className="rounded-full px-4 py-2 text-muted-foreground transition-colors hover:text-primary"
                >
                  Dashboard
                </Link>
                <Button type="button" variant="ghost" onClick={() => void signOut()}>
                  Sign out
                </Button>
              </>
            ) : (
              <Link
                to="/auth"
                className="rounded-full px-4 py-2 text-muted-foreground transition-colors hover:text-primary"
              >
                Sign in
              </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" aria-label="MØBIX Digital Lab home">
            <MobixLogo inverse />
          </Link>
          <p className="mt-3 text-base opacity-75">Nairobi, Kenya</p>
          <p className="mt-6 text-base opacity-75">
            © {new Date().getFullYear()} MØBIX Digital Lab
          </p>
        </div>
        <div className="text-base">
          <p className="font-semibold">Find us</p>
          <a
            href={LOCATION_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-start gap-2 opacity-80 hover:opacity-100"
          >
            <MapPin className="mt-1 size-5 shrink-0 text-secondary" />
            <span>Westlands, opposite The Alchemist, Nairobi</span>
          </a>
          <Link
            to="/contact"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 font-semibold opacity-80 hover:opacity-100"
          >
            <Send className="size-4 text-secondary" />
            Apply online
          </Link>
        </div>
        <div className="text-base">
          <p className="font-semibold">Talk to us</p>
          <a href={PHONE_TEL} className="mt-3 block opacity-80 hover:opacity-100">
            Call {PHONE_DISPLAY}
          </a>
          <p className="mt-2 opacity-75">We reply during studio hours.</p>
        </div>
        <div>
          <p className="text-base font-semibold">Follow us</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span
              role="img"
              aria-label="Facebook"
              title="Facebook"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 opacity-80"
            >
              <Facebook className="size-4 text-secondary" />
              Facebook
            </span>
            <span
              role="img"
              aria-label="Instagram"
              title="Instagram"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 opacity-80"
            >
              <Instagram className="size-4 text-secondary" />
              Instagram
            </span>
            <span
              role="img"
              aria-label="TikTok"
              title="TikTok"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 opacity-80"
            >
              <TikTokIcon className="size-4 text-secondary" />
              TikTok
            </span>
            <span
              role="img"
              aria-label="WhatsApp"
              title="WhatsApp"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 opacity-80"
            >
              <MessageCircle className="size-4 text-secondary" />
              WhatsApp
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
