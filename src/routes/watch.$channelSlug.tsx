import { useEffect } from "react";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { PlayerModal } from "@/components/tv/PlayerModal";
import { getChannelBySlug } from "@/lib/iptv.functions";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites, useRecent } from "@/lib/favorites";

export const Route = createFileRoute("/watch/$channelSlug")({
  loader: async ({ params }) => {
    const result = await getChannelBySlug({ data: { slug: params.channelSlug } });
    if (!result.channel) throw notFound();
    return result.channel;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Watching ${loaderData.name} — Opencast` : "Stream unavailable — Opencast" },
      {
        name: "description",
        content: loaderData
          ? `Watch ${loaderData.name} live in the Opencast player.`
          : "This stream is unavailable.",
      },
      {
        property: "og:title",
        content: loaderData ? `Watching ${loaderData.name} — Opencast` : "Stream unavailable — Opencast",
      },
      {
        property: "og:description",
        content: loaderData
          ? `Watch ${loaderData.name} live in the Opencast player.`
          : "This stream is unavailable.",
      },
      { property: "og:type", content: "video.other" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WatchPage,
});

function WatchPage() {
  const channel = Route.useLoaderData();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { slugs, toggle } = useFavorites(user?.id ?? null);
  const { push } = useRecent();

  useEffect(() => {
    push(channel.slug);
  }, [channel.slug, push]);

  return (
    <PlayerModal
      channel={channel}
      onClose={() =>
        void navigate({ to: "/channel/$channelSlug", params: { channelSlug: channel.slug } })
      }
      onFavorite={(item) => toggle(item.slug)}
      isFavorite={slugs.includes(channel.slug)}
    />
  );
}
