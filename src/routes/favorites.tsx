import { useCallback, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { AppShell } from "@/components/tv/AppShell";
import { ChannelCard } from "@/components/tv/ChannelCard";
import { PlayerModal } from "@/components/tv/PlayerModal";
import { getChannelsBySlugs } from "@/lib/iptv.functions";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites, useRecent } from "@/lib/favorites";
import type { Channel } from "@/lib/channel-types";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
  head: () => ({
    meta: [
      { title: "Your Favorites — Opencast" },
      { name: "description", content: "Every channel you starred in Opencast, ready to play in one tap." },
      { property: "og:title", content: "Your Favorites — Opencast" },
      { property: "og:description", content: "Every channel you starred in Opencast, ready to play." },
    ],
    links: [{ rel: "canonical", href: "https://opencasttv.lovable.app/favorites" }],
  }),
});

function FavoritesPage() {
  const { user } = useAuth();
  const { slugs, toggle } = useFavorites(user?.id ?? null);
  const { push } = useRecent();
  const [active, setActive] = useState<Channel | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["favorites", slugs],
    queryFn: () => getChannelsBySlugs({ data: { slugs } }),
    enabled: slugs.length > 0,
  });

  const open = useCallback(
    (c: Channel) => {
      setActive(c);
      push(c.slug);
    },
    [push],
  );

  const items = data?.items ?? [];

  return (
    <AppShell>
      <div className="px-4 pb-12 md:px-8">
        <header className="mb-5">
          <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">Favorites</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {slugs.length} saved channel{slugs.length === 1 ? "" : "s"}
            {user ? " · synced to your account" : " · sign in to sync across devices"}
          </p>
        </header>

        {slugs.length === 0 ? (
          <div className="grid place-items-center rounded-2xl bg-card px-6 py-16 text-center">
            <Heart className="mb-3 h-7 w-7 text-primary" />
            <p className="text-sm font-semibold text-foreground">No favorites yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Tap the heart on any channel to keep it here.</p>
            <Link
              to="/browse"
              className="mt-4 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              Browse channels
            </Link>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-card" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((c) => (
              <ChannelCard
                key={c.slug}
                channel={c}
                onOpen={open}
                onFavorite={(ch) => toggle(ch.slug)}
                isFavorite
                size="md"
              />
            ))}
          </div>
        )}
      </div>

      {active ? <PlayerModal channel={active} onClose={() => setActive(null)} /> : null}
    </AppShell>
  );
}
