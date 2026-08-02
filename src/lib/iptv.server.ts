import { createClient } from "@supabase/supabase-js";
import { CHANNEL_LOGOS, getPreferredChannelLogo, normalizeChannelKey } from "./channel-logos";
import type { Channel, CountryInfo, CategoryInfo } from "./channel-types";
import { DIRECT_STREAMS, PLAYLIST_SERVERS } from "./servers";

export type { Channel, CountryInfo, CategoryInfo };

const API = process.env.IPTV_API_URL ?? "https://iptv-org.github.io/api/";

const TTL = 24 * 60 * 60 * 1000;

export type AltLink = { url: string; source: string };

type Catalog = {
  /** Extra stream URLs per channel slug, used as fallbacks when the main link fails. */
  alternates: Record<string, AltLink[]>;
  channels: Channel[];
  countries: CountryInfo[];
  categories: CategoryInfo[];
  builtAt: number;
};


let cache: Catalog | null = null;
let building: Promise<Catalog> | null = null;

async function grab(url: string, headers?: Record<string, string>): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", ...(headers ?? {}) },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function grabJson<T>(url: string): Promise<T | null> {
  const text = await grab(url);
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function attr(line: string, key: string): string | null {
  const m = line.match(new RegExp(`${key}="([^"]*)"`));
  return m && m[1] ? m[1] : null;
}

function qualityRank(q: string | null): number {
  if (!q) return 0;
  const n = parseInt(q, 10);
  return Number.isFinite(n) ? n : 0;
}

function parseM3U(text: string, source: string, forceCategories: string[] = []): Channel[] {
  const out: Channel[] = [];
  const lines = text.split(/\r?\n/);
  let pending: Partial<Channel> | null = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("#EXTINF")) {
      const name = (line.split(",").slice(1).join(",") || "").trim();
      if (!name) {
        pending = null;
        continue;
      }
      const group = attr(line, "group-title");
      const cats = new Set<string>(forceCategories);
      if (group) {
        const g = group.toLowerCase();
        cats.add(g);
        if (/sport|football|soccer|nba|nfl|ufc|cricket|rugby|tennis|f1|motorsport/.test(g))
          cats.add("sports");
      }
      pending = {
        name,
        logo: attr(line, "tvg-logo"),
        country: attr(line, "tvg-country"),
        languages: attr(line, "tvg-language") ? [attr(line, "tvg-language")!] : [],
        categories: [...cats],
        source,
      };
    } else if (line && !line.startsWith("#") && pending) {
      out.push({
        slug: normalizeChannelKey(pending.name!),
        name: pending.name!,
        country: pending.country ?? null,
        categories: pending.categories ?? [],
        languages: pending.languages ?? [],
        streamUrl: line,
        quality: null,
        logo: pending.logo ?? null,
        source,
      });
      pending = null;
    }
  }
  return out;
}


type OrgChannel = {
  id: string;
  name: string;
  country: string;
  categories: string[];
  languages?: string[];
  logo?: string | null;
  closed?: string | null;
};
type OrgStream = { channel: string | null; url: string; quality?: string | null };
type OrgCountry = { code: string; name: string; flag: string };
type OrgCategory = { id: string; name: string };

