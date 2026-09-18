import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart, Play, Radio, Star } from "lucide-react";
import { AppShell } from "@/components/tv/AppShell";
import { ChannelLogo } from "@/components/tv/ChannelLogo";
import { ChannelRow } from "@/components/tv/ChannelRow";
import { Button } from "@/components/ui/button";
import { getChannelBySlug } from "@/lib/iptv.functions";
import { getChannelArt } from "@/lib/channel-art";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/lib/favorites";

export const Route = createFileRoute("/channel/$channelSlug")({
  loader: async ({ params }) => {
    const result = await getChannelBySlug({ data: { slug: params.channelSlug } });
    if (!result.channel) throw notFound();
    return result;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.channel.name} — Opencast` : "Channel unavailable — Opencast" },
      { name: "description", content: loaderData ? `Watch ${loaderData.channel.name} live on Opencast.` : "This channel is unavailable." },
      { property: "og:title", content: loaderData ? `${loaderData.channel.name} — Opencast` : "Channel unavailable — Opencast" },
      { property: "og:description", content: loaderData ? `Watch ${loaderData.channel.name} live on Opencast.` : "This channel is unavailable." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChannelDetailsPage,
});

function ChannelDetailsPage() {
  const { channel, related } = Route.useLoaderData();
  const { user } = useAuth();
  const { slugs, toggle } = useFavorites(user?.id ?? null);
  const favorite = slugs.includes(channel.slug);
  const art = getChannelArt(channel);

  return (
    <AppShell>
      <section className="relative min-h-[66vh] overflow-hidden">
        <img src={art} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,color-mix(in_oklab,var(--background)_86%,transparent)_38%,color-mix(in_oklab,var(--background)_20%,transparent)_74%),linear-gradient(0deg,var(--background)_0%,transparent_62%)]" />
        <div className="relative flex min-h-[66vh] max-w-7xl items-end px-5 pb-14 pt-28 md:items-center md:px-12 md:pb-8">
          <div className="max-w-2xl">
            <div className="mb-5 grid h-20 w-36 place-items-center overflow-hidden rounded-md bg-card/80 ring-1 ring-border/70 backdrop-blur">
              <ChannelLogo channel={channel} loading="eager" className="h-full w-full object-contain p-4" placeholderClassName="font-display text-2xl text-foreground" />
            </div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">Opencast selection</p>
            <h1 className="max-w-xl font-display text-5xl leading-[0.95] text-foreground md:text-7xl">{channel.name}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <span className="inline-flex items-center gap-1 text-primary"><Star className="h-3 w-3 fill-current" /> Live</span>
              <span>{channel.categories[0] ?? "Television"}</span>
              {channel.country ? <span>{channel.country}</span> : null}
              <span>{channel.quality ?? "HD"}</span>
            </div>
            <p className="mt-5 max-w-lg text-sm leading-6 text-secondary-foreground">Live programming from {channel.name}, delivered through Opencast with automatic source recovery and quality selection.</p>
            <div className="mt-7 flex items-center gap-3">
              <Button asChild size="lg" className="rounded-none px-7 font-semibold uppercase tracking-[0.12em]">
                <Link to="/watch/$channelSlug" params={{ channelSlug: channel.slug }}><Play className="fill-current" /> Watch live</Link>
              </Button>
              <Button variant="outline" size="lg" onClick={() => toggle(channel.slug)} className="rounded-none px-5 uppercase tracking-[0.12em]">
                <Heart className={favorite ? "fill-current text-primary" : ""} /> {favorite ? "Saved" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </section>
      <div className="pb-16">
        <ChannelRow title="More like this" subtitle="Related live channels" items={related} favorites={slugs} onFavorite={(item) => toggle(item.slug)} />
      </div>
    </AppShell>
  );
}