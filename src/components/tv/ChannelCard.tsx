import { memo } from "react";
import { Heart, Play, Trash2 } from "lucide-react";
import type { Channel } from "@/lib/channel-types";
import { countryFlag } from "@/lib/channel-types";
import { ChannelLogo } from "./ChannelLogo";

type Props = {
  channel: Channel;
  onOpen: (c: Channel) => void;
  onDelete?: (c: Channel) => void;
  onFavorite?: (c: Channel) => void;
  isFavorite?: boolean;
  size?: "sm" | "md" | "lg";
};

function ChannelCardBase({
  channel,
  onOpen,
  onDelete,
  onFavorite,
  isFavorite,
  size = "md",
}: Props) {
  const pad = size === "sm" ? "p-4" : size === "lg" ? "p-10" : "p-7";
  const nameSize = size === "sm" ? "text-xs" : size === "lg" ? "text-sm" : "text-[13px]";

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onOpen(channel)}
        aria-label={`Play ${channel.name}`}
        className="relative flex w-full flex-col text-left outline-none"
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-card ring-1 ring-border/60 transition duration-200 group-hover:ring-2 group-hover:ring-primary group-focus-visible:ring-2 group-focus-visible:ring-primary">
          <ChannelLogo
            channel={channel}
            alt={`${channel.name} logo`}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-contain ${pad}`}
            placeholderClassName="absolute inset-0 grid place-items-center bg-card font-display text-3xl font-bold text-foreground"
          />

          <span className="absolute left-2.5 top-2.5 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground backdrop-blur">
            {countryFlag(channel.country)} {channel.quality ?? "HD"}
          </span>
          <span className="live-dot absolute right-2.5 top-2.5 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase text-foreground backdrop-blur">
            Live
          </span>

          <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary">
              <Play className="h-5 w-5 fill-current text-primary-foreground" />
            </span>
          </span>
        </div>

        <div className="px-0.5 pt-2.5">
          <p className={`truncate font-medium text-foreground ${nameSize}`}>{channel.name}</p>
          <p className="truncate text-[11px] capitalize text-muted-foreground">
            {channel.categories[0] ?? "general"}
          </p>
        </div>
      </button>

      <div className="pointer-events-none absolute right-2.5 top-11 flex gap-1.5 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        {onFavorite ? (
          <button
            type="button"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={() => onFavorite(channel)}
            className="grid h-7 w-7 place-items-center rounded-full bg-black/70 text-foreground backdrop-blur hover:bg-black"
          >
            <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-current text-primary" : ""}`} />
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            aria-label={`Delete ${channel.name}`}
            onClick={() => onDelete(channel)}
            className="grid h-7 w-7 place-items-center rounded-full bg-black/70 text-foreground backdrop-blur hover:bg-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export const ChannelCard = memo(ChannelCardBase);
