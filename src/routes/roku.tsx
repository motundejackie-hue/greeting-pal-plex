import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check, Radio, Search } from "lucide-react";
import { AppShell } from "@/components/tv/AppShell";
import { searchChannels } from "@/lib/iptv.functions";
import { getStreamSources } from "@/lib/iptv.functions";
import type { Channel } from "@/lib/channel-types";
import { useHiddenChannels } from "@/lib/hidden-channels";
import { countryFlag } from "@/lib/channel-types";

export const Route = createFileRoute("/roku")({
  component: RokuPage,
  head: () => ({
    meta: [
      { title: "Watch on Roku TV — Opencast" },
      {
        name: "description",
        content:
          "Search any Opencast channel and copy its live IPTV link to paste into a Roku TV player app.",
      },
      { property: "og:title", content: "Watch on Roku TV — Opencast" },
      {
        property: "og:description",
        content: "Copy Opencast live channel links straight into your Roku IPTV player.",
      },
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

function RokuPage() {
  const [term, setTerm] = useState("");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Channel | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const hidden = useHiddenChannels();

  const results = useQuery({
    queryKey: ["roku-search", q],
    queryFn: () => searchChannels({ data: { q: q || undefined, page: 1 } }),
    staleTime: 10 * 60 * 1000,
  });

  const links = useQuery({
    queryKey: ["roku-links", active?.slug],
    queryFn: () => getStreamSources({ data: { slug: active!.slug } }),
    enabled: Boolean(active),
    staleTime: 10 * 60 * 1000,
  });

  const items = useMemo(
    () => (results.data?.items ?? []).filter((c) => !hidden.includes(c.slug)),
    [results.data, hidden],
  );

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <AppShell>
      <div className="px-5 py-6 md:px-12">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Watch on Roku TV
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground md:text-sm">
          Search a channel, then copy its live link and paste it into any Roku IPTV player app
          (M3U / HLS supported).
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQ(term.trim());
          }}
          className="mt-5 max-w-xl"
        >
          <label className="flex items-center gap-3 rounded-md bg-secondary/70 px-4 py-3 ring-1 ring-border/60 focus-within:ring-2 focus-within:ring-primary/60">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search channels to cast"
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

        <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <li key={`${c.slug}-${c.streamUrl}`}>
              <button
                type="button"
                onClick={() => setActive(c)}
                className="tap flex w-full items-center gap-3 rounded-md bg-card px-4 py-3 text-left ring-1 ring-border/60 transition hover:ring-primary/60"
              >
                <span className="text-lg" aria-hidden="true">
                  {countryFlag(c.country)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {c.name}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {c.categories[0] ?? "live"}
                  </span>
                </span>
                <Radio className="h-4 w-4 shrink-0 text-primary" />
              </button>
            </li>
          ))}
        </ul>

        {results.isLoading ? (
          <p className="mt-6 text-xs text-muted-foreground">Loading channels…</p>
        ) : null}
      </div>

      {active ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg bg-card p-5 shadow-[var(--shadow-tv)] ring-1 ring-border/60">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-bold text-foreground">
                  {active.name}
                </p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Copy a link for Roku
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="tap rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground"
              >
                Close
              </button>
            </div>

            <ul className="mt-4 grid max-h-[50vh] gap-2 overflow-y-auto">
              {(links.data?.links ?? [{ url: active.streamUrl, source: active.source }]).map(
                (l, i) => (
                  <li
                    key={l.url}
                    className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] text-foreground">{l.url}</span>
                      <span className="block text-[10px] text-muted-foreground">
                        {i === 0 ? "Primary" : `Backup ${i}`} · {l.source}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => void copy(l.url)}
                      aria-label="Copy link"
                      className="tap grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-primary-foreground"
                    >
                      {copied === l.url ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </li>
                ),
              )}
            </ul>
            {links.isLoading ? (
              <p className="mt-3 text-xs text-muted-foreground">Finding every link…</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
