import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { getHome, searchChannels } from "@/lib/iptv.functions";
import type { Channel } from "@/lib/channel-types";
import { AppShell } from "@/components/tv/AppShell";
import { ChannelCard } from "@/components/tv/ChannelCard";
import { PlayerModal } from "@/components/tv/PlayerModal";
import { useAuth } from "@/hooks/use-auth";
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
      { title: "Browse Channels — Opencast" },
      {
        name: "description",
        content: "Filter thousands of free live TV channels by country, category and name.",
      },
      { property: "og:title", content: "Browse Channels — Opencast" },
      { property: "og:description", content: "Filter free live TV by country, category and name." },
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
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Channel[]>([]);
  const [active, setActive] = useState<Channel | null>(null);
  const [term, setTerm] = useState(search.q ?? "");

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [search.q, search.country, search.category]);

  const filters = useQuery({
    queryKey: ["filters"],
    queryFn: () => getHome({ data: {} }),
    staleTime: 60 * 60 * 1000,
  });

  const result = useQuery({
    queryKey: ["browse", search.q, search.country, search.category, page],
    queryFn: () => searchChannels({ data: { ...search, page } }),
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (result.data) setItems((prev) => (page === 1 ? result.data.items : [...prev, ...result.data.items]));
  }, [result.data, page]);

  const apply = (patch: Partial<Search>) =>
    void navigate({ search: (prev: Search) => ({ ...prev, ...patch }) });

  const visible = items;
  const total = result.data?.total ?? 0;

  return (
    <>
      <AppShell>
        <div className="px-4 md:px-8">
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
                className="w-full rounded-full bg-secondary px-4 py-2 text-xs text-foreground outline-none"
              />
            </form>
            <select
              aria-label="Country"
              value={search.country ?? ""}
              onChange={(e) => apply({ country: e.target.value || undefined })}
              className="rounded-full bg-secondary px-3 py-2 text-xs text-foreground"
            >
              <option value="">All countries</option>
              {(filters.data?.countries ?? []).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} ({c.count})
                </option>
              ))}
            </select>
            <select
              aria-label="Category"
              value={search.category ?? ""}
              onChange={(e) => apply({ category: e.target.value || undefined })}
              className="rounded-full bg-secondary px-3 py-2 text-xs text-foreground"
            >
              <option value="">All categories</option>
              {(filters.data?.categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
          </div>

          <p className="mb-3 text-[11px] text-muted-foreground">
            {result.isLoading && page === 1 ? "Loading…" : `${total.toLocaleString()} channels`}
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


          {visible.length < total ? (
            <div className="py-8 text-center">
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={result.isFetching}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
              >
                {result.isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Load more
              </button>
            </div>
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
