import { useCallback, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getHome } from "@/lib/iptv.functions";
import type { Channel } from "@/lib/channel-types";
import { AppShell } from "@/components/tv/AppShell";
import { ChannelRow } from "@/components/tv/ChannelRow";
import { HeroCarousel } from "@/components/tv/HeroCarousel";
import { GenreRail } from "@/components/tv/GenreRail";
import { ContinueWatching } from "@/components/tv/ContinueWatching";
import { SplashScreen } from "@/components/SplashScreen";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites, useRecent } from "@/lib/favorites";
import { useHiddenChannels } from "@/lib/hidden-channels";

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
  const { data } = useSuspenseQuery(homeQuery);
  const { user } = useAuth();
  const { slugs, toggle } = useFavorites(user?.id ?? null);
  const { slugs: recent, push } = useRecent();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const details = useCallback(
    (c: Channel) => void navigate({ to: "/channel/$channelSlug", params: { channelSlug: c.slug } }),
    [navigate],
  );

  const watch = useCallback(
    (c: Channel) => {
      push(c.slug);
      void navigate({ to: "/watch/$channelSlug", params: { channelSlug: c.slug } });
    },
    [navigate, push],
  );

  const hidden = useHiddenChannels();
  const visible = (items: Channel[]) => items.filter((c) => !hidden.includes(c.slug));
  const withLogo = (items: Channel[]) => visible(items).filter((c) => Boolean(c.logo));
  const all = data.rows.flatMap((r) => r.items as Channel[]);
  const hero = data.hero;

  return (
    <>
      <SplashScreen />
      <AppShell>
        <HeroCarousel
          featured={withLogo(hero ? [hero, ...all] : all).slice(0, 5)}
          onPlay={watch}
          totalChannels={data.total}
        />

        <GenreRail />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void navigate({ to: "/browse", search: { q: query } });
          }}
          className="mb-10 px-5 md:px-12"
        >
          <label className="flex min-w-0 max-w-xl items-center gap-3 rounded-sm bg-secondary/70 px-5 py-3 ring-1 ring-border/60 focus-within:ring-2 focus-within:ring-primary/60">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search channels, genres, countries"
              aria-label="Search channels"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="tap shrink-0 rounded-sm bg-brand px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground"
            >
              Search
            </button>
          </label>
        </form>

        <ContinueWatching slugs={recent} onOpen={watch} />

        <ChannelRow
          title="Top picks for you"
          subtitle="Handpicked live channels, always on"
          items={withLogo(all).slice(0, 16)}
          onOpen={details}
          onFavorite={(c) => toggle(c.slug)}
          favorites={slugs}
        />

        {data.rows.slice(1).map((row) => (
          <ChannelRow
            key={row.id}
            title={row.title}
            items={visible(row.items as Channel[])}
            onOpen={details}
            onFavorite={(c) => toggle(c.slug)}
            favorites={slugs}
          />
        ))}

        <footer className="px-5 py-10 text-center text-[11px] text-muted-foreground md:px-12">
          Opencast · Free TV. Everywhere.
        </footer>
      </AppShell>
    </>
  );
}
