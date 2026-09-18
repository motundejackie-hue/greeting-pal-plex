import { memo, useState } from "react";
import { ImagePlus, Play, Star } from "lucide-react";
import type { Channel } from "@/lib/channel-types";
import { ChannelLogo } from "./ChannelLogo";
import { getChannelArt } from "@/lib/channel-art";
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
  const art = getChannelArt(channel);

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
        <div className="tile-surface relative aspect-[2/3] w-full overflow-hidden rounded-lg ring-1 ring-border/70 transition duration-300 group-hover:-translate-y-1 group-hover:ring-2 group-hover:ring-primary/70 group-focus-visible:ring-2 group-focus-visible:ring-primary">
          <img
            src={art}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-[linear-gradient(0deg,var(--background)_4%,color-mix(in_oklab,var(--background)_55%,transparent)_38%,color-mix(in_oklab,var(--background)_10%,transparent)_100%)]" />

          <ChannelLogo
            channel={channel}
            alt={`${channel.name} logo`}
            loading="lazy"
            className="absolute inset-x-0 top-[26%] mx-auto h-[26%] w-[64%] object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.75)] transition-opacity duration-300"
            skeletonClassName="absolute inset-x-[18%] top-[26%] h-[26%] logo-skeleton rounded-md"
            placeholderClassName="absolute inset-x-0 top-[28%] px-3 text-center font-display text-2xl text-foreground"
          />

          <span className="absolute left-2 top-2 inline-flex items-center rounded-sm bg-background/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-primary backdrop-blur">
            <span className="live-dot" />
            Live
          </span>
          {channel.quality ? (
            <span className="absolute right-2 bottom-2 rounded-sm bg-background/75 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
              {channel.quality}
            </span>
          ) : null}

          <span className="pointer-events-none absolute inset-0 grid place-items-center bg-background/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-brand shadow-ember">
              <Play className="h-5 w-5 fill-current text-primary-foreground" />
            </span>
          </span>
        </div>

        <p className="truncate pt-2.5 text-[13px] font-semibold text-foreground">{channel.name}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {(channel.categories[0] ?? "Live TV").replace(/^\w/, (m) => m.toUpperCase())}
          {channel.country ? ` · ${channel.country}` : ""}
        </p>
      </button>

      <div className="absolute right-2 top-2 flex flex-col gap-1.5">
        {onFavorite ? (
          <button
            type="button"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={() => onFavorite(channel)}
            className="tap grid h-8 w-8 place-items-center rounded-full bg-background/65 text-foreground backdrop-blur transition hover:bg-background/90"
          >
            <Star className={`h-4 w-4 ${isFavorite ? "fill-current text-primary" : ""}`} />
          </button>
        ) : null}
        <button
          type="button"
          aria-label={`Paste a logo URL for ${channel.name}`}
          onClick={() => setEditing((e) => !e)}
          className="tap grid h-8 w-8 place-items-center rounded-full bg-background/65 text-foreground opacity-0 backdrop-blur transition hover:bg-background/90 group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <ImagePlus className="h-4 w-4" />
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
