import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Account sign-in — MØBIX Digital Lab" },
      { name: "description", content: "Sign in or create a MØBIX Digital Lab account." },
      { property: "og:title", content: "Account sign-in — MØBIX Digital Lab" },
      { property: "og:description", content: "Sign in or create a MØBIX Digital Lab account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(255),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2, "Enter your full name.").max(120),
  phone: z.string().trim().max(40, "Phone number is too long."),
});

function AuthPage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    const input = Object.fromEntries(form.entries());
    const parsed = mode === "sign-in" ? signInSchema.safeParse(input) : signUpSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details.");
      return;
    }

    setBusy(true);
    if (mode === "sign-in") {
      const { error: authError } = await supabase.auth.signInWithPassword(parsed.data);
      setBusy(false);
      if (authError) {
        setError(authError.message.toLowerCase().includes("confirm")
          ? "Please confirm your email address before signing in."
          : "We couldn't sign you in. Check your email and password and try again.");
        return;
      }
      await navigate({ to: "/studio" });
      return;
    }

    const { error: authError, data } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: parsed.data.fullName, phone: parsed.data.phone },
      },
    });
    setBusy(false);
    if (authError) {
      setError("Account creation failed. Check your details and try again.");
      return;
    }
    if (!data.session) {
      setNotice("Your account was created. Check your email to confirm it, then sign in.");
      setMode("sign-in");
      return;
    }
    await navigate({ to: "/studio" });
  }

  if (loading) {
    return <div className="mx-auto max-w-lg px-5 py-20 text-sm text-muted-foreground">Checking account…</div>;
  }

  if (user) {
    return (
      <section className="mx-auto max-w-lg px-5 py-20">
        <p className="text-sm font-semibold text-secondary">MØBIX Digital Lab</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-primary">You’re signed in</h1>
        <p className="mt-3 text-muted-foreground">{user.email}</p>
        <Button className="mt-7" onClick={() => void navigate({ to: "/studio" })}>Open studio</Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-lg px-5 py-16 sm:py-24">
      <p className="text-sm font-semibold text-secondary">MØBIX Digital Lab</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-primary">
        {mode === "sign-in" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {mode === "sign-in" ? "Sign in to continue to your account." : "Your name and phone number are saved with your account."}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        {mode === "sign-up" && <>
          <Field label="Full name" name="fullName" autoComplete="name" maxLength={120} />
          <Field label="Phone number" name="phone" autoComplete="tel" maxLength={40} />
        </>}
        <Field label="Email" name="email" type="email" autoComplete="email" maxLength={255} />
        <Field label="Password" name="password" type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} minLength={8} maxLength={128} />
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {notice && <p role="status" className="text-sm text-secondary">{notice}</p>}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        {mode === "sign-in" ? "New to MØBIX?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setError(""); setNotice(""); }}
          className="font-semibold text-secondary underline underline-offset-4"
        >
          {mode === "sign-in" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </section>
  );
}

function Field({ label, name, ...props }: { label: string; name: string } & React.ComponentProps<typeof Input>) {
  const id = `auth-${name}`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} required {...props} />
    </div>
  );
}