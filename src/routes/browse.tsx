import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { Channel } from "@/lib/channel-types";
import { AppShell } from "@/components/tv/AppShell";
import { ChannelCard } from "@/components/tv/ChannelCard";
import { PlayerModal } from "@/components/tv/PlayerModal";
import { useAuth } from "@/hooks/use-auth";
import { useCuratedChannels } from "@/lib/curated";
import { useFavorites, useRecent } from "@/lib/favorites";

type Search = { q?: string; country?: string; category?: string };

export const Route = createFileRoute("/browse")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: search.q ? String(search.q) : undefined,
    country: search.country ? String(search.country) : undefined,
    category: search.category ? String(search.category) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse the Lineup — Opencast" },
      {
        name: "description",
        content: "Filter the curated Opencast lineup by name, country and category.",
      },
      { property: "og:title", content: "Browse the Lineup — Opencast" },
      { property: "og:description", content: "Filter the curated Opencast lineup." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrowsePage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-8 text-sm text-muted-foreground">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-8 text-sm text-muted-foreground">No channels.</div>,
});

function BrowsePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { user } = useAuth();
  const { slugs, toggle } = useFavorites(user?.id ?? null);
  const { push } = useRecent();
  const { data: channels = [], isLoading } = useCuratedChannels();
  const [active, setActive] = useState<Channel | null>(null);
  const [term, setTerm] = useState(search.q ?? "");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const c of channels) for (const cat of c.categories) set.add(cat);
    return Array.from(set).sort();
  }, [channels]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    for (const c of channels) if (c.country) set.add(c.country);
    return Array.from(set).sort();
  }, [channels]);

  const visible = useMemo(() => {
    const q = (search.q ?? "").trim().toLowerCase();
    return channels.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      if (search.country && c.country !== search.country) return false;
      if (
        search.category &&
        !c.categories.some((cat) => cat.toLowerCase().includes(search.category!.toLowerCase()))
      )
        return false;
      return true;
    });
  }, [channels, search.q, search.country, search.category]);

  const apply = (patch: Partial<Search>) =>
    void navigate({ search: (prev: Search) => ({ ...prev, ...patch }) });

  return (
    <>
      <AppShell>
        <div className="px-5 py-6 md:px-12">
          <div className="mb-4 flex flex-wrap gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                apply({ q: term || undefined });
              }}
              className="min-w-[180px] flex-1"
            >
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search by name…"
                aria-label="Search channels"
                className="w-full rounded-full bg-secondary px-4 py-2 text-xs text-foreground outline-none ring-1 ring-gold/20"
              />
            </form>
            <select
              aria-label="Country"
              value={search.country ?? ""}
              onChange={(e) => apply({ country: e.target.value || undefined })}
              className="rounded-full bg-secondary px-3 py-2 text-xs text-foreground ring-1 ring-gold/20"
            >
              <option value="">All countries</option>
              {countries.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <select
              aria-label="Category"
              value={search.category ?? ""}
              onChange={(e) => apply({ category: e.target.value || undefined })}
              className="rounded-full bg-secondary px-3 py-2 text-xs text-foreground ring-1 ring-gold/20"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <p className="mb-3 text-[11px] text-muted-foreground">
            {isLoading ? "Loading…" : `${visible.length.toLocaleString()} channels`}
          </p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visible.map((c) => (
              <ChannelCard
                key={`${c.slug}-${c.streamUrl}`}
                channel={c}
                size="md"
                onOpen={(ch) => {
                  setActive(ch);
                  push(ch.slug);
                }}
                onFavorite={(ch) => toggle(ch.slug)}
                isFavorite={slugs.includes(c.slug)}
              />
            ))}
          </div>

          {!isLoading && visible.length === 0 ? (
            <p className="py-10 text-center text-xs text-muted-foreground">
              Nothing matches yet — the lineup is curated by the Opencast admin.
            </p>
          ) : (
            <div className="py-8" />
          )}
        </div>
      </AppShell>

      {active ? (
        <PlayerModal
          channel={active}
          onClose={() => setActive(null)}
          onFavorite={(c) => toggle(c.slug)}
          isFavorite={slugs.includes(active.slug)}
        />
      ) : null}
    </>
  );
}
