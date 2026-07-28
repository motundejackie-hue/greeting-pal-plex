import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Play, Plus, Image as ImageIcon, Youtube } from "lucide-react";
import { AppShell } from "@/components/tv/AppShell";
import { useHlsStream } from "@/hooks/use-hls";
import { listAllNames } from "@/lib/iptv.functions";
import { searchYouTubeLive } from "@/lib/youtube.functions";
import { addChannel, saveLogo } from "@/lib/tv-store";
import { normalizeChannelKey } from "@/lib/channel-logos";

export const Route = createFileRoute("/test")({
  component: TestPage,
  head: () => ({
    meta: [
      { title: "Stream Lab — Test HLS Links | Opencast" },
      {
        name: "description",
        content:
          "Test any HLS stream, add working channels to the Opencast library, attach official logos and find channels on YouTube.",
      },
      { property: "og:title", content: "Stream Lab — Test HLS Links | Opencast" },
      { property: "og:description", content: "Test HLS links, add channels and attach official logos." },
    ],
    links: [{ rel: "canonical", href: "https://opencasttv.lovable.app/test" }],
  }),
});

function TestPlayer({ url }: { url: string }) {
  const { videoRef, state, attemptLabel } = useHlsStream(url, { muted: true });
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video ref={videoRef} controls playsInline autoPlay muted className="h-full w-full" />
      {state === "loading" ? (
        <div className="absolute inset-0 grid place-items-center bg-black/60">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : null}
      <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] text-foreground">
        {state === "error" ? "Not responding" : `${state} · ${attemptLabel}`}
      </span>
    </div>
  );
}

function TestPage() {
  const [url, setUrl] = useState("");
  const [testing, setTesting] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState<string | null>(null);

  const [logoQuery, setLogoQuery] = useState("");
  const [logoTarget, setLogoTarget] = useState<{ slug: string; name: string } | null>(null);
  const [logoUrl, setLogoUrl] = useState("");

  const [ytQuery, setYtQuery] = useState("");
  const [ytResult, setYtResult] = useState<{ videoId: string | null; title: string | null } | null>(null);
  const [ytBusy, setYtBusy] = useState(false);

  const matches = useQuery({
    queryKey: ["names", logoQuery],
    queryFn: () => listAllNames({ data: { q: logoQuery } }),
    enabled: logoQuery.length > 1,
  });

  const add = async () => {
    if (!testing || !name.trim()) return;
    try {
      await addChannel({ slug: normalizeChannelKey(name), name: name.trim(), streamUrl: testing });
      setNote(`Added “${name}” to the library.`);
    } catch {
      setNote("Sign in first — adding channels requires an account.");
    }
  };

  const attachLogo = async () => {
    if (!logoTarget || !logoUrl.trim()) return;
    try {
      await saveLogo(logoTarget.slug, logoTarget.name, logoUrl.trim());
      setNote(`Logo saved for ${logoTarget.name}.`);
    } catch {
      setNote("Sign in first — saving logos requires an account.");
    }
  };

  const findYouTube = async () => {
    setYtBusy(true);
    setYtResult(null);
    try {
      setYtResult(await searchYouTubeLive({ data: { query: ytQuery } }));
    } catch {
      setYtResult({ videoId: null, title: null });
    }
    setYtBusy(false);
  };

  return (
    <AppShell>
      <div className="px-4 pb-12 md:px-8">
        <header className="mb-5">
          <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">Stream lab</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Test links, add channels and attach official logos used everywhere in the app.
          </p>
        </header>

        {note ? (
          <p className="mb-4 rounded-xl bg-brand-soft px-3 py-2 text-xs text-foreground">{note}</p>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Test + add */}
          <section className="rounded-2xl bg-card p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Play className="h-4 w-4 text-primary" /> Test an HLS link
            </h2>
            <div className="flex gap-2">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/stream.m3u8"
                aria-label="HLS URL"
                className="min-w-0 flex-1 rounded-xl bg-secondary px-3 py-2 text-xs text-foreground outline-none"
              />
              <button
                type="button"
                onClick={() => setTesting(url.trim() || null)}
                className="shrink-0 rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-primary-foreground"
              >
                Test
              </button>
            </div>

            {testing ? (
              <div className="mt-3 space-y-3">
                <TestPlayer url={testing} />
                <div className="flex gap-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Channel name"
                    aria-label="Channel name"
                    className="min-w-0 flex-1 rounded-xl bg-secondary px-3 py-2 text-xs text-foreground outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => void add()}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add to library
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          {/* Logos */}
          <section className="rounded-2xl bg-card p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <ImageIcon className="h-4 w-4 text-primary" /> Add an official logo
            </h2>
            <input
              value={logoQuery}
              onChange={(e) => setLogoQuery(e.target.value)}
              placeholder="Find a channel…"
              aria-label="Find a channel"
              className="w-full rounded-xl bg-secondary px-3 py-2 text-xs text-foreground outline-none"
            />
            <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
              {(matches.data ?? []).slice(0, 20).map((m) => (
                <button
                  key={m.slug}
                  type="button"
                  onClick={() => setLogoTarget({ slug: m.slug, name: m.name })}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs ${
                    logoTarget?.slug === m.slug ? "bg-brand text-primary-foreground" : "hover:bg-secondary"
                  }`}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded bg-secondary">
                    {m.logo ? <img src={m.logo} alt="" className="h-full w-full object-contain" /> : null}
                  </span>
                  <span className="truncate">{m.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://…/logo.png"
                aria-label="Logo URL"
                className="min-w-0 flex-1 rounded-xl bg-secondary px-3 py-2 text-xs text-foreground outline-none"
              />
              <button
                type="button"
                disabled={!logoTarget}
                onClick={() => void attachLogo()}
                className="shrink-0 rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
              >
                Update
              </button>
            </div>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo preview"
                className="mt-3 h-16 w-full rounded-xl bg-secondary object-contain p-2"
              />
            ) : null}
          </section>

          {/* YouTube */}
          <section className="rounded-2xl bg-card p-4 lg:col-span-2">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Youtube className="h-4 w-4 text-primary" /> Get a channel from YouTube
            </h2>
            <div className="flex gap-2">
              <input
                value={ytQuery}
                onChange={(e) => setYtQuery(e.target.value)}
                placeholder="e.g. Sky News live"
                aria-label="YouTube search"
                className="min-w-0 flex-1 rounded-xl bg-secondary px-3 py-2 text-xs text-foreground outline-none"
              />
              <button
                type="button"
                onClick={() => void findYouTube()}
                disabled={ytBusy || ytQuery.length < 2}
                className="shrink-0 rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
              >
                {ytBusy ? "Searching…" : "Search"}
              </button>
            </div>
            {ytResult ? (
              ytResult.videoId ? (
                <div className="mt-3 space-y-2">
                  <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                    <iframe
                      title={ytResult.title ?? "YouTube preview"}
                      src={`https://www.youtube.com/embed/${ytResult.videoId}`}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {ytResult.title} — verify it&apos;s the right channel before adding it.
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">No live match found.</p>
              )
            ) : null}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
