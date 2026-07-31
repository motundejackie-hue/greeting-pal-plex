import { memo, useState } from "react";
import { Heart, ImagePlus, Play } from "lucide-react";
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
        aria-label={`Play ${channel.name}`}
        className="tap flex w-full flex-col text-left outline-none"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-card ring-1 ring-border/50 transition duration-200 group-hover:-translate-y-0.5 group-hover:ring-2 group-hover:ring-primary group-focus-visible:ring-2 group-focus-visible:ring-primary">
          <ChannelLogo
            channel={channel}
            alt={`${channel.name} logo`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-6 transition-opacity duration-300"
            skeletonClassName="absolute inset-0 logo-skeleton rounded-2xl"
            placeholderClassName="absolute inset-0 grid place-items-center bg-card font-display text-xl font-bold text-muted-foreground"
          />

          <span className="absolute left-2 top-2 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary-foreground">
            Live
          </span>

          <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary">
              <Play className="h-4 w-4 fill-current text-primary-foreground" />
            </span>
          </span>
        </div>

        <p className="truncate px-1 pt-2 text-center text-[11px] font-medium text-foreground md:text-xs">
          {channel.name}
        </p>
      </button>

      <div className="pointer-events-none absolute right-1.5 top-9 flex flex-col gap-1.5 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        {onFavorite ? (
          <button
            type="button"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={() => onFavorite(channel)}
            className="tap grid h-7 w-7 place-items-center rounded-full bg-black/70 text-foreground backdrop-blur hover:bg-black"
          >
            <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-current text-primary" : ""}`} />
          </button>
        ) : null}
        <button
          type="button"
          aria-label={`Paste a logo URL for ${channel.name}`}
          onClick={() => setEditing((e) => !e)}
          className="tap grid h-7 w-7 place-items-center rounded-full bg-black/70 text-foreground backdrop-blur hover:bg-black"
        >
          <ImagePlus className="h-3.5 w-3.5" />
        </button>
      </div>

      {editing ? (
        <div className="absolute inset-x-1 top-1 z-10 rounded-xl bg-popover/95 p-2 shadow-lg backdrop-blur">
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
