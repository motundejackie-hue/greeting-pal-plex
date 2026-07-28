import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";

const PROXY = import.meta.env.VITE_CORS_PROXY_URL ?? "https://corsproxy.io/?";

export type PlayState = "loading" | "playing" | "error";

type Options = { muted?: boolean; autoPlay?: boolean };

/**
 * Attaches an HLS stream to a video element with a 3-stage fallback chain:
 * direct -> app stream proxy -> public CORS proxy, each retried once.
 */
export function useHlsStream(url: string | null, options: Options = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [state, setState] = useState<PlayState>("loading");
  const [levels, setLevels] = useState<{ index: number; label: string }[]>([]);
  const [level, setLevelState] = useState(-1);
  const [attemptLabel, setAttemptLabel] = useState("Direct");

  const setLevel = useCallback((index: number) => {
    if (hlsRef.current) hlsRef.current.currentLevel = index;
    setLevelState(index);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let cancelled = false;
    let stage = 0;
    const candidates = [
      { label: "Direct", href: url },
      { label: "Proxy", href: `/api/stream-proxy?url=${encodeURIComponent(url)}` },
      { label: "CORS proxy", href: `${PROXY}${encodeURIComponent(url)}` },
    ];

    const cleanup = () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
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

      if (Hls.isSupported() && isHls) {
        const hls = new Hls({
          maxBufferLength: 30,
          enableWorker: true,
          lowLatencyMode: true,
          abrEwmaDefaultEstimate: 800000,
          startLevel: -1,
        });
        hlsRef.current = hls;
        hls.loadSource(href);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (cancelled) return;
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
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR && stage < candidates.length - 1) {
            stage += 1;
            attach();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            stage += 1;
            attach();
          }
        });
      } else {
        video.src = href;
        const onReady = () => {
          if (cancelled) return;
          setState("playing");
          if (options.autoPlay !== false) video.play().catch(() => undefined);
        };
        const onFail = () => {
          if (cancelled) return;
          stage += 1;
          attach();
        };
        video.addEventListener("loadedmetadata", onReady, { once: true });
        video.addEventListener("error", onFail, { once: true });
      }
    };

    video.muted = options.muted ?? false;
    attach();

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, options.muted]);

  return { videoRef, state, levels, level, setLevel, attemptLabel };
}
