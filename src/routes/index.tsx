import { useCallback, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Grid2x2,
  Play,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type { Channel } from "@/lib/channel-types";
import { AppShell } from "@/components/tv/AppShell";
import { ChannelLogo } from "@/components/tv/ChannelLogo";
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

const NAV_TILES = [
  { icon: Grid2x2, label: "Apps", to: "/browse", search: {} as Record<string, string> },
  { icon: Compass, label: "Explore", to: "/browse", search: { category: "general" } },
  { icon: Radio, label: "Roku", to: "/roku", search: {} },
  { icon: Settings, label: "Settings", to: "/settings", search: {} },
];

/** Wide 16:9 tile with the channel mark centred — the "Movies you might like" card. */
function WideTile({
  channel,
  onPlay,
  eager = false,
}: {
  channel: Channel;
  onPlay: (c: Channel) => void;
  eager?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onPlay(channel)}
      aria-label={`Play ${channel.name}`}
      className="tap group relative aspect-[16/9] w-full overflow-hidden rounded-3xl tile-surface ring-1 ring-border/70 transition hover:ring-2 hover:ring-gold/70"
    >
      <ChannelLogo
        channel={channel}
        loading={eager ? "eager" : "lazy"}
        className="absolute inset-0 h-full w-full object-contain p-8 transition-transform duration-500 group-hover:scale-[1.05]"
        skeletonClassName="absolute inset-0 logo-skeleton"
        placeholderClassName="absolute inset-0 grid place-items-center font-display text-3xl font-bold text-muted-foreground"
      />
      <span className="absolute left-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-primary-foreground live-dot">
        Live
      </span>
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent px-4 pb-3 pt-10 text-left">
        <span className="block truncate text-sm font-semibold text-foreground">{channel.name}</span>
        <span className="block truncate text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {channel.categories[0] ?? "Live TV"}
        </span>
      </span>
    </button>
  );
}

