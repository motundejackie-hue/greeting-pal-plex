import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LogIn, LogOut, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { AppShell } from "@/components/tv/AppShell";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — Opencast" },
      { name: "description", content: "Sign in to sync your Opencast favorites, recents and channel edits across devices." },
      { property: "og:title", content: "Sign in — Opencast" },
      { property: "og:description", content: "Sync your favorites and channel edits across every device." },
    ],
  }),
});

function AuthPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    setBusy(false);
    if (result.error) setMessage("Google sign-in failed. Try again.");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const fn =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/` },
          });
    const { error } = await fn;
    setBusy(false);
    setMessage(error ? error.message : mode === "signup" ? "Check your inbox to confirm." : "Signed in.");
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-sm px-4 py-10">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          {user ? "Your account" : "Sign in to Opencast"}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {user ? user.email : "Sync favorites, recents and your channel edits everywhere."}
        </p>

        {user ? (
          <button
            type="button"
            onClick={() => void supabase.auth.signOut()}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => void google()}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-ember disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" /> Continue with Google
            </button>

            <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or email <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={submit} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email"
                className="w-full rounded-md bg-secondary px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                aria-label="Password"
                className="w-full rounded-md bg-secondary px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground disabled:opacity-60"
              >
                <Mail className="h-4 w-4" /> {mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="mt-3 w-full text-center text-xs text-muted-foreground underline"
            >
              {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </>
        )}

        {message ? <p className="mt-4 text-center text-xs text-primary">{message}</p> : null}
      </div>
    </AppShell>
  );
}
