import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Heart,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  RotateCw,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import type { Channel } from "@/lib/channel-types";
import { ChannelLogo } from "@/components/tv/ChannelLogo";
import { getStreamSources } from "@/lib/iptv.functions";
import { useHlsStream } from "@/hooks/use-hls";
import { fetchStoredStream, storeWorkingStream } from "@/lib/stream-links";
import { serverLabel } from "@/lib/servers";
import { getServerPref, setServerPref, subscribeServerPref } from "@/lib/server-pref";

type Props = {
  channel: Channel;
  onClose: () => void;
  onFavorite?: (c: Channel) => void;
  isFavorite?: boolean;
};

/** Seconds of real playback required before the "Enjoy" flourish appears. */
const ENJOY_AFTER = 10;

export function PlayerModal({ channel, onClose, onFavorite, isFavorite }: Props) {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [paused, setPaused] = useState(false);
  const [intro, setIntro] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [full, setFull] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const [waited, setWaited] = useState(0);
  const [progress, setProgress] = useState(0);
  const shell = useRef<HTMLDivElement | null>(null);
  const hideTimer = useRef<number | undefined>(undefined);

  const serverPref = useSyncExternalStore(subscribeServerPref, getServerPref, () => "auto");

  const sources = useQuery({
    queryKey: ["stream-sources", channel.slug],
    queryFn: () => getStreamSources({ data: { slug: channel.slug } }),
    staleTime: 30 * 60 * 1000,
  });

  const stored = useQuery({
    queryKey: ["stored-stream", channel.slug],
    queryFn: () => fetchStoredStream(channel.slug),
    staleTime: 10 * 60 * 1000,
  });

  // Links ordered so the chosen server is tried first.
  const ordered = useMemo(() => {
    const links = sources.data?.links ?? [{ url: channel.streamUrl, source: channel.source }];
    if (serverPref === "auto") return links;
    return [
      ...links.filter((l) => l.source === serverPref),
      ...links.filter((l) => l.source !== serverPref),
    ];
  }, [sources.data, serverPref, channel.streamUrl, channel.source]);

  const onWorking = useCallback(
    (link: { url: string; mode: string }) => {
      void storeWorkingStream(channel.slug, channel.name, link);
      const hit = (sources.data?.links ?? []).find((l) => l.url === link.url);
      // The server that delivered becomes the app default.
      if (hit?.source) setServerPref(hit.source);
    },
    [channel.slug, channel.name, sources.data],
  );

  const { videoRef, state, levels, level, setLevel, recovering, retry, skip, attemptLabel } =
    useHlsStream(stored.isLoading || sources.isLoading ? null : (ordered[0]?.url ?? null), {
      muted,
      cacheKey: channel.slug,
      fallbacks: ordered.slice(1).map((l) => l.url),
      preferred: stored.data ?? null,
      onWorking,
    });


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

  const seek = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.currentTime = Math.max(0, v.currentTime + delta);
    } catch {
      /* live edge streams may refuse seeking */
    }
  };

  const nudgeUi = () => {
    setUiVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setUiVisible(false), 3200);
  };

  useEffect(() => {
    nudgeUi();
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    const onFs = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key.toLowerCase() === "f") toggleFullscreen();
      if (e.key.toLowerCase() === "m") setMuted((m) => !m);
      if (e.key === "ArrowLeft") seek(-10);
      if (e.key === "ArrowRight") seek(10);
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

  // The stream must genuinely run for 10s before the logo swell + "Enjoy".
  useEffect(() => {
    if (state !== "playing" || introDone) return;
    const v = videoRef.current;
    if (!v) return;
    let played = 0;
    let last = v.currentTime;
    const id = window.setInterval(() => {
      if (v.paused) return;
      const delta = v.currentTime - last;
      last = v.currentTime;
      if (delta > 0 && delta < 2) played += delta;
      if (played >= ENJOY_AFTER) {
        window.clearInterval(id);
        setIntro(true);
        setIntroDone(true);
        window.setTimeout(() => setIntro(false), 2400);
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [state, introDone, videoRef]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/90 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        ref={shell}
        onMouseMove={nudgeUi}
        onTouchStart={nudgeUi}
        className="relative w-full overflow-hidden rounded-t-3xl bg-card shadow-ember ring-1 ring-border/60 sm:max-w-3xl sm:rounded-3xl"
      >
        <div className="relative aspect-video w-full bg-black">
          <video
            ref={videoRef}
            playsInline
            autoPlay
            className="h-full w-full"
            onClick={nudgeUi}
            onPlay={() => setPaused(false)}
            onPause={() => setPaused(true)}
          />

          {/* Top bar: identity + close */}
          <div
            className={`pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-gradient-to-b from-black/80 to-transparent p-3 transition-opacity duration-200 ${
              uiVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="pointer-events-auto flex min-w-0 items-center gap-2">
              <button
                type="button"
                aria-label="Back"
                onClick={onClose}
                className="tap grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black/60 text-foreground backdrop-blur hover:bg-black/80"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{channel.name}</p>
                <p className="truncate text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {channel.categories[0] ?? "live"}
                </p>
              </div>
            </div>
            <div className="pointer-events-auto flex shrink-0 items-center gap-1.5">
              {onFavorite ? (
                <button
                  type="button"
                  onClick={() => onFavorite(channel)}
                  aria-label={isFavorite ? "Saved" : "Save channel"}
                  className="tap grid h-9 w-9 place-items-center rounded-full bg-black/60 text-foreground backdrop-blur hover:bg-black/80"
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? "fill-current text-primary" : ""}`} />
                </button>
              ) : null}
              <button
                type="button"
                aria-label="Close player"
                onClick={onClose}
                className="tap grid h-9 w-9 place-items-center rounded-full bg-black/60 text-foreground backdrop-blur hover:bg-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Centre controls, on screen */}
          {state === "playing" ? (
            <div
              className={`pointer-events-none absolute inset-0 z-20 grid place-items-center transition-opacity duration-200 ${
                uiVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="pointer-events-auto flex items-center gap-4 sm:gap-6">

                <button
                  type="button"
                  aria-label="Back 10 seconds"
                  onClick={() => seek(-10)}
                  className="tap grid h-12 w-12 place-items-center rounded-full bg-black/55 text-foreground backdrop-blur hover:bg-black/75"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label={paused ? "Play" : "Pause"}
                  onClick={togglePlay}
                  className="tap grid h-16 w-16 place-items-center rounded-full bg-brand text-primary-foreground shadow-ember"
                >
                  {paused ? (
                    <Play className="h-7 w-7 fill-current" />
                  ) : (
                    <Pause className="h-7 w-7 fill-current" />
                  )}
                </button>
                <button
                  type="button"
                  aria-label="Forward 10 seconds"
                  onClick={() => seek(10)}
                  className="tap grid h-12 w-12 place-items-center rounded-full bg-black/55 text-foreground backdrop-blur hover:bg-black/75"
                >
                  <RotateCw className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : null}

          {/* Bottom overlay strip: volume, quality, next feed, fullscreen */}
          <div
            className={`absolute inset-x-0 bottom-0 z-30 flex flex-wrap items-center gap-2 bg-gradient-to-t from-black/85 to-transparent px-3 pb-3 pt-8 transition-opacity duration-200 ${
              uiVisible && state === "playing" ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >

            <span className="live-dot rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground backdrop-blur">
              Live
            </span>

            <div className="flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 backdrop-blur">
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

            {levels.length > 1 ? (
              <select
                aria-label="Quality"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="rounded-full bg-black/55 px-3 py-1.5 text-xs text-foreground backdrop-blur"
              >
                <option value={-1}>Auto</option>
                {levels.map((l) => (
                  <option key={l.index} value={l.index}>
                    {l.label}
                  </option>
                ))}
              </select>
            ) : null}

            <button
              type="button"
              aria-label="Next feed"
              onClick={skip}
              className="tap ml-auto grid h-9 w-9 place-items-center rounded-full bg-black/55 text-foreground backdrop-blur hover:bg-black/80"
            >
              <SkipForward className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={full ? "Exit fullscreen" : "Fullscreen"}
              onClick={toggleFullscreen}
              className="tap grid h-9 w-9 place-items-center rounded-full bg-black/55 text-foreground backdrop-blur hover:bg-black/80"
            >
              {full ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>

          {state === "loading" ? (
            <div
              className={`absolute inset-0 z-10 grid place-items-center overflow-hidden transition-colors duration-1000 ${
                waited > 10 ? "bg-[#1a0a0c]" : waited > 5 ? "bg-[#0d0f14]" : "bg-black"
              }`}
            >

              <div className="absolute inset-0 opacity-20">
                <ChannelLogo
                  channel={channel}
                  alt=""
                  loading="eager"
                  className="absolute inset-0 h-full w-full scale-110 object-contain p-16 blur-3xl"
                  placeholderClassName="hidden"
                  skeletonClassName="hidden"
                />
              </div>
              <div className="relative grid place-items-center gap-5">
                <span className="relative grid h-28 w-28 place-items-center">
                  <span className="broadcast-ring absolute inset-0 rounded-3xl border border-primary/60" />
                  <span
                    className="broadcast-ring absolute inset-0 rounded-3xl border border-primary/60"
                    style={{ animationDelay: "0.6s" }}
                  />
                  <span
                    className="broadcast-ring absolute inset-0 rounded-3xl border border-primary/60"
                    style={{ animationDelay: "1.2s" }}
                  />
                  <span className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl bg-card ring-1 ring-border/70">
                    <ChannelLogo
                      channel={channel}
                      alt=""
                      loading="eager"
                      className="h-full w-full object-contain p-3"
                      placeholderClassName="grid h-full w-full place-items-center font-display text-xl font-bold text-foreground"
                      skeletonClassName="absolute inset-0 logo-skeleton"
                    />
                  </span>
                </span>
                <p className="text-xs text-muted-foreground">
                  <span className="font-display font-semibold text-foreground">Opencast</span>{" "}
                  {recovering
                    ? "is re-syncing the stream…"
                    : waited > 10
                      ? "is locking on to the signal — hang tight…"
                      : waited > 5
                        ? "is finding the best server…"
                        : "is buffering the stream…"}
                </p>

                <span className="flex items-end gap-1" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className="signal-bar w-1 rounded-full bg-primary"
                      style={{ height: `${8 + i * 5}px`, animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          ) : null}

          {state === "playing" && !introDone && !intro ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-16 z-10 grid place-items-center">
              <span className="rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-medium text-foreground backdrop-blur">
                Preparing your stream…
              </span>
            </div>
          ) : null}

          {state === "playing" && intro ? (
            <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-black/60 intro-fade">

              <div className="grid place-items-center gap-3">
                <span className="grid h-28 w-28 place-items-center overflow-hidden rounded-2xl bg-black/40 intro-pop">
                  <ChannelLogo
                    channel={channel}
                    alt=""
                    loading="eager"
                    className="h-full w-full object-contain p-3"
                    placeholderClassName="grid h-full w-full place-items-center font-display text-xl font-bold text-foreground"
                    skeletonClassName="hidden"
                  />
                </span>
                <p className="font-display text-3xl font-bold tracking-tight text-foreground">
                  Enjoy
                </p>
              </div>
            </div>
          ) : null}

          {state === "error" ? (
            <div className="absolute inset-0 grid place-content-center justify-items-center gap-3 bg-black/90 px-6 text-center">
              <p className="text-xs text-muted-foreground">
                Every known link for this channel timed out. Try again — links often come back.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={retry}
                  className="tap inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Retry stream
                </button>
                <button
                  type="button"
                  onClick={skip}
                  className="tap inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-foreground"
                >
                  <SkipForward className="h-3.5 w-3.5" /> Next source
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
