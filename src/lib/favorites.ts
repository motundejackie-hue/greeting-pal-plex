import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const KEY = "opencast-favorites";
const RECENT_KEY = "opencast-recent";

function readLocal(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function writeLocal(key: string, value: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

export function useFavorites(userId: string | null) {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(readLocal(KEY));
    if (!userId) return;
    supabase
      .from("favorites")
      .select("channel_slug")
      .then(({ data }) => {
        if (!data) return;
        const cloud = data.map((r) => r.channel_slug as string);
        setSlugs((prev) => {
          const merged = [...new Set([...prev, ...cloud])];
          writeLocal(KEY, merged);
          return merged;
        });
      });
  }, [userId]);

  const toggle = useCallback(
    (slug: string) => {
      setSlugs((prev) => {
        const has = prev.includes(slug);
        const next = has ? prev.filter((s) => s !== slug) : [slug, ...prev];
        writeLocal(KEY, next);
        if (userId) {
          if (has) void supabase.from("favorites").delete().eq("channel_slug", slug).eq("user_id", userId);
          else void supabase.from("favorites").insert({ channel_slug: slug, user_id: userId });
        }
        return next;
      });
    },
    [userId],
  );

  return { slugs, toggle, isFavorite: (s: string) => slugs.includes(s) };
}

export function useRecent() {
  const [slugs, setSlugs] = useState<string[]>([]);
  useEffect(() => setSlugs(readLocal(RECENT_KEY)), []);
  const push = useCallback((slug: string) => {
    setSlugs((prev) => {
      const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, 20);
      writeLocal(RECENT_KEY, next);
      return next;
    });
  }, []);
  return { slugs, push };
}
