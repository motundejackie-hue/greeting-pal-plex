/** Remembers the stream URL + transport that actually worked for a channel. */
const KEY = "opencast-stream-cache";
const TTL = 12 * 60 * 60 * 1000;

type Entry = { url: string; mode: string; at: number };

function readAll(): Record<string, Entry> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, Entry>;
  } catch {
    return {};
  }
}

export function getCachedStream(slug: string): Entry | null {
  const entry = readAll()[slug];
  if (!entry) return null;
  if (Date.now() - entry.at > TTL) return null;
  return entry;
}

export function setCachedStream(slug: string, url: string, mode: string) {
  if (typeof window === "undefined") return;
  const all = readAll();
  all[slug] = { url, mode, at: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* quota */
  }
}

export function clearStreamCache() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
