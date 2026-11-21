import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — MØBIX Digital Lab" },
      { name: "description", content: "Your MØBIX Digital Lab account profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20 text-muted-foreground">
        Loading profile…
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20">
        <h1 className="font-display text-4xl font-bold text-primary">Profile</h1>
        <p className="mt-4 text-muted-foreground">Sign in to view your account details.</p>
        <Button asChild className="mt-6">
          <Link to="/auth">Sign in</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-base font-semibold text-secondary">MØBIX Digital Lab · Account</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-primary">Your profile</h1>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <Detail label="Full name" value={user.full_name} />
        <Detail label="Email" value={user.email} />
        <Detail label="Phone" value={user.phone || "Not provided"} />
        <Detail label="Role" value={user.role.replace("_", " ")} />
      </dl>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/settings">Account settings</Link>
        </Button>
      </div>
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
