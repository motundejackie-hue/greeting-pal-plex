/** Which link server the app prefers. Sticky: last working source wins. */
const KEY = "opencast-server";

let current = "auto";
const listeners = new Set<() => void>();

export function loadServerPref() {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem(KEY);
  if (saved && saved !== current) {
    current = saved;
    listeners.forEach((l) => l());
  }
}

export function getServerPref() {
  return current;
}

export function setServerPref(id: string) {
  if (id === current) return;
  current = id;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, id);
    } catch {
      /* quota */
    }
  }
  listeners.forEach((l) => l());
}

export function subscribeServerPref(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
