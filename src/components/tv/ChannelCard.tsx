import { memo, useEffect, useRef, useState } from "react";
import { Heart, Play, Trash2 } from "lucide-react";
import type { Channel } from "@/lib/channel-types";
import { countryFlag, initials } from "@/lib/channel-types";

type Props = {
  channel: Channel;
  onOpen: (c: Channel) => void;
  onDelete?: (c: Channel) => void;
  onFavorite?: (c: Channel) => void;
  isFavorite?: boolean;
  size?: "sm" | "md" | "lg";
  preview?: boolean;
};

/** Muted, low-cost live preview that only runs while the card is hovered/in view. */
function useLivePreview(url: string | null, active: boolean) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!active || !video || !url) {
      setLive(false);
      return;
    }
    let cancelled = false;
    let destroy: (() => void) | undefined;

    const timer = setTimeout(async () => {
      try {
        const { default: Hls } = await import("hls.js");
        if (cancelled) return;
        if (Hls.isSupported()) {
          const hls = new Hls({ maxBufferLength: 6, capLevelToPlayerSize: true, startLevel: 0 });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (cancelled) return;
            video.muted = true;
            void video.play().then(() => setLive(true)).catch(() => undefined);
          });
          hls.on(Hls.Events.ERROR, (_e, d) => {
            if (d.fatal) {
              hls.destroy();
              setLive(false);
            }
          });
          destroy = () => hls.destroy();
        } else {
          video.src = url;
          video.muted = true;
          void video.play().then(() => setLive(true)).catch(() => undefined);
          destroy = () => {
            video.removeAttribute("src");
            video.load();
          };
        }
      } catch {
        setLive(false);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      destroy?.();
      setLive(false);
    };
  }, [url, active]);

  return { videoRef, live };
}

function ChannelCardBase({
  channel,
  onOpen,
  onDelete,
  onFavorite,
  isFavorite,
  size = "md",
  preview = true,
}: Props) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio > 0.75),
      { threshold: [0, 0.75, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const wantsPreview = preview && hovered;
  const { videoRef, live } = useLivePreview(channel.streamUrl, wantsPreview);

  const pad = size === "sm" ? "p-2" : size === "lg" ? "p-5" : "p-3.5";
  const nameSize = size === "sm" ? "text-[10px]" : size === "lg" ? "text-sm" : "text-xs";

  return (
    <div
      ref={wrap}
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={() => onOpen(channel)}
        aria-label={`Play ${channel.name}`}
        className="relative flex w-full flex-col text-left outline-none"
      >
        <div
          className={`relative aspect-video w-full overflow-hidden rounded-xl bg-card shadow-tv transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-ember group-focus-visible:-translate-y-1 ${
            inView ? "opacity-100" : "opacity-90"
          }`}
        >
          {/* logo / fallback */}
          {channel.logo && !broken ? (
            <img
              src={channel.logo}
              alt={`${channel.name} logo`}
              loading="lazy"
              onError={() => setBroken(true)}
              className={`absolute inset-0 h-full w-full object-contain ${pad} transition-opacity duration-300 ${
                live ? "opacity-0" : "opacity-100"
              }`}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-black">
              <span className="font-display text-xl font-bold text-white">
                {initials(channel.name)}
              </span>
            </div>
          )}

          {/* live preview video */}
          {preview ? (
            <video
              ref={videoRef}
              muted
              playsInline
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                live ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : null}

          {/* scan sweep animation while in view */}
          {inView && !live ? (
            <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 scan-sweep bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
          ) : null}

          <span className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-foreground backdrop-blur">
            {countryFlag(channel.country)} {channel.quality ?? "HD"}
          </span>
          <span className="live-dot absolute right-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-foreground backdrop-blur">
            Live
          </span>

          <span className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand shadow-ember">
              <Play className="h-4 w-4 fill-current text-primary-foreground" />
            </span>
          </span>
        </div>

        <div className="px-1 pb-1 pt-1.5">
          <p className={`truncate font-medium text-foreground ${nameSize}`}>{channel.name}</p>
          <p className="truncate text-[9px] text-muted-foreground">
            {channel.categories[0] ?? "general"}
          </p>
        </div>
      </button>

      <div className="pointer-events-none absolute right-1.5 top-8 flex gap-1 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        {onFavorite ? (
          <button
            type="button"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={() => onFavorite(channel)}
            className="grid h-6 w-6 place-items-center rounded-full bg-black/70 text-foreground backdrop-blur hover:bg-black"
          >
            <Heart className={`h-3 w-3 ${isFavorite ? "fill-current text-primary" : ""}`} />
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            aria-label={`Delete ${channel.name}`}
            onClick={() => onDelete(channel)}
            className="grid h-6 w-6 place-items-center rounded-full bg-black/70 text-foreground backdrop-blur hover:bg-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export const ChannelCard = memo(ChannelCardBase);