async function build(): Promise<Catalog> {
  const [orgChannels, orgStreams, orgCountries, orgCategories] = await Promise.all([
    grabJson<OrgChannel[]>(`${API}channels.json`),
    grabJson<OrgStream[]>(`${API}streams.json`),
    grabJson<OrgCountry[]>(`${API}countries.json`),
    grabJson<OrgCategory[]>(`${API}categories.json`),
  ]);

  const byId = new Map<string, OrgChannel>();
  for (const c of orgChannels ?? []) if (!c.closed) byId.set(c.id, c);

  const merged: Channel[] = [];
  for (const s of orgStreams ?? []) {
    if (!s.url) continue;
    const meta = s.channel ? byId.get(s.channel) : undefined;
    const name = meta?.name ?? s.channel ?? "";
    if (!name) continue;
    merged.push({
      slug: normalizeChannelKey(name),
      name,
      country: meta?.country ?? null,
      categories: meta?.categories ?? [],
      languages: meta?.languages ?? [],
      streamUrl: s.url,
      quality: s.quality ?? null,
      logo: meta?.logo ?? null,
      source: "iptv-org",
    });
  }

  const playlists = await Promise.allSettled(
    PLAYLIST_SERVERS.map(async (p) => {
      const text = await grab(p.url!, p.headers);
      return text ? parseM3U(text, p.id, p.forceCategories ?? []) : [];
    }),
  );
  for (const r of playlists) if (r.status === "fulfilled") merged.push(...r.value);

  for (const d of DIRECT_STREAMS) {
    merged.push({
      slug: normalizeChannelKey(d.name),
      name: d.name,
      country: null,
      categories: ["sports"],
      languages: [],
      streamUrl: d.url,
      quality: null,
      logo: null,
      source: "direct",
    });
  }

  // Dedupe by channel name (slug = normalized name), keeping every distinct URL
  // as a backup source so the player can walk through them.
  const seenUrls = new Set<string>();
  const alternates: Record<string, AltLink[]> = {};
  const best = new Map<string, Channel>();
  for (const c of merged) {
    if (!c.slug || !c.streamUrl.startsWith("http")) continue;
    if (seenUrls.has(c.streamUrl)) continue;
    seenUrls.add(c.streamUrl);
    const current = best.get(c.slug);
    if (!current) {
      best.set(c.slug, c);
      continue;
    }
    // merge metadata
    current.logo = current.logo ?? c.logo;
    current.country = current.country ?? c.country;
    current.categories = [...new Set([...current.categories, ...c.categories])];
    if (current.languages.length === 0) current.languages = c.languages;
    const better =
      qualityRank(c.quality) > qualityRank(current.quality) ||
      (current.streamUrl.includes(".m3u8") === false && c.streamUrl.includes(".m3u8"));
    const list = (alternates[c.slug] ??= []);
    const has = (u: string) => list.some((l) => l.url === u);
    if (better) {
      if (list.length < 16 && !has(current.streamUrl))
        list.push({ url: current.streamUrl, source: current.source });
      current.streamUrl = c.streamUrl;
      current.quality = c.quality ?? current.quality;
      current.source = c.source;
    } else if (list.length < 16 && !has(c.streamUrl)) {
      list.push({ url: c.streamUrl, source: c.source });
    }
  }



  const channels = [...best.values()];

  // Overlay backend tables: hidden channels + official logos.
  try {
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const sb = createClient(process.env.SUPABASE_URL!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
            h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const [{ data: rows }, { data: logos }] = await Promise.all([
      sb
        .from("tv")
        .select(
          "slug, name, country, categories, languages, stream_url, quality, source, is_hidden",
        ),
      sb.from("tv_logos").select("channel_slug, logo_url"),
    ]);
    const logoMap = new Map(
      (logos ?? []).map((l) => [l.channel_slug as string, l.logo_url as string]),
    );
    const hidden = new Set<string>();
    const index = new Map(channels.map((c) => [c.slug, c]));
    for (const r of rows ?? []) {
      if (r.is_hidden) {
        hidden.add(r.slug as string);
        continue;
      }
      const existing = index.get(r.slug as string);
      if (existing) {
        existing.streamUrl = (r.stream_url as string) || existing.streamUrl;
      } else {
        const c: Channel = {
          slug: r.slug as string,
          name: r.name as string,
          country: (r.country as string) ?? null,
          categories: (r.categories as string[]) ?? [],
          languages: (r.languages as string[]) ?? [],
          streamUrl: r.stream_url as string,
          quality: (r.quality as string) ?? null,
          logo: null,
          source: (r.source as string) ?? "custom",
        };
        channels.push(c);
        index.set(c.slug, c);
      }
    }
    for (const c of channels) {
      const override = logoMap.get(c.slug);
      if (override) c.logo = override;
    }
    if (hidden.size) {
      for (let i = channels.length - 1; i >= 0; i--) {
        if (hidden.has(channels[i].slug)) channels.splice(i, 1);
      }
    }
  } catch {
    /* backend overlay is best-effort */
  }

  // Final logo resolution: prefer curated or existing logo, then fallback candidates.
  for (const c of channels) {
    c.logo = getPreferredChannelLogo(c);
  }

  const countryNames = new Map((orgCountries ?? []).map((c) => [c.code, c]));
  const countryCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  for (const c of channels) {
    if (c.country) countryCounts.set(c.country, (countryCounts.get(c.country) ?? 0) + 1);
    for (const cat of c.categories) categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
  }

  const countries: CountryInfo[] = [...countryCounts.entries()]
    .map(([code, count]) => ({
      code,
      name: countryNames.get(code)?.name ?? code,
      flag: countryNames.get(code)?.flag ?? "🏳️",
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const categoryNames = new Map((orgCategories ?? []).map((c) => [c.id, c.name]));
  const categories: CategoryInfo[] = [...categoryCounts.entries()]
    .map(([id, count]) => ({ id, name: categoryNames.get(id) ?? id, count }))
    .filter((c) => c.count > 2)
    .sort((a, b) => b.count - a.count);

  return { channels, countries, categories, alternates, builtAt: Date.now() };
}

export async function getCatalog(): Promise<Catalog> {
  if (cache && Date.now() - cache.builtAt < TTL) return cache;
  if (!building) {
    building = build()
      .then((c) => {
        cache = c;
        return c;
      })
      .finally(() => {
        building = null;
      });
  }
  return building;
}

export type Query = {
  q?: string;
  country?: string;
  category?: string;
  page?: number;
  pageSize?: number;
};

export function selectChannels(catalog: Catalog, query: Query) {
  const q = (query.q ?? "").trim().toLowerCase();
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(120, Math.max(1, query.pageSize ?? 60));
  let list = catalog.channels;
  if (query.country) list = list.filter((c) => c.country === query.country);
  if (query.category) list = list.filter((c) => c.categories.includes(query.category!));
  if (q) list = list.filter((c) => c.name.toLowerCase().includes(q));
  const total = list.length;
  return { items: list.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize };
}

function pick(catalog: Catalog, predicate: (c: Channel) => boolean, limit = 24) {
  const out: Channel[] = [];
  for (const c of catalog.channels) {
    if (out.length >= limit) break;
    if (predicate(c)) out.push(c);
  }
  return out;
}

const CURATED = [
  "cnn",
  "bbcnews",
  "aljazeeraenglish",
  "skynews",
  "france24english",
  "dwenglish",
  "nhkworldjapan",
  "cna",
  "euronews",
  "bloombergtv",
  "redbulltv",
  "natgeo",
  "history",
  "mtv",
  "cartoonnetwork",
  "nickelodeon",
  "plutotv",
  "espn",
];

export function buildHome(catalog: Catalog, country: string | null) {
  const bySlug = new Map(catalog.channels.map((c) => [c.slug, c]));
  const featured = CURATED.map((s) => bySlug.get(s)).filter(Boolean) as Channel[];
  const withLogo = (c: Channel) => Boolean(c.logo);
  return {
    hero: featured[0] ?? catalog.channels[0] ?? null,
    rows: [
      { id: "picks", title: "Top Picks", items: featured.slice(0, 20) },
      {
        id: "popular",
        title: "Popular",
        items: pick(catalog, (c) => withLogo(c) && c.categories.length > 0, 24),
      },
      { id: "news", title: "News", items: pick(catalog, (c) => c.categories.includes("news"), 24) },
      {
        id: "sports",
        title: "Sports",
        items: pick(catalog, (c) => c.categories.includes("sports"), 60),
      },
      {
        id: "movies",
        title: "Movies",
        items: pick(catalog, (c) => c.categories.includes("movies"), 24),
      },
      { id: "kids", title: "Kids", items: pick(catalog, (c) => c.categories.includes("kids"), 24) },
      {
        id: "family",
        title: "Family",
        items: pick(catalog, (c) => c.categories.includes("family"), 24),
      },
      {
        id: "entertainment",
        title: "Entertainment",
        items: pick(catalog, (c) => c.categories.includes("entertainment"), 24),
      },
      {
        id: "documentary",
        title: "Documentary",
        items: pick(catalog, (c) => c.categories.includes("documentary"), 24),
      },
      {
        id: "games",
        title: "Games",
        items: pick(catalog, (c) => c.categories.includes("games"), 24),
      },
      {
        id: "local",
        title: "Local",
        items: country ? pick(catalog, (c) => c.country === country, 24) : [],
      },
    ].filter((r) => r.items.length > 0),
  };
}
