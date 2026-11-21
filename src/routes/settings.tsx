import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MØBIX Digital Lab" },
      { name: "description", content: "Manage your MØBIX Digital Lab account settings." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, loading, canManageStudio } = useAuth();

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20 text-muted-foreground">
        Loading settings…
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-base font-semibold text-secondary">MØBIX Digital Lab · Account</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-primary">Settings</h1>
      <p className="mt-4 text-muted-foreground">
        Review your account details and studio access from one place.
      </p>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <Detail label="Signed in as" value={user?.email ?? "Not signed in"} />
        <Detail label="Studio access" value={canManageStudio ? "Enabled" : "Not enabled"} />
      </dl>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/profile">View profile</Link>
        </Button>
        {canManageStudio && (
          <Button asChild>
            <Link to="/studio">Open studio dashboard</Link>
          </Button>
        )}
        {!user && (
          <Button asChild>
            <Link to="/auth">Sign in</Link>
          </Button>
        )}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Need to change your account details?{" "}
        <Link to="/contact" className="underline">
          Contact the studio
        </Link>
        .
      </p>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-base font-semibold text-foreground">{value}</dd>
    </div>
  );
}
