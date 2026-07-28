import { useCallback, useEffect, useState } from "react";

export type Settings = {
  autoplayPreviews: boolean;
  defaultCountry: string;
  compactCards: boolean;
};

const KEY = "opencast-settings";
const DEFAULTS: Settings = { autoplayPreviews: true, defaultCountry: "", compactCards: false };

export function readSettings(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Settings>) };
  } catch {
    return DEFAULTS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => setSettings(readSettings()), []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* noop */
      }
      return next;
    });
  }, []);

  return { settings, update };
}
