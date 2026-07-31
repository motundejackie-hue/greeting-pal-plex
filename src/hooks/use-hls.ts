import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { getCachedStream, setCachedStream } from "@/lib/stream-cache";

const PROXY = import.meta.env.VITE_CORS_PROXY_URL ?? "https://corsproxy.io/?";

export type PlayState = "loading" | "playing" | "error";

type Options = {
  muted?: boolean;
  autoPlay?: boolean;
  fallbacks?: string[];
  /** Channel slug — a successful source is cached under it and reused next time. */
  cacheKey?: string;
};

/**
 * Attaches an HLS stream to a video element. A previously working source is
 * tried first, then every source (primary link, then backups) is tried
 * direct -> app proxy -> CORS proxy until one plays.
 */
export function useHlsStream(url: string | null, options: Options = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [state, setState] = useState<PlayState>("loading");
  const [levels, setLevels] = useState<{ index: number; label: string }[]>([]);
  const [level, setLevelState] = useState(-1);
  const [attemptLabel, setAttemptLabel] = useState("Direct");
  const [attempt, setAttempt] = useState({ index: 0, total: 1 });
  const controls = useRef<{ retry: () => void; skip: () => void }>({
    retry: () => undefined,
    skip: () => undefined,
  });
  const fallbackKey = (options.fallbacks ?? []).join("|");

  const setLevel = useCallback((index: number) => {
    if (hlsRef.current) hlsRef.current.currentLevel = index;
    setLevelState(index);
  }, []);

  const retry = useCallback(() => controls.current.retry(), []);
  const skip = useCallback(() => controls.current.skip(), []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let cancelled = false;
    let stage = 0;
    let timer: number | undefined;

    const build = (src: string, tag: string) => [
      { label: `Direct${tag}`, href: src, src, mode: "direct" },
      {
        label: `Proxy${tag}`,
        href: `/api/stream-proxy?url=${encodeURIComponent(src)}`,
        src,
        mode: "proxy",
      },
      { label: `CORS proxy${tag}`, href: `${PROXY}${encodeURIComponent(src)}`, src, mode: "cors" },
    ];

    const sources = [url, ...(options.fallbacks ?? []).filter((u) => u && u !== url)];
    let candidates = sources.flatMap((src, i) => build(src, i === 0 ? "" : ` · backup ${i}`));

    // Jump straight to whatever worked last time.
    const cached = options.cacheKey ? getCachedStream(options.cacheKey) : null;
    if (cached) {
      const preferred = build(cached.url, " · saved").filter((c) => c.mode === cached.mode);
      candidates = [
        ...preferred,
        ...candidates.filter((c) => !(c.src === cached.url && c.mode === cached.mode)),
      ];
    }

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

    const succeeded = () => {
      const c = candidates[stage];
      if (c && options.cacheKey) setCachedStream(options.cacheKey, c.src, c.mode);
    };

    const attach = () => {
      if (cancelled) return;
      if (stage >= candidates.length) {
        setState("error");
        setAttempt({ index: candidates.length, total: candidates.length });
        return;
      }
      const { label, href } = candidates[stage];
      setAttemptLabel(label);
      setAttempt({ index: stage + 1, total: candidates.length });
      setState("loading");
      cleanup();

      const isHls = href.includes(".m3u8") || href.includes("stream-proxy") || href.includes(PROXY);

      // Don't sit forever on a dead source — move to the next candidate fast.
      timer = window.setTimeout(() => {
        if (!cancelled) next();
      }, 9000);

      if (Hls.isSupported() && isHls) {
        const hls = new Hls({
          // Fast start: small first buffer, then grow it for smoothness.
          maxBufferLength: 12,
          maxMaxBufferLength: 60,
          backBufferLength: 20,
          maxBufferSize: 30 * 1000 * 1000,
          enableWorker: true,
          lowLatencyMode: false,
          progressive: true,
          startLevel: -1,
          testBandwidth: false,
          abrEwmaDefaultEstimate: 2000000,
          maxStarvationDelay: 2,
          manifestLoadingTimeOut: 7000,
          manifestLoadingMaxRetry: 1,
          levelLoadingTimeOut: 7000,
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
          succeeded();
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
          succeeded();
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

    controls.current = {
      retry: () => {
        if (stage >= candidates.length) stage = 0;
        attach();
      },
      skip: () => {
        if (stage >= candidates.length) {
          stage = 0;
          attach();
        } else {
          next();
        }
      },
    };

    video.muted = options.muted ?? false;
    video.preload = "auto";
    attach();

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, options.muted, fallbackKey, options.cacheKey]);

  return { videoRef, state, levels, level, setLevel, attemptLabel, attempt, retry, skip };
}
