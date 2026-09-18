import { useQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import type { Channel } from "@/lib/channel-types";
import { ChannelLogo } from "./ChannelLogo";
import { getChannelArt } from "@/lib/channel-art";
import { getChannelsBySlugs } from "@/lib/iptv.functions";

type Props = { slugs: string[]; onOpen: (c: Channel) => void };

/** Landscape shelf of the channels the viewer left most recently. */
export function ContinueWatching({ slugs, onOpen }: Props) {
  const recent = slugs.slice(0, 10);
  const { data } = useQuery({
    queryKey: ["continue", recent],
    queryFn: () => getChannelsBySlugs({ data: { slugs: recent } }),
    enabled: recent.length > 0,
    staleTime: 10 * 60 * 1000,
  });

  const items = data?.items ?? [];
  if (items.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-3 px-5 font-display text-xl text-foreground md:px-12 md:text-2xl">
        Continue watching
      </h2>
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2 md:gap-5">
        <div aria-hidden="true" className="w-5 shrink-0 md:w-12" />
        {items.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => onOpen(c)}
            className="tap group w-[210px] shrink-0 text-left md:w-[260px]"
            aria-label={`Resume ${c.name}`}
          >
            <div className="tile-surface relative aspect-video overflow-hidden rounded-lg ring-1 ring-border/70 transition group-hover:ring-2 group-hover:ring-primary/70">
              <img
                src={getChannelArt(c)}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-70"
              />
              <span className="absolute inset-0 bg-[linear-gradient(0deg,var(--background)_6%,transparent_70%)]" />
              <ChannelLogo
                channel={c}
                className="absolute inset-0 m-auto h-[42%] w-[52%] object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.7)]"
                placeholderClassName="absolute inset-0 grid place-items-center font-display text-xl text-foreground"
              />
              <span className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-brand shadow-ember">
                  <Play className="h-4 w-4 fill-current text-primary-foreground" />
                </span>
              </span>
              <span className="absolute inset-x-0 bottom-0 h-[3px] bg-border">
                <span className="block h-full w-1/3 bg-brand" />
              </span>
            </div>
            <p className="truncate pt-2 text-[13px] font-semibold text-foreground">{c.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">Resume live</p>
          </button>
        ))}
        <div aria-hidden="true" className="w-5 shrink-0 md:w-12" />
      </div>
    </section>
  );
}
