import { memo } from "react";
import { Heart, Play } from "lucide-react";
import type { Channel } from "@/lib/channel-types";
import { countryFlag } from "@/lib/channel-types";
import { ChannelLogo } from "./ChannelLogo";

type Props = {
  channel: Channel;
  onOpen: (c: Channel) => void;
  onFavorite?: (c: Channel) => void;
  isFavorite?: boolean;
  size?: "sm" | "md" | "lg";
};

function ChannelCardBase({ channel, onOpen, onFavorite, isFavorite, size = "md" }: Props) {
  const pad = size === "sm" ? "p-3.5" : size === "lg" ? "p-7" : "p-5";
  const nameSize = size === "sm" ? "text-[11px]" : size === "lg" ? "text-[13px]" : "text-xs";

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onOpen(channel)}
        aria-label={`Play ${channel.name}`}
        className="relative flex w-full flex-col text-left outline-none"
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border/60 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:ring-2 group-hover:ring-primary group-focus-visible:ring-2 group-focus-visible:ring-primary">
          <ChannelLogo
            channel={channel}
            alt={`${channel.name} logo`}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${pad}`}
            placeholderClassName="absolute inset-0 grid place-items-center bg-card font-display text-2xl font-bold text-foreground"
          />

          <span className="absolute left-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-foreground backdrop-blur">
            {countryFlag(channel.country)} {channel.quality ?? "HD"}
          </span>
          <span className="live-dot absolute right-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-foreground backdrop-blur">
            Live
          </span>

          <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary">
              <Play className="h-4 w-4 fill-current text-primary-foreground" />
            </span>
          </span>
        </div>

        <div className="px-0.5 pt-2">
          <p className={`truncate font-medium text-foreground ${nameSize}`}>{channel.name}</p>
          <p className="truncate text-[10px] capitalize text-muted-foreground">
            {channel.categories[0] ?? "general"}
          </p>
        </div>
      </button>

      {onFavorite ? (
        <div className="pointer-events-none absolute right-2 top-9 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
          <button
            type="button"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={() => onFavorite(channel)}
            className="grid h-7 w-7 place-items-center rounded-full bg-black/70 text-foreground backdrop-blur hover:bg-black"
          >
            <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-current text-primary" : ""}`} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export const ChannelCard = memo(ChannelCardBase);
