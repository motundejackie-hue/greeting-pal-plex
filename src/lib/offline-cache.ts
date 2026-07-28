/** Local snapshot of the channel catalog so the app still opens without network. */
const PREFIX = "opencast-cache:";

export function readCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeCache(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* quota — ignore */
  }
}

export function clearCache() {
  if (typeof window === "undefined") return;
  for (const k of Object.keys(localStorage)) {
    if (k.startsWith(PREFIX)) localStorage.removeItem(k);
  }
}

/** Run a fetcher, snapshot its result, and fall back to the snapshot offline. */
export async function withCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  try {
    const fresh = await fetcher();
    writeCache(key, fresh);
    return fresh;
  } catch (error) {
    const cached = readCache<T>(key);
    if (cached) return cached;
    throw error;
  }
}
