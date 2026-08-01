import { supabase } from "@/integrations/supabase/client";

/**
 * Working-link registry. Every link that actually played is written to
 * `tv_streams` so the next viewer skips the whole source walk.
 */
export type StreamLink = { url: string; mode: string };

export async function fetchStoredStream(slug: string): Promise<StreamLink | null> {
  const { data } = await supabase
    .from("tv_streams")
    .select("url, mode")
    .eq("channel_slug", slug)
    .maybeSingle();
  if (!data?.url) return null;
  return { url: data.url, mode: data.mode ?? "direct" };
}

export async function storeWorkingStream(
  slug: string,
  name: string,
  link: StreamLink,
): Promise<void> {
  await supabase.from("tv_streams").upsert(
    {
      channel_slug: slug,
      name,
      url: link.url,
      mode: link.mode,
      fails: 0,
      verified_at: new Date().toISOString(),
    },
    { onConflict: "channel_slug" },
  );
}

export async function reportBrokenStream(slug: string): Promise<void> {
  const { data } = await supabase
    .from("tv_streams")
    .select("fails")
    .eq("channel_slug", slug)
    .maybeSingle();
  if (!data) return;
  await supabase
    .from("tv_streams")
    .update({ fails: (data.fails ?? 0) + 1 })
    .eq("channel_slug", slug);
}
