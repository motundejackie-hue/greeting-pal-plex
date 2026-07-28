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
import { deleteChannelForever } from "@/lib/tv-store";

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
  const [deleted, setDeleted] = useState<string[]>([]);

  const open = useCallback(
    (c: Channel) => {
      setActive(c);
      push(c.slug);
    },
    [push],
  );

  const remove = useCallback(async (c: Channel) => {
    setDeleted((prev) => [...prev, c.slug]);
    try {
      await deleteChannelForever(c);
    } catch {
      /* requires sign-in; local hide still applies for this session */
    }
  }, []);

  const visible = (items: Channel[]) => items.filter((c) => !deleted.includes(c.slug));
  const hero = data.hero;

  return (
    <>
      <SplashScreen />
      <AppShell>
        <HeroCarousel
          featured={(hero ? [hero, ...data.rows.flatMap((r) => r.items as Channel[])] : (data.rows.flatMap((r) => r.items as Channel[]))).slice(0, 5)}
          onPlay={open}
          totalChannels={data.total}
        />

        <FavoriteAppsRow
          items={data.rows.flatMap((r) => r.items as Channel[]).filter((c) => c.logo).slice(0, 12)}
          onOpen={open}
        />



        {/* Category bubble strip */}
        <div className="no-scrollbar mb-6 flex gap-3 overflow-x-auto px-4 md:px-8">
          {data.categories.slice(0, 16).map((cat) => (
            <a
              key={cat.id}
              href={`/browse?category=${cat.id}`}
              className="flex w-14 shrink-0 flex-col items-center gap-1.5"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-sm font-bold text-foreground">
                {cat.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="w-full truncate text-center text-[9px] text-muted-foreground">
                {cat.name}
              </span>
            </a>
          ))}
        </div>

        {data.rows.map((row) => (
          <ChannelRow
            key={row.id}
            title={row.title}
            items={visible(row.items as Channel[])}
            onOpen={open}
            onDelete={remove}
            onFavorite={(c) => toggle(c.slug)}
            favorites={slugs}
          />
        ))}

        <footer className="px-4 py-8 text-center text-[10px] text-muted-foreground md:px-8">
          Opencast · Free TV. Everywhere.
        </footer>
      </AppShell>

      {active ? (
        <PlayerModal
          channel={active}
          onClose={() => setActive(null)}
          onDelete={remove}
          onFavorite={(c) => toggle(c.slug)}
          isFavorite={slugs.includes(active.slug)}
        />
      ) : null}
    </>
  );
}