function HomePage() {
  const { data: channels = [], isLoading } = useCuratedChannels();
  const { user } = useAuth();
  const { slugs, toggle } = useFavorites(user?.id ?? null);
  const { push } = useRecent();
  const [active, setActive] = useState<Channel | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  const open = useCallback(
    (c: Channel) => {
      setActive(c);
      push(c.slug);
    },
    [push],
  );

  const pages = Math.max(1, Math.ceil(channels.length / 4));
  const row = channels.slice(page * 4, page * 4 + 4);
  const topPicks = channels.slice(4, 6);
  const musicPicks = useMemo(() => channels.slice(6, 9), [channels]);
  const nowPlaying = active ?? channels[0] ?? null;

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <>
      <SplashScreen />
      <AppShell>
        {/* Greeting strip: avatar, day, search — mirrors the reference header row */}
        <div className="flex flex-wrap items-center gap-3 px-5 pb-6 pt-5 md:px-12">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-grad text-sm font-bold text-background">
            {(user?.email?.[0] ?? "O").toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold text-foreground">Good to see you</p>
            <p className="text-[11px] text-muted-foreground">
              {today} · {channels.length.toLocaleString()} curated channels
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void navigate({ to: "/browse", search: { q: query } });
            }}
            className="ml-auto w-full min-w-0 sm:w-auto sm:flex-1 sm:max-w-md"
          >
            <label className="flex min-w-0 items-center gap-2.5 rounded-full bg-secondary/60 px-4 py-2.5 ring-1 ring-gold/25 focus-within:ring-2 focus-within:ring-gold/70">
              <Search className="h-4 w-4 shrink-0 text-gold" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the lineup"
                aria-label="Search channels"
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </label>
          </form>
        </div>

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
            {/* Row 1 — headline shelf with paging arrows */}
            <section className="px-5 md:px-12">
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">
                    Channels You Might Like
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Hand-picked from the Opencast lineup
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous"
                    onClick={() => setPage((p) => (p - 1 + pages) % pages)}
                    className="tap grid h-8 w-8 place-items-center rounded-full bg-secondary/70 text-foreground ring-1 ring-border/60 transition hover:bg-secondary"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next"
                    onClick={() => setPage((p) => (p + 1) % pages)}
                    className="tap grid h-8 w-8 place-items-center rounded-full bg-secondary/70 text-foreground ring-1 ring-border/60 transition hover:bg-secondary"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {row.map((c, i) => (
                  <WideTile key={c.slug} channel={c} onPlay={open} eager={i < 2} />
                ))}
              </div>
            </section>

            {/* Row 2 — four editorial columns */}
            <section className="mt-9 grid grid-cols-1 gap-6 px-5 pb-28 md:grid-cols-2 md:px-12 xl:grid-cols-4">
              <div className="min-w-0">
                <h3 className="font-display text-sm font-bold text-foreground">
                  Top Picks This Week
                </h3>
                <p className="mb-3 text-[10px] text-muted-foreground">Most watched on Opencast</p>
                <div className="grid gap-3">
                  {(topPicks.length ? topPicks : channels.slice(0, 2)).map((c) => (
                    <WideTile key={c.slug} channel={c} onPlay={open} />
                  ))}
                </div>
              </div>

              <div className="min-w-0">
                <h3 className="font-display text-sm font-bold text-foreground">Social</h3>
                <p className="mb-3 text-[10px] text-muted-foreground">Watch together with friends</p>
                <div className="relative overflow-hidden rounded-3xl bg-gold-grad p-5 text-background">
                  <Sparkles className="h-5 w-5" />
                  <p className="mt-3 font-display text-2xl font-bold leading-tight">Watch Party</p>
                  <p className="mt-2 text-[11px] leading-relaxed opacity-80">
                    Start a room, share a link and keep the same channel in sync with everyone.
                  </p>
                  <Link
                    to="/favorites"
                    className="tap mt-5 inline-flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-[11px] font-semibold text-foreground"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" /> Join now
                  </Link>
                </div>
              </div>

              <div className="min-w-0">
                <h3 className="font-display text-sm font-bold text-foreground">Favourites</h3>
                <p className="mb-3 text-[10px] text-muted-foreground">Jump straight back in</p>
                <div className="grid gap-2.5">
                  {(musicPicks.length ? musicPicks : channels.slice(0, 3)).map((c) => (
                    <div
                      key={c.slug}
                      className="flex min-w-0 items-center gap-3 rounded-2xl bg-card/80 p-2.5 ring-1 ring-border/60"
                    >
                      <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl tile-surface">
                        <ChannelLogo
                          channel={c}
                          className="h-full w-full object-contain p-1.5"
                          skeletonClassName="absolute inset-0 logo-skeleton"
                          placeholderClassName="text-[10px] font-bold text-muted-foreground"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-foreground">
                          {c.name}
                        </span>
                        <span className="block truncate text-[10px] text-muted-foreground">
                          {c.categories[0] ?? "Live"}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => open(c)}
                        aria-label={`Play ${c.name}`}
                        className="tap grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gold-grad text-background"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="min-w-0">
                <h3 className="font-display text-sm font-bold text-foreground">Navigation</h3>
                <p className="mb-3 text-[10px] text-muted-foreground">Everything on your TV</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {NAV_TILES.map((t) => {
                    const Icon = t.icon;
                    return (
                      <Link
                        key={t.label}
                        to={t.to}
                        search={t.search as never}
                        className="tap grid aspect-square place-items-center gap-2 rounded-2xl tile-surface ring-1 ring-border/60 transition hover:ring-gold/60"
                      >
                        <Icon className="h-5 w-5 text-gold" />
                        <span className="text-[10px] font-semibold text-foreground">{t.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Bottom now-playing bar, as in the reference */}
        {nowPlaying ? (
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/85 px-4 py-2.5 backdrop-blur-xl md:px-12">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg tile-surface">
                <ChannelLogo
                  channel={nowPlaying}
                  className="h-full w-full object-contain p-1"
                  placeholderClassName="text-[9px] font-bold text-muted-foreground"
                />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[11px] font-semibold text-foreground">
                  {nowPlaying.name}
                </span>
                <span className="block text-[10px] text-muted-foreground">Live now</span>
              </span>
              <button
                type="button"
                onClick={() => open(nowPlaying)}
                aria-label={`Play ${nowPlaying.name}`}
                className="tap ml-2 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-grad text-background"
              >
                <Play className="h-4 w-4 fill-current" />
              </button>
              <div className="mx-2 hidden h-1 flex-1 rounded-full bg-secondary sm:block">
                <div className="h-full w-2/3 rounded-full bg-primary" />
              </div>
              <span className="hidden shrink-0 text-[10px] text-muted-foreground sm:block">
                Free TV. Everywhere.
              </span>
            </div>
          </div>
        ) : null}
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
