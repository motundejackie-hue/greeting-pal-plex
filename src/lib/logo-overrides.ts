import { supabase } from "@/integrations/supabase/client";

/** Channel-slug -> logo URL overrides saved in `tv_logos`, cached for instant paint. */
const KEY = "opencast-logo-overrides";
let map: Record<string, string> = {};
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function subscribeLogoOverrides(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getLogoOverride(slug: string): string | undefined {
  return map[slug];
}

export function getLogoOverridesSnapshot() {
  return map;
}

export async function loadLogoOverrides() {
  if (typeof window === "undefined" || loaded) return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      map = { ...(JSON.parse(raw) as Record<string, string>) };
      emit();
    }
  } catch {
    /* ignore */
  }
  const { data } = await supabase.from("tv_logos").select("channel_slug, logo_url");
  if (!data) return;
  const next: Record<string, string> = { ...map };
  for (const row of data) {
    if (row.channel_slug && row.logo_url) next[row.channel_slug] = row.logo_url;
  }
  map = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* quota */
  }
  emit();
}

export function setLogoOverride(slug: string, url: string) {
  map = { ...map, [slug]: url };
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* quota */
  }
  emit();
}
