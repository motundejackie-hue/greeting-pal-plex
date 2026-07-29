import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";

const PROXY = import.meta.env.VITE_CORS_PROXY_URL ?? "https://corsproxy.io/?";

export type PlayState = "loading" | "playing" | "error";

type Options = { muted?: boolean; autoPlay?: boolean; fallbacks?: string[] };

/**
 * Attaches an HLS stream to a video element. Every source (primary link first,
 * then backup links from other providers) is tried direct -> app proxy -> CORS
 * proxy, and the loop keeps going until one of them plays.
 */
export function useHlsStream(url: string | null, options: Options = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [state, setState] = useState<PlayState>("loading");
  const [levels, setLevels] = useState<{ index: number; label: string }[]>([]);
  const [level, setLevelState] = useState(-1);
  const [attemptLabel, setAttemptLabel] = useState("Direct");
  const fallbackKey = (options.fallbacks ?? []).join("|");

  const setLevel = useCallback((index: number) => {
    if (hlsRef.current) hlsRef.current.currentLevel = index;
    setLevelState(index);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let cancelled = false;
    let stage = 0;
    let timer: number | undefined;
    const sources = [url, ...(options.fallbacks ?? []).filter((u) => u && u !== url)];
    const candidates = sources.flatMap((src, i) => {
      const tag = i === 0 ? "" : ` · backup ${i}`;
      return [
        { label: `Direct${tag}`, href: src },
        { label: `Proxy${tag}`, href: `/api/stream-proxy?url=${encodeURIComponent(src)}` },
        { label: `CORS proxy${tag}`, href: `${PROXY}${encodeURIComponent(src)}` },
      ];
    });

    const cleanup = () => {
      if (timer) window.clearTimeout(timer);
      timer = undefined;
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };

    const next = () => {
      stage += 1;
      attach();
    };

    const attach = () => {
      if (cancelled) return;
      if (stage >= candidates.length) {
        setState("error");
        return;
      }
      const { label, href } = candidates[stage];
      setAttemptLabel(label);
      setState("loading");
      cleanup();

      const isHls = href.includes(".m3u8") || href.includes("stream-proxy") || href.includes(PROXY);

      // Don't sit forever on a dead source — move to the next candidate fast.
      timer = window.setTimeout(() => {
        if (!cancelled) next();
      }, 9000);

      if (Hls.isSupported() && isHls) {
        const hls = new Hls({
          // Fast start: fetch a small buffer first, then grow it for smoothness.
          maxBufferLength: 20,
          maxMaxBufferLength: 60,
          backBufferLength: 30,
          maxBufferSize: 40 * 1000 * 1000,
          enableWorker: true,
          lowLatencyMode: false,
          progressive: true,
          startLevel: -1,
          testBandwidth: false,
          abrEwmaDefaultEstimate: 1500000,
          manifestLoadingTimeOut: 8000,
          manifestLoadingMaxRetry: 1,
          levelLoadingTimeOut: 8000,
          fragLoadingTimeOut: 15000,
        });
        hlsRef.current = hls;
        hls.loadSource(href);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (cancelled) return;
          if (timer) window.clearTimeout(timer);
          setLevels(
            hls.levels.map((l, i) => ({
              index: i,
              label: l.height ? `${l.height}p` : `${Math.round((l.bitrate ?? 0) / 1000)}k`,
            })),
          );
          setState("playing");
          if (options.autoPlay !== false) video.play().catch(() => undefined);
        });
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (!data.fatal || cancelled) return;
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            next();
          }
        });
      } else {
        video.preload = "auto";
        video.src = href;
        const onReady = () => {
          if (cancelled) return;
          if (timer) window.clearTimeout(timer);
          setState("playing");
          if (options.autoPlay !== false) video.play().catch(() => undefined);
        };
        const onFail = () => {
          if (cancelled) return;
          next();
        };
        video.addEventListener("loadedmetadata", onReady, { once: true });
        video.addEventListener("error", onFail, { once: true });
      }
    };

    video.muted = options.muted ?? false;
    video.preload = "auto";
    attach();

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, options.muted, fallbackKey]);

  return { videoRef, state, levels, level, setLevel, attemptLabel };
}
