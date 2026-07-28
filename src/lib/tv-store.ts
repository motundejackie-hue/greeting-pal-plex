import { supabase } from "@/integrations/supabase/client";
import type { Channel } from "./channel-types";

/** Permanently hide a channel from the whole app (backed by the `tv` table). */
export async function deleteChannelForever(channel: Channel) {
  const { error } = await supabase.from("tv").upsert(
    {
      slug: channel.slug,
      name: channel.name,
      country: channel.country,
      categories: channel.categories,
      languages: channel.languages,
      stream_url: channel.streamUrl,
      quality: channel.quality,
      source: channel.source,
      is_hidden: true,
    },
    { onConflict: "slug" },
  );
  if (error) throw error;
}

export async function restoreHiddenChannels() {
  const { error } = await supabase.from("tv").update({ is_hidden: false }).eq("is_hidden", true);
  if (error) throw error;
}

export async function addChannel(input: {
  slug: string;
  name: string;
  streamUrl: string;
  country?: string | null;
  categories?: string[];
  source?: string;
}) {
  const { error } = await supabase.from("tv").upsert(
    {
      slug: input.slug,
      name: input.name,
      stream_url: input.streamUrl,
      country: input.country ?? null,
      categories: input.categories ?? [],
      languages: [],
      source: input.source ?? "manual",
      is_hidden: false,
    },
    { onConflict: "slug" },
  );
  if (error) throw error;
}

export async function saveLogo(slug: string, name: string, logoUrl: string) {
  const { error } = await supabase
    .from("tv_logos")
    .upsert(
      { channel_slug: slug, name, logo_url: logoUrl, source: "manual", verified: true },
      { onConflict: "channel_slug" },
    );
  if (error) throw error;
}

export async function listLogos() {
  const { data } = await supabase.from("tv_logos").select("channel_slug, name, logo_url, verified");
  return data ?? [];
}
