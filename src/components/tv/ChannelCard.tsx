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
        <div className="tile-surface relative aspect-video w-full overflow-hidden rounded-xl ring-1 ring-gold/30 transition duration-200 group-hover:ring-2 group-hover:ring-gold/80 group-focus-visible:ring-2 group-focus-visible:ring-gold">
          <ChannelLogo
            channel={channel}
            alt={`${channel.name} logo`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-7 transition-opacity duration-300"
            skeletonClassName="absolute inset-0 logo-skeleton rounded-xl"
            placeholderClassName="absolute inset-0 grid place-items-center font-display text-2xl font-bold text-muted-foreground"
          />

          <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/35 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-grad shadow-ember">
              <Play className="h-4.5 w-4.5 fill-current text-background" />
            </span>
          </span>
        </div>

        <p className="truncate pt-2.5 text-[13px] font-semibold text-foreground">{channel.name}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {channel.categories[0] ?? "Live"}
        </p>
      </button>

      <div className="absolute right-2 top-2 flex flex-col gap-1.5">
        {onFavorite ? (
          <button
            type="button"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={() => onFavorite(channel)}
            className="tap grid h-8 w-8 place-items-center rounded-full bg-black/55 text-foreground backdrop-blur transition hover:bg-black/80"
          >
            <Star className={`h-4 w-4 ${isFavorite ? "fill-current text-primary" : ""}`} />
          </button>
        ) : null}
        <button
          type="button"
          aria-label={`Paste a logo URL for ${channel.name}`}
          onClick={() => setEditing((e) => !e)}
          className="tap grid h-8 w-8 place-items-center rounded-full bg-black/55 text-foreground opacity-0 backdrop-blur transition hover:bg-black/80 group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <ImagePlus className="h-4 w-4" />
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
