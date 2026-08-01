import { useCallback, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getHome } from "@/lib/iptv.functions";
import type { Channel } from "@/lib/channel-types";
import { AppShell } from "@/components/tv/AppShell";
import { ChannelRow } from "@/components/tv/ChannelRow";
import { HeroCarousel } from "@/components/tv/HeroCarousel";
import { FavoriteAppsRow } from "@/components/tv/FavoriteAppsRow";
import { PlayerModal } from "@/components/tv/PlayerModal";
import { SplashScreen } from "@/components/SplashScreen";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites, useRecent } from "@/lib/favorites";

const homeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: () => getHome({ data: {} }),
  staleTime: 60 * 60 * 1000,
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(homeQuery);
  },
  head: () => ({
    meta: [
      { title: "Opencast — Free Live TV From Around the World" },
      {
        name: "description",
        content:
          "Watch thousands of free live TV channels — news, sports, movies, kids and more. No account, no fees.",
      },
      { property: "og:title", content: "Opencast — Free Live TV From Around the World" },
      {
        property: "og:description",
        content: "Thousands of free live TV channels in one polished app. Free TV. Everywhere.",
      },
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
  const { data } = useSuspenseQuery(homeQuery);
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

  const withLogo = (items: Channel[]) => items.filter((c) => Boolean(c.logo));
  const all = data.rows.flatMap((r) => r.items as Channel[]);
  const hero = data.hero;

  return (
    <>
      <SplashScreen />
      <AppShell>
        <HeroCarousel
          featured={withLogo(hero ? [hero, ...all] : all).slice(0, 5)}
          onPlay={open}
          totalChannels={data.total}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void navigate({ to: "/browse", search: { q: query } });
          }}
          className="mb-9 px-5 md:px-12"
        >
          <label className="flex min-w-0 items-center gap-3 rounded-2xl bg-secondary/70 px-5 py-3.5 ring-1 ring-border/60 focus-within:ring-2 focus-within:ring-primary/60">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search channels"
              aria-label="Search channels"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="tap shrink-0 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Search
            </button>
          </label>
        </form>

        <ChannelRow
          title="Top picks for you"
          subtitle="Handpicked live channels, always on"
          items={withLogo(all).slice(0, 16)}
          onOpen={open}
          onFavorite={(c) => toggle(c.slug)}
          favorites={slugs}
        />

        <FavoriteAppsRow items={withLogo(all).slice(0, 10)} onOpen={open} />

        {data.rows.slice(1).map((row) => (
          <ChannelRow
            key={row.id}
            title={row.title}
            items={row.items as Channel[]}
            onOpen={open}
            onFavorite={(c) => toggle(c.slug)}
            favorites={slugs}
          />
        ))}

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

