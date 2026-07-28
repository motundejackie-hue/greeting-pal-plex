import { useCallback, useEffect, useState } from "react";

const HIDDEN_KEY = "opencast-hidden-channels";
const YT_KEY = "opencast-youtube-links";

export type YouTubeLink = {
  channelId: string;
  channelName: string;
  videoId: string;
  title: string | null;
  addedAt: number;
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

/** Channels the user deleted from their line-up (persisted locally). */
export function useHiddenChannels() {
  const [hidden, setHidden] = useState<string[]>([]);

  useEffect(() => setHidden(read<string[]>(HIDDEN_KEY, [])), []);

  const hide = useCallback((id: string) => {
    setHidden((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      write(HIDDEN_KEY, next);
      return next;
    });
  }, []);

  const restoreAll = useCallback(() => {
    setHidden([]);
    write(HIDDEN_KEY, []);
  }, []);

  return { hidden, hide, restoreAll };
}

/** Separate, user-verified YouTube channel list. */
export function useYouTubeLinks() {
  const [links, setLinks] = useState<YouTubeLink[]>([]);

  useEffect(() => setLinks(read<YouTubeLink[]>(YT_KEY, [])), []);

  const save = useCallback((link: YouTubeLink) => {
    setLinks((prev) => {
      const next = [link, ...prev.filter((l) => l.channelId !== link.channelId)];
      write(YT_KEY, next);
      return next;
    });
  }, []);

  const remove = useCallback((channelId: string) => {
    setLinks((prev) => {
      const next = prev.filter((l) => l.channelId !== channelId);
      write(YT_KEY, next);
      return next;
    });
  }, []);

  return { links, save, remove };
}
