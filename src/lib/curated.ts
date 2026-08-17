import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Channel } from "./channel-types";

/**
 * The app only shows channels an admin has explicitly added to the `tv` table.
 * Nothing from the raw playlists is visible until it is curated.
 */
export const curatedKey = ["curated-channels"] as const;

export async function fetchCuratedChannels(): Promise<Channel[]> {
  const { data, error } = await supabase
    .from("tv")
    .select("slug, name, country, categories, languages, stream_url, quality, source")
    .eq("is_hidden", false)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    slug: row.slug,
    name: row.name,
    country: row.country ?? null,
    categories: row.categories ?? [],
    languages: row.languages ?? [],
    streamUrl: row.stream_url,
    quality: row.quality ?? null,
    logo: null,
    source: row.source ?? "curated",
  }));
}

export function useCuratedChannels() {
  return useQuery({
    queryKey: curatedKey,
    queryFn: fetchCuratedChannels,
    staleTime: 30 * 1000,
  });
}

export function useRefreshCurated() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: curatedKey });
}
