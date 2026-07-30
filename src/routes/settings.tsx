import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eraser, Globe, ImagePlus, LogOut, RotateCcw, Sparkles, Wifi } from "lucide-react";
import { AppShell } from "@/components/tv/AppShell";
import { useSettings } from "@/lib/settings";
import { clearCache } from "@/lib/offline-cache";
import { restoreHiddenChannels } from "@/lib/tv-store";
import { getHome } from "@/lib/iptv.functions";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings — Opencast" },
      {
        name: "description",
        content:
          "Control Opencast: default country, live card previews, offline cache, restoring hidden channels and your account.",
      },
      { property: "og:title", content: "Settings — Opencast" },
      { property: "og:description", content: "Default country, previews, offline cache and account controls." },
    ],
    links: [{ rel: "canonical", href: "https://opencasttv.lovable.app/settings" }],
  }),
});

function Row({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl bg-card p-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`h-6 w-11 rounded-full p-0.5 transition-colors ${on ? "bg-brand" : "bg-secondary"}`}
    >
      <span
        className={`block h-5 w-5 rounded-full bg-foreground transition-transform ${on ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

function SettingsPage() {
  const { settings, update } = useSettings();
  const { user } = useAuth();
  const [note, setNote] = useState<string | null>(null);
  const home = useQuery({ queryKey: ["home"], queryFn: () => getHome({ data: {} }), staleTime: Infinity });

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl px-4 pb-12 md:px-8">
        <header className="mb-5">
          <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">Settings</h1>
          <p className="mt-1 text-xs text-muted-foreground">Tune Opencast to how you watch.</p>
        </header>

        {note ? <p className="mb-4 rounded-xl bg-brand-soft px-3 py-2 text-xs">{note}</p> : null}

        <div className="space-y-3">
          <Row title="Theme" description="Opencast is designed for a dark room. Red on black, always.">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Dark
            </span>
          </Row>

          <Row title="Live card previews" description="Play a muted preview when you hover a channel tile.">
            <Toggle
              label="Live card previews"
              on={settings.autoplayPreviews}
              onChange={(v) => update({ autoplayPreviews: v })}
            />
          </Row>

          <Row title="Compact cards" description="Smaller tiles so more channels fit on screen.">
            <Toggle label="Compact cards" on={settings.compactCards} onChange={(v) => update({ compactCards: v })} />
          </Row>

          <Row title="Default country" description="Which local line-up loads first on the home page.">
            <span className="inline-flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <select
                aria-label="Default country"
                value={settings.defaultCountry}
                onChange={(e) => update({ defaultCountry: e.target.value })}
                className="rounded-full bg-secondary px-3 py-1.5 text-xs text-foreground"
              >
                <option value="">Worldwide</option>
                {(home.data?.countries ?? []).slice(0, 120).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </span>
          </Row>

          <Row title="Offline cache" description="Channels and logos saved on this device for offline browsing.">
            <button
              type="button"
              onClick={() => {
                clearCache();
                setNote("Offline cache cleared.");
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs text-foreground"
            >
              <Eraser className="h-3.5 w-3.5" /> Clear
            </button>
          </Row>

          <Row title="Refresh playlists" description="Pull the newest streams from every source right now.">
            <button
              type="button"
              onClick={() => {
                clearCache();
                window.location.reload();
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs text-foreground"
            >
              <Wifi className="h-3.5 w-3.5" /> Refresh
            </button>
          </Row>

          <Row
            title="Channel logos"
            description="Search any station and drag & drop a new logo image to update its artwork."
          >
            <a
              href="/logos"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              <ImagePlus className="h-3.5 w-3.5" /> Update logos
            </a>
          </Row>

          <Row title="Hidden channels" description="Bring back every channel you deleted from the line-up.">

            <button
              type="button"
              onClick={async () => {
                try {
                  await restoreHiddenChannels();
                  setNote("Hidden channels restored.");
                } catch {
                  setNote("Sign in to restore channels.");
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restore
            </button>
          </Row>

          <Row title="Account" description={user ? (user.email ?? "Signed in") : "Not signed in"}>
            {user ? (
              <button
                type="button"
                onClick={() => void supabase.auth.signOut()}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            ) : (
              <a
                href="/auth"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                Sign in
              </a>
            )}
          </Row>
        </div>
      </div>
    </AppShell>
  );
}
