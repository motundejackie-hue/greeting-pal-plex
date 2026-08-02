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
  /** Link already known to work (from the shared `tv_streams` registry). */
  preferred?: { url: string; mode: string } | null;
  /** Called with the link + transport that finally played. */
  onWorking?: (link: { url: string; mode: string }) => void;
};

/**
 * Attaches an HLS stream to a video element.
 *
 * Order: known-good link -> primary link -> every backup, each tried
 * direct -> app proxy -> CORS proxy. Slow links are given a long grace window
 * (and a second, longer pass) instead of being abandoned, and once playing a
 * watchdog recovers stalls by reloading, dropping quality, then moving on.
 */
export function useHlsStream(url: string | null, options: Options = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [state, setState] = useState<PlayState>("loading");
  const [levels, setLevels] = useState<{ index: number; label: string }[]>([]);
  const [level, setLevelState] = useState(-1);
  const [attemptLabel, setAttemptLabel] = useState("Direct");
  const [attempt, setAttempt] = useState({ index: 0, total: 1 });
  const [recovering, setRecovering] = useState(false);
  const controls = useRef<{ retry: () => void; skip: () => void }>({
    retry: () => undefined,
    skip: () => undefined,
  });
  const fallbackKey = (options.fallbacks ?? []).join("|");
  const preferredKey = options.preferred ? `${options.preferred.mode}:${options.preferred.url}` : "";

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
    let pass = 0; // 0 = patient pass, 1 = very patient second pass
    let timer: number | undefined;
    let watchdog: number | undefined;

    const build = (src: string, tag: string, mode?: string) => {
      const all = [
        { label: `Direct${tag}`, href: src, src, mode: "direct" },
        {
          label: `Proxy${tag}`,
          href: `/api/stream-proxy?url=${encodeURIComponent(src)}`,
          src,
          mode: "proxy",
        },
        { label: `CORS proxy${tag}`, href: `${PROXY}${encodeURIComponent(src)}`, src, mode: "cors" },
      ];
      return mode ? all.filter((c) => c.mode === mode) : all;
    };

    const sources = [url, ...(options.fallbacks ?? []).filter((u) => u && u !== url)];
    let candidates = sources.flatMap((src, i) => build(src, i === 0 ? "" : ` · backup ${i}`));

    // Jump straight to whatever worked last time — shared registry first, then this device.
    const known = options.preferred ?? (options.cacheKey ? getCachedStream(options.cacheKey) : null);
    if (known?.url) {
      candidates = [
        ...build(known.url, " · saved", known.mode),
        ...candidates.filter((c) => !(c.src === known.url && c.mode === known.mode)),
      ];
    }

    const cleanup = () => {
      if (timer) window.clearTimeout(timer);
      if (watchdog) window.clearInterval(watchdog);
      timer = undefined;
      watchdog = undefined;
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };

    const next = () => {
      stage += 1;
      attach();
    };

    const succeeded = () => {
      const c = candidates[stage];
      if (!c) return;
      if (options.cacheKey) setCachedStream(options.cacheKey, c.src, c.mode);
      options.onWorking?.({ url: c.src, mode: c.mode });
    };

    /** Recovers a stream that started but stopped moving. */
    const startWatchdog = () => {
      if (watchdog) window.clearInterval(watchdog);
      let last = -1;
      let stuck = 0;
      watchdog = window.setInterval(() => {
        const v = videoRef.current;
        if (cancelled || !v || v.paused || v.ended) return;
        if (v.currentTime > last + 0.05) {
          last = v.currentTime;
          if (stuck > 0) setRecovering(false);
          stuck = 0;
          return;
        }
        stuck += 1;
        if (stuck === 3) {
          setRecovering(true);
          hlsRef.current?.startLoad();
          v.play().catch(() => undefined);
        } else if (stuck === 6) {
          // Drop to a lighter rendition before giving up on this source.
          const hls = hlsRef.current;
          if (hls && hls.levels.length > 1) {
            const lower = Math.max(0, (hls.currentLevel < 0 ? hls.levels.length - 1 : hls.currentLevel) - 1);
            hls.currentLevel = lower;
            setLevelState(lower);
          }
        } else if (stuck >= 10) {
          setRecovering(false);
          next();
        }
      }, 2000);
    };

    const attach = () => {
      if (cancelled) return;
      if (stage >= candidates.length) {
        if (pass === 0) {
          // Give every link a second, longer chance instead of declaring it dead.
          pass = 1;
          stage = 0;
        } else {
          setState("error");
          setAttempt({ index: candidates.length, total: candidates.length });
          return;
        }
      }
      const { label, href } = candidates[stage];
      setAttemptLabel(label);
      setRecovering(false);
      setAttempt({ index: stage + 1, total: candidates.length });
      setState("loading");
      cleanup();

      const isHls = href.includes(".m3u8") || href.includes("stream-proxy") || href.includes(PROXY);
      const grace = pass === 0 ? 22000 : 35000;

      // Patient: slow sources get a long window before we move on.
      timer = window.setTimeout(() => {
        if (!cancelled) next();
      }, grace);

      if (Hls.isSupported() && isHls) {
        const hls = new Hls({
          maxBufferLength: 16,
          maxMaxBufferLength: 60,
          backBufferLength: 30,
          maxBufferSize: 40 * 1000 * 1000,
          enableWorker: true,
          lowLatencyMode: false,
          progressive: true,
          startLevel: -1,
          testBandwidth: false,
          abrEwmaDefaultEstimate: 2000000,
          maxStarvationDelay: 4,
          manifestLoadingTimeOut: grace,
          manifestLoadingMaxRetry: 4,
          manifestLoadingRetryDelay: 800,
          levelLoadingTimeOut: grace,
          levelLoadingMaxRetry: 4,
          fragLoadingTimeOut: 30000,
          fragLoadingMaxRetry: 6,
          fragLoadingRetryDelay: 800,
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
          startWatchdog();
          if (options.autoPlay !== false) video.play().catch(() => undefined);
        });
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (!data.fatal || cancelled) return;
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            setRecovering(true);
            hls.recoverMediaError();
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            // One in-place reload before walking to the next candidate.
            if (!recoveredOnce) {
              recoveredOnce = true;
              setRecovering(true);
              hls.startLoad();
              return;
            }
          }
          next();
        });
      } else {
        video.preload = "auto";
        video.src = href;
        const onReady = () => {
          if (cancelled) return;
          if (timer) window.clearTimeout(timer);
          succeeded();
          setState("playing");
          startWatchdog();
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

    let recoveredOnce = false;

    controls.current = {
      retry: () => {
        recoveredOnce = false;
        attach();
      },
      skip: () => {
        recoveredOnce = false;
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
  }, [url, options.muted, fallbackKey, options.cacheKey, preferredKey]);

  return {
    videoRef,
    state,
    levels,
    level,
    setLevel,
    attemptLabel,
    attempt,
    recovering,
    retry,
    skip,
  };
}
