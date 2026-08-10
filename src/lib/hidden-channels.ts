import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Slugs an admin removed from the app, cached locally for instant filtering. */
const KEY = "opencast-hidden-channels";
let slugs: string[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function snapshot() {
  return slugs;
}

export async function loadHiddenChannels() {
  if (typeof window === "undefined" || loaded) return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      slugs = JSON.parse(raw) as string[];
      emit();
    }
  } catch {
    /* ignore */
  }
  const { data } = await supabase.from("tv_hidden").select("channel_slug");
  if (!data) return;
  slugs = Array.from(new Set(data.map((r) => r.channel_slug).filter(Boolean)));
  try {
    localStorage.setItem(KEY, JSON.stringify(slugs));
  } catch {
    /* quota */
  }
  emit();
}

export async function hideChannel(slug: string, name: string) {
  await supabase.from("tv_hidden").insert({ channel_slug: slug, name });
  slugs = Array.from(new Set([...slugs, slug]));
  try {
    localStorage.setItem(KEY, JSON.stringify(slugs));
  } catch {
    /* quota */
  }
  emit();
}

export async function restoreChannel(slug: string) {
  await supabase.from("tv_hidden").delete().eq("channel_slug", slug);
  slugs = slugs.filter((s) => s !== slug);
  try {
    localStorage.setItem(KEY, JSON.stringify(slugs));
  } catch {
    /* quota */
  }
  emit();
}

/** Reactive list of hidden slugs. */
export function useHiddenChannels() {
  const list = useSyncExternalStore(subscribe, snapshot, () => slugs);
  useEffect(() => {
    void loadHiddenChannels();
  }, []);
  return list;
}
