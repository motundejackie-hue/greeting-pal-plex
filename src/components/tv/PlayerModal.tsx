import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Heart,
  Maximize2,
  Pause,
  Play,
  RefreshCw,
  SkipForward,
  Tv,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import type { Channel } from "@/lib/channel-types";
import { countryFlag } from "@/lib/channel-types";
import { ChannelLogo } from "@/components/tv/ChannelLogo";
import { getStreamSources } from "@/lib/iptv.functions";
import { useHlsStream } from "@/hooks/use-hls";

type Props = {
  channel: Channel;
  onClose: () => void;
  onFavorite?: (c: Channel) => void;
  isFavorite?: boolean;
};

export function PlayerModal({ channel, onClose, onFavorite, isFavorite }: Props) {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [paused, setPaused] = useState(false);
  const [intro, setIntro] = useState(false);
  const shell = useRef<HTMLDivElement | null>(null);

  const sources = useQuery({
    queryKey: ["stream-sources", channel.slug],
    queryFn: () => getStreamSources({ data: { slug: channel.slug } }),
    staleTime: 30 * 60 * 1000,
  });

  const { videoRef, state, levels, level, setLevel, retry, skip } = useHlsStream(
    channel.streamUrl,
    {
      muted,
      cacheKey: channel.slug,
      fallbacks: sources.data?.urls ?? [],
    },
  );

  const toggleFullscreen = () => {
    const el = shell.current;
    if (!el) return;
    const orientation = screen.orientation as
      | (ScreenOrientation & { lock?: (o: string) => Promise<void> })
      | undefined;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      try {
        orientation?.unlock?.();
      } catch {
        /* desktop browsers don't support orientation locking */
      }
    } else {
      void el.requestFullscreen?.().then(() => {
        try {
          void orientation?.lock?.("landscape").catch(() => undefined);
        } catch {
          /* unsupported */
        }
      });
    }
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
    } else {
      v.pause();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key.toLowerCase() === "f") toggleFullscreen();
      if (e.key.toLowerCase() === "m") setMuted((m) => !m);
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    v.volume = volume;
  }, [muted, volume, videoRef]);

  // Video plays behind the curtain first, then the logo swells with "Enjoy".
  useEffect(() => {
    if (state !== "playing") return;
    setIntro(true);
    const id = window.setTimeout(() => setIntro(false), 2200);
    return () => window.clearTimeout(id);
  }, [state]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/85 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        ref={shell}
        className="w-full overflow-hidden rounded-t-2xl bg-card shadow-ember sm:max-w-2xl sm:rounded-2xl"
      >
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 py-2">
          <button
            type="button"
            aria-label="Back"
            onClick={onClose}
            className="tap grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <div className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-md bg-secondary text-[10px] font-bold">
              <ChannelLogo
                channel={channel}
                alt={channel.name}
                className="h-full w-full object-contain p-0.5"
                placeholderClassName="grid h-full w-full place-items-center text-[10px] font-bold"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{channel.name}</p>
              <p className="truncate text-[10px] capitalize text-muted-foreground">
                {countryFlag(channel.country)} {channel.categories[0] ?? "live"}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close player"
            onClick={onClose}
            className="tap grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="relative aspect-video w-full bg-black">
          <video
            ref={videoRef}
            playsInline
            autoPlay
            className="h-full w-full"
            onPlay={() => setPaused(false)}
            onPause={() => setPaused(true)}
          />

          {state === "loading" ? (
            <div className="absolute inset-0 grid place-items-center overflow-hidden bg-black">
              <div className="absolute inset-0 opacity-25">
                <ChannelLogo
                  channel={channel}
                  alt=""
                  loading="eager"
                  className="absolute inset-0 h-full w-full scale-110 object-contain p-16 blur-2xl"
                  placeholderClassName="hidden"
                  skeletonClassName="hidden"
                />
              </div>
              <div className="relative grid place-items-center gap-4">
                <span className="relative grid h-20 w-20 place-items-center">
                  <span className="broadcast-ring absolute inset-0 rounded-full border border-primary/70" />
                  <span
                    className="broadcast-ring absolute inset-0 rounded-full border border-primary/70"
                    style={{ animationDelay: "0.6s" }}
                  />
                  <span
                    className="broadcast-ring absolute inset-0 rounded-full border border-primary/70"
                    style={{ animationDelay: "1.2s" }}
                  />
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand">
                    <Tv className="h-6 w-6 text-primary-foreground" />
                  </span>
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Broadcast buffering
                </p>
                <span className="h-0.5 w-40 overflow-hidden rounded-full bg-secondary">
                  <span className="block h-full w-1/3 rounded-full bg-brand scan-sweep" />
                </span>
              </div>
            </div>
          ) : null}

          {state === "playing" && intro ? (
            <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/55 intro-fade">
              <div className="grid place-items-center gap-3">
                <span className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl bg-black/40 intro-pop">
                  <ChannelLogo
                    channel={channel}
                    alt=""
                    loading="eager"
                    className="h-full w-full object-contain p-3"
                    placeholderClassName="grid h-full w-full place-items-center font-display text-xl font-bold text-foreground"
                    skeletonClassName="hidden"
                  />
                </span>
                <p className="font-display text-2xl font-bold tracking-tight text-foreground">
                  Enjoy
                </p>
              </div>
            </div>
          ) : null}

          {state === "error" ? (
            <div className="absolute inset-0 grid place-content-center justify-items-center gap-3 bg-black/85 px-6 text-center">
              <p className="text-xs text-muted-foreground">
                This channel isn&apos;t responding right now. Try again in a moment.
              </p>
              <button
                type="button"
                onClick={retry}
                className="tap inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Retry stream
              </button>
            </div>
          ) : null}
        </div>

        <footer className="flex flex-wrap items-center gap-2 px-3 py-2.5">
          <button
            type="button"
            aria-label={paused ? "Play" : "Pause"}
            onClick={togglePlay}
            className="tap grid h-10 w-10 place-items-center rounded-full bg-brand text-primary-foreground"
          >
            {paused ? (
              <Play className="h-4 w-4 fill-current" />
            ) : (
              <Pause className="h-4 w-4 fill-current" />
            )}
          </button>
          <button
            type="button"
            aria-label="Next feed"
            onClick={skip}
            className="tap grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground hover:bg-muted"
          >
            <SkipForward className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Reload feed"
            onClick={retry}
            className="tap grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-2">
            <button
              type="button"
              aria-label={muted ? "Unmute" : "Mute"}
              onClick={() => setMuted((m) => !m)}
              className="tap text-foreground"
            >
              {muted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : volume < 0.5 ? (
                <Volume1 className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              aria-label="Volume"
              onChange={(e) => {
                const v = Number(e.target.value);
                setVolume(v);
                setMuted(v === 0);
              }}
              className="h-1 w-20 accent-[var(--primary)]"
            />
          </div>

          <button
            type="button"
            aria-label="Fullscreen"
            onClick={toggleFullscreen}
            className="tap grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground hover:bg-muted"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {levels.length > 1 ? (
            <select
              aria-label="Quality"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="rounded-full bg-secondary px-3 py-2 text-xs text-foreground"
            >
              <option value={-1}>Auto</option>
              {levels.map((l) => (
                <option key={l.index} value={l.index}>
                  {l.label}
                </option>
              ))}
            </select>
          ) : null}

          {onFavorite ? (
            <button
              type="button"
              onClick={() => onFavorite(channel)}
              aria-label={isFavorite ? "Saved" : "Save channel"}
              className="tap ml-auto grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground hover:bg-muted"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current text-primary" : ""}`} />
            </button>
          ) : null}
        </footer>
      </div>
    </div>
  );
}
