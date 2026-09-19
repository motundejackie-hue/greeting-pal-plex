import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, ShieldCheck, Trash2, Play, ImagePlus, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/tv/AppShell";
import { PlayerModal } from "@/components/tv/PlayerModal";
import { searchChannels } from "@/lib/iptv.functions";
import type { Channel } from "@/lib/channel-types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { hideChannel, restoreChannel, useHiddenChannels } from "@/lib/hidden-channels";
import { setLogoOverride } from "@/lib/logo-overrides";

const ADMIN_EMAIL = "erokmary@gmail.com";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin Console — Opencast" },
      {
        name: "description",
        content:
          "Opencast admin console: search channels, test playback, update artwork and remove dead stations.",
      },
      { property: "og:title", content: "Admin Console — Opencast" },
      { property: "og:description", content: "Manage Opencast channels, artwork and playback." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="p-8 text-sm text-muted-foreground">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-8 text-sm text-muted-foreground">Nothing here.</div>,
});

function AdminPage() {
  const { user, loading } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;

  if (loading) {
    return (
      <AppShell>
        <div className="grid place-items-center py-24">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  return <AppShell>{isAdmin ? <Console /> : <AdminSignIn signedIn={Boolean(user)} />}</AppShell>;
}

function AdminSignIn({ signedIn }: { signedIn: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNote(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setNote(error.message);
  };

  return (
    <div className="mx-auto max-w-sm px-5 py-16">
      <div className="mb-5 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h1 className="font-display text-xl font-bold text-foreground">Admin console</h1>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        {signedIn
          ? "This account doesn't have admin access. Sign in with the admin address."
          : "Sign in with the admin account to manage channels."}
      </p>
      <form onSubmit={submit} className="grid gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Admin email"
          aria-label="Admin email"
          className="rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          aria-label="Password"
          className="rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground outline-none"
        />
        <button
          type="submit"
          disabled={busy}
          className="tap rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      {note ? <p className="mt-3 text-xs text-destructive">{note}</p> : null}
    </div>
  );
}

function Console() {
  const [term, setTerm] = useState("");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Channel | null>(null);
  const [logoFor, setLogoFor] = useState<Channel | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const hidden = useHiddenChannels();

  const results = useQuery({
    queryKey: ["admin-search", q],
    queryFn: () => searchChannels({ data: { q: q || undefined, page: 1 } }),
    staleTime: 5 * 60 * 1000,
  });

  const items = useMemo(() => results.data?.items ?? [], [results.data]);

  const saveLogo = async () => {
    if (!logoFor || !/^https?:\/\//i.test(logoUrl.trim())) {
      setNote("Paste a valid image URL.");
      return;
    }
    const url = logoUrl.trim();
    const { data: existing } = await supabase
      .from("tv_logos")
      .select("id")
      .eq("channel_slug", logoFor.slug)
      .limit(1);
    if (existing && existing.length > 0) {
      await supabase
        .from("tv_logos")
        .update({ logo_url: url, name: logoFor.name, source: "admin" })
        .eq("id", existing[0].id);
    } else {
      await supabase.from("tv_logos").insert({
        channel_slug: logoFor.slug,
        name: logoFor.name,
        logo_url: url,
        source: "admin",
      });
    }
    setLogoOverride(logoFor.slug, url);
    setNote(`Artwork updated for ${logoFor.name}.`);
    setLogoFor(null);
    setLogoUrl("");
  };

  return (
    <div className="px-5 py-6 md:px-12">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">Admin console</h1>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Search a channel, test playback, replace its artwork, or remove it from the whole app.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQ(term.trim());
        }}
        className="mt-5 max-w-xl"
      >
        <label className="flex items-center gap-3 rounded-md bg-secondary/70 px-4 py-3 ring-1 ring-border/60">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search channels"
            aria-label="Search channels"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="tap rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            Search
          </button>
        </label>
      </form>

      {note ? <p className="mt-3 text-xs text-primary">{note}</p> : null}

      <ul className="mt-5 grid gap-2">
        {items.map((c) => {
          const isHidden = hidden.includes(c.slug);
          return (
            <li
              key={`${c.slug}-${c.streamUrl}`}
              className="flex flex-wrap items-center gap-2 rounded-md bg-card px-4 py-3 ring-1 ring-border/60"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {c.name} {isHidden ? <span className="text-destructive">· removed</span> : null}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {c.slug} · {c.source}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setActive(c)}
                className="tap inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-semibold text-foreground"
              >
                <Play className="h-3.5 w-3.5" /> Test
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogoFor(c);
                  setLogoUrl("");
                }}
                className="tap inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-semibold text-foreground"
              >
                <ImagePlus className="h-3.5 w-3.5" /> Logo
              </button>
              {isHidden ? (
                <button
                  type="button"
                  onClick={() => void restoreChannel(c.slug)}
                  className="tap inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-semibold text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Restore
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void hideChannel(c.slug, c.name)}
                  className="tap inline-flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1.5 text-[11px] font-semibold text-destructive-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {results.isLoading ? (
        <p className="mt-5 text-xs text-muted-foreground">Loading…</p>
      ) : null}

      {logoFor ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-card p-5 ring-1 ring-border/60">
            <p className="font-display text-lg font-bold text-foreground">
              Update artwork · {logoFor.name}
            </p>
            <input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://…/logo.png"
              aria-label="Logo image URL"
              className="mt-3 w-full rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground outline-none"
            />
            {/^https?:\/\//i.test(logoUrl.trim()) ? (
              <img
                src={logoUrl.trim()}
                alt=""
                loading="lazy"
                className="mt-3 h-20 w-full rounded-xl bg-secondary object-contain p-2"
              />
            ) : null}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => void saveLogo()}
                className="tap flex-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Save logo
              </button>
              <button
                type="button"
                onClick={() => setLogoFor(null)}
                className="tap rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {active ? <PlayerModal channel={active} onClose={() => setActive(null)} /> : null}
    </div>
  );
}
