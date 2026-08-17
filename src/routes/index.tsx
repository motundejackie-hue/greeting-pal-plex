import { useCallback, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, ShieldCheck } from "lucide-react";

import type { Channel } from "@/lib/channel-types";
import { AppShell } from "@/components/tv/AppShell";
import { ChannelRow } from "@/components/tv/ChannelRow";
import { FeaturedHero } from "@/components/tv/FeaturedHero";
import { LogoTilesRow } from "@/components/tv/LogoTilesRow";
import { PlayerModal } from "@/components/tv/PlayerModal";
import { SplashScreen } from "@/components/SplashScreen";
import { useAuth } from "@/hooks/use-auth";
import { useCuratedChannels } from "@/lib/curated";
import { useFavorites, useRecent } from "@/lib/favorites";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Opencast — Curated Free Live TV" },
      {
        name: "description",
        content:
          "A hand-picked lineup of free live TV channels — news, sports, movies and kids, published by the Opencast team.",
      },
      { property: "og:title", content: "Opencast — Curated Free Live TV" },
      {
        property: "og:description",
        content: "A hand-picked lineup of free live TV channels. Free TV. Everywhere.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
  errorComponent: ({ error }) => (
    <div role="alert" className="grid min-h-screen place-items-center px-6 text-center">
      <p className="text-sm text-muted-foreground">Couldn&apos;t load channels: {error.message}</p>
    </div>
  ),
  notFoundComponent: () => <div className="p-8 text-sm text-muted-foreground">Nothing here.</div>,
});

function HomePage() {
  const { data: channels = [], isLoading } = useCuratedChannels();
  const { user } = useAuth();
  const { slugs, toggle } = useFavorites(user?.id ?? null);
  const { push } = useRecent();
  const [active, setActive] = useState<Channel | null>(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const open = useCallback(
    (c: Channel) => {
      setActive(c);
      push(c.slug);
    },
    [push],
  );

  const featured = channels[0] ?? null;
  const spotlight = channels.slice(0, 2);
  const byCategory = (id: string) =>
    channels.filter((c) => c.categories.some((cat) => cat.toLowerCase().includes(id)));

  return (
    <>
      <SplashScreen />
      <AppShell>
        <FeaturedHero
          featured={featured}
          spotlight={spotlight}
          onPlay={open}
          total={channels.length}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void navigate({ to: "/browse", search: { q: query } });
          }}
          className="mb-8 px-5 md:px-12"
        >
          <label className="flex min-w-0 items-center gap-3 rounded-full bg-secondary/60 px-5 py-3 ring-1 ring-gold/25 focus-within:ring-2 focus-within:ring-gold/70">
            <Search className="h-4 w-4 shrink-0 text-gold" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the lineup"
              aria-label="Search channels"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="tap shrink-0 rounded-full border border-gold/60 bg-gold/12 px-4 py-1.5 text-xs font-semibold text-gold"
            >
              Search
            </button>
          </label>
        </form>

        {isLoading ? (
          <p className="px-5 pb-12 text-xs text-muted-foreground md:px-12">Loading lineup…</p>
        ) : channels.length === 0 ? (
          <div className="mx-5 mb-12 rounded-3xl bg-card p-8 text-center ring-1 ring-gold/25 md:mx-12">
            <ShieldCheck className="mx-auto h-6 w-6 text-gold" />
            <p className="mt-3 font-display text-lg font-bold text-foreground">
              No channels published yet
            </p>
            <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
              The lineup is curated. An admin searches the catalogue in the console and adds
              channels — they show up here for everyone the moment they&apos;re added.
            </p>
            <Link
              to="/admin"
              className="tap mt-5 inline-flex items-center gap-2 rounded-full border border-gold/60 bg-gold/12 px-5 py-2 text-xs font-semibold text-gold"
            >
              Open admin console
            </Link>
          </div>
        ) : (
          <>
            <LogoTilesRow title="Your Universe" items={channels} onOpen={open} />

            <ChannelRow
              title="Live & On-Demand"
              subtitle="Curated for Opencast"
              items={channels}
              onOpen={open}
              onFavorite={(c) => toggle(c.slug)}
              favorites={slugs}
            />

            {["sports", "news", "movies", "kids"].map((id) => (
              <ChannelRow
                key={id}
                title={id[0]!.toUpperCase() + id.slice(1)}
                items={byCategory(id)}
                onOpen={open}
                onFavorite={(c) => toggle(c.slug)}
                favorites={slugs}
              />
            ))}
          </>
        )}

        <footer className="px-5 py-10 text-center text-[11px] text-muted-foreground md:px-12">
          Opencast · Free TV. Everywhere.
        </footer>
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
