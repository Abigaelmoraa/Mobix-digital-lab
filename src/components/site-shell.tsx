import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CircleUserRound,
  Facebook,
  Instagram,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  MessageCircle,
  Send,
  Settings,
  UserRound,
} from "lucide-react";

import { ApplicationDialog } from "@/components/application-dialog";
import { MobixLogo } from "@/components/mobix-logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/courses", label: "Courses" },
  { to: "/services", label: "Services" },
  { to: "/admissions", label: "Admissions" },
  { to: "/contact", label: "Contact" },
] as const;

const LOCATION_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "Westlands opposite The Alchemist Nairobi Kenya",
)}`;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.08z" />
    </svg>
  );
}

export function SiteHeader() {
  const { user, canManageStudio, signOut } = useAuth();
  const navigate = useNavigate();
  const initials = user ? getInitials(user.full_name) : "";

  async function logOut() {
    await signOut();
    await navigate({ to: "/", replace: true });
  }

  const navLinks = (
    <>
      {nav.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: item.to === "/" }}
          activeProps={{ className: "font-semibold text-primary" }}
          className="whitespace-nowrap transition-colors hover:text-primary"
        >
          {item.label}
        </Link>
      ))}
      {canManageStudio && (
        <Link
          to="/studio"
          activeProps={{ className: "font-semibold text-primary" }}
          className="whitespace-nowrap transition-colors hover:text-primary"
        >
          Studio admin
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-6">
          <Link to="/" aria-label="MØBIX Digital Lab home">
            <MobixLogo />
          </Link>
          <nav
            className="hidden items-center gap-5 text-sm font-medium text-muted-foreground md:flex"
            aria-label="Dashboard navigation"
          >
            {navLinks}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                className="relative"
              >
                <Bell aria-hidden="true" />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-secondary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <p className="px-2 py-3 text-sm text-muted-foreground">You're all caught up.</p>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" aria-label="Account menu">
                <Avatar className="size-8">
                  <AvatarFallback>
                    {initials || <CircleUserRound aria-hidden="true" className="size-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <span className="block truncate">{user?.full_name ?? "Guest"}</span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {user?.email ?? "Not signed in"}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => void navigate({ to: "/profile" })}>
                <UserRound aria-hidden="true" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void navigate({ to: "/settings" })}>
                <Settings aria-hidden="true" />
                Settings
              </DropdownMenuItem>
              {canManageStudio && (
                <DropdownMenuItem onSelect={() => void navigate({ to: "/studio" })}>
                  <LayoutDashboard aria-hidden="true" />
                  Studio admin
                </DropdownMenuItem>
              )}
              {user ? (
                <DropdownMenuItem onSelect={() => void logOut()}>
                  <LogOut aria-hidden="true" />
                  Sign out
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onSelect={() => void navigate({ to: "/auth" })}>
                  <LogIn aria-hidden="true" />
                  Sign in
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <nav
          className="order-3 flex w-full gap-4 overflow-x-auto border-t border-border pt-3 text-sm font-medium text-muted-foreground md:hidden"
          aria-label="Dashboard navigation mobile"
        >
          {navLinks}
        </nav>
      </div>
    </header>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="min-h-[70vh] px-5 py-8">{children}</main>
    </div>
  );
}

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link to="/" aria-label="MØBIX Digital Lab home">
          <MobixLogo />
        </Link>
        <nav className="hidden items-center gap-6 text-base font-medium text-muted-foreground md:flex">
          {nav.map((item) => (
            <Link key={item.to} to={item.to} className="transition-colors hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>
        <ApplicationDialog label="Apply now" />
      </div>
    </header>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="min-h-[70vh]">{children}</main>
      <SiteFooter />
    </div>
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
