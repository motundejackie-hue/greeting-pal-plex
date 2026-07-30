import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Heart, Loader2, Maximize2, Volume2, VolumeX, X } from "lucide-react";
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
  const shell = useRef<HTMLDivElement | null>(null);
  const sources = useQuery({
    queryKey: ["stream-sources", channel.slug],
    queryFn: () => getStreamSources({ data: { slug: channel.slug } }),
    staleTime: 30 * 60 * 1000,
  });
  const { videoRef, state, levels, level, setLevel, attemptLabel, attempt, retry, skip } =
    useHlsStream(channel.streamUrl, {
      muted,
      fallbacks: sources.data?.urls ?? [],
    });



  const toggleFullscreen = () => {
    const el = shell.current;
    if (!el) return;
    const orientation = screen.orientation as
      (ScreenOrientation & { lock?: (o: string) => Promise<void> }) | undefined;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      try {
        orientation?.unlock?.();
      } catch {
        /* desktop browsers don't support orientation locking */
      }
    } else {
      void el.requestFullscreen?.().then(() => {
        // On phones, fullscreen should always mean landscape.
        try {
          void orientation?.lock?.("landscape").catch(() => undefined);
        } catch {
          /* unsupported */
        }
      });
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key.toLowerCase() === "f") toggleFullscreen();
      if (e.key.toLowerCase() === "m") setMuted((m) => !m);
      if (e.key === " ") {
        e.preventDefault();
        const v = videoRef.current;
        if (v) {
          if (v.paused) {
            void v.play();
          } else {
            v.pause();
          }
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted, videoRef]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        ref={shell}
        className="w-full overflow-hidden rounded-t-2xl bg-card shadow-ember sm:max-w-lg sm:rounded-2xl"
      >
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 py-2">
          <button
            type="button"
            aria-label="Back"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-md bg-secondary text-[10px] font-bold">
              <ChannelLogo
                channel={channel}
                alt={channel.name}
                className="h-full w-full object-contain p-0.5"
                placeholderClassName="grid h-full w-full place-items-center text-[10px] font-bold"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{channel.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">
                {countryFlag(channel.country)} {channel.categories[0] ?? "live"} · {attemptLabel} (
                {attempt.index}/{attempt.total})
              </p>


            </div>
          </div>
          <button
            type="button"
            aria-label="Close player"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-foreground hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="relative aspect-video w-full bg-black">
          <video
            ref={videoRef}
            playsInline
            controls
            autoPlay
            className="h-full w-full"
            poster={channel.logo ?? undefined}
          />
          {state === "loading" ? (
            <div className="absolute inset-0 grid place-items-center bg-black/60">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : null}
          {state === "error" ? (
            <div className="absolute inset-0 grid place-items-center bg-black/80 px-6 text-center">
              <p className="text-xs text-muted-foreground">
                This stream isn&apos;t responding right now. Trying backup sources…
              </p>
            </div>
          ) : null}
        </div>

        <footer className="flex flex-wrap items-center gap-2 px-3 py-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            <Maximize2 className="h-3.5 w-3.5" /> Fullscreen
          </button>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs text-foreground"
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            {muted ? "Unmute" : "Mute"}
          </button>
          {levels.length > 1 ? (
            <select
              aria-label="Quality"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="rounded-full bg-secondary px-3 py-1.5 text-xs text-foreground"
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
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs text-foreground"
            >
              <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-current text-primary" : ""}`} />
              {isFavorite ? "Saved" : "Save"}
            </button>
          ) : null}
        </footer>
      </div>
    </div>
  );
}
