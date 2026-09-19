import { memo, useState } from "react";
import { ImagePlus, Play, Star } from "lucide-react";
import type { Channel } from "@/lib/channel-types";
import { ChannelLogo } from "./ChannelLogo";
import { saveLogo } from "@/lib/tv-store";
import { setLogoOverride } from "@/lib/logo-overrides";

type Props = {
  channel: Channel;
  onOpen: (c: Channel) => void;
  onFavorite?: (c: Channel) => void;
  isFavorite?: boolean;
  size?: "sm" | "md" | "lg";
};

/** Poster-style broadcast tile: backdrop artwork, channel mark, status + quality. */
function ChannelCardBase({ channel, onOpen, onFavorite, isFavorite }: Props) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const clean = url.trim();
    if (!clean) return;
    setSaving(true);
    try {
      await saveLogo(channel.slug, channel.name, clean);
      setLogoOverride(channel.slug, clean);
      setEditing(false);
      setUrl("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="group relative select-none">
      <button
        type="button"
        onClick={() => onOpen(channel)}
        aria-label={`Open ${channel.name}`}
        className="tap flex w-full flex-col text-left outline-none"
      >
        <div className="tile-surface relative aspect-[16/8.5] w-full overflow-hidden rounded-md ring-1 ring-border/60 shadow-[var(--shadow-tv)] transition duration-200 group-hover:-translate-y-0.5 group-hover:ring-primary/80 group-focus-visible:ring-2 group-focus-visible:ring-primary">
          <ChannelLogo
            channel={channel}
            alt={`${channel.name} logo`}
            loading="lazy"
            className="absolute inset-[18%] h-[64%] w-[64%] object-contain transition-opacity duration-200"
            skeletonClassName="absolute inset-[18%] h-[64%] w-[64%] logo-skeleton rounded-sm"
            placeholderClassName="absolute inset-0 grid place-items-center px-3 text-center text-sm font-semibold text-[var(--channel-ink)]"
          />

          <span className="absolute left-1.5 top-1.5 inline-flex items-center rounded-sm bg-background/90 px-1.5 py-0.5 text-[8px] font-semibold uppercase text-foreground shadow-sm">
            <span className="live-dot" />
            Live
          </span>
          {channel.quality ? (
            <span className="absolute bottom-1.5 right-1.5 rounded-sm bg-background/90 px-1.5 py-0.5 text-[8px] font-semibold uppercase text-foreground shadow-sm">
              {channel.quality}
            </span>
          ) : null}

          <span className="pointer-events-none absolute inset-0 grid place-items-center bg-background/35 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand shadow-ember">
              <Play className="h-4 w-4 fill-current text-primary-foreground" />
            </span>
          </span>
        </div>

        <p className="truncate pt-2 text-[12px] font-medium text-foreground">{channel.name}</p>
        <p className="truncate text-[10px] text-muted-foreground">
          {(channel.categories[0] ?? "Live TV").replace(/^\w/, (m) => m.toUpperCase())}
          {channel.country ? ` · ${channel.country}` : ""}
        </p>
      </button>

      <div className="absolute right-1.5 top-1.5 flex flex-col gap-1">
        {onFavorite ? (
          <button
            type="button"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={() => onFavorite(channel)}
            className="tap grid h-7 w-7 place-items-center rounded-full bg-background/90 text-foreground shadow-sm transition hover:bg-primary"
          >
            <Star className={`h-3.5 w-3.5 ${isFavorite ? "fill-current text-primary" : ""}`} />
          </button>
        ) : null}
        <button
          type="button"
          aria-label={`Paste a logo URL for ${channel.name}`}
          onClick={() => setEditing((e) => !e)}
          className="tap grid h-7 w-7 place-items-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm transition hover:bg-primary group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <ImagePlus className="h-3.5 w-3.5" />
        </button>
      </div>

      {editing ? (
        <div className="absolute inset-x-1 top-1 z-10 rounded-lg bg-popover/95 p-2 shadow-lg backdrop-blur">
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void save();
              if (e.key === "Escape") setEditing(false);
            }}
            placeholder="Paste logo image URL…"
            aria-label={`Logo URL for ${channel.name}`}
            className="w-full rounded-md bg-secondary px-2 py-1.5 text-[11px] text-foreground outline-none"
          />
          <div className="mt-1.5 flex gap-1.5">
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="tap flex-1 rounded-md bg-brand px-2 py-1 text-[11px] font-semibold text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="tap rounded-md bg-secondary px-2 py-1 text-[11px] text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export const ChannelCard = memo(ChannelCardBase);
