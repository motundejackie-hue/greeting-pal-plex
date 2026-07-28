import type { Channel } from "./channel-types";

// Official logo table. Key = normalized channel name (lowercase, alphanumeric).
// Guarantees real official artwork for well-known channels; falls back to the
// iptv-org logo, then to initials.
export const CHANNEL_LOGOS: Record<string, string> = {
  // News
  cnn: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/512px-CNN.svg.png",
  cnninternational:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/CNN_International_logo.svg/512px-CNN_International_logo.svg.png",
  cnnusa: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/512px-CNN.svg.png",
  bbcnews:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/BBC_News_2019.svg/512px-BBC_News_2019.svg.png",
  bbcworldnews:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/BBC_News_2019.svg/512px-BBC_News_2019.svg.png",
  bbcone:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/BBC_One_logo_2021.svg/512px-BBC_One_logo_2021.svg.png",
  bbctwo:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/BBC_Two_logo_2021.svg/512px-BBC_Two_logo_2021.svg.png",
  aljazeera:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Aljazeera.svg/512px-Aljazeera.svg.png",
  aljazeeraenglish:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Aljazeera.svg/512px-Aljazeera.svg.png",
  skynews:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Sky_News_2020.svg/512px-Sky_News_2020.svg.png",
  foxnews:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Fox_News_Channel_logo.svg/512px-Fox_News_Channel_logo.svg.png",
  msnbc:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/MSNBC_2015_logo.svg/512px-MSNBC_2015_logo.svg.png",
  bloomberg:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/New_Bloomberg_Logo.svg/512px-New_Bloomberg_Logo.svg.png",
  bloombergtv:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/New_Bloomberg_Logo.svg/512px-New_Bloomberg_Logo.svg.png",
  france24:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/818/FRANCE_24_logo.svg/512px-FRANCE_24_logo.svg.png",
  france24english:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/France24.png/512px-France24.png",
  dwenglish:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Deutsche_Welle_symbol_2012.svg/512px-Deutsche_Welle_symbol_2012.svg.png",
  dw: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Deutsche_Welle_symbol_2012.svg/512px-Deutsche_Welle_symbol_2012.svg.png",
  nhkworldjapan:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/NHK_World-Japan_Logo.svg/512px-NHK_World-Japan_Logo.svg.png",
  cna: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/CNA_new_logo.svg/512px-CNA_new_logo.svg.png",
  euronews:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Euronews._2016_alternative_logo.svg/512px-Euronews._2016_alternative_logo.svg.png",
  abcnews:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/ABC_News_logo_2021.svg/512px-ABC_News_logo_2021.svg.png",
  cbsnews:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/CBS_News_logo_2020.svg/512px-CBS_News_logo_2020.svg.png",
  nbcnews:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/NBC_News_2023_logo.svg/512px-NBC_News_2023_logo.svg.png",
  rt: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Russia-Today-logo.svg/512px-Russia-Today-logo.svg.png",
  trtworld:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/TRT_World_logo.svg/512px-TRT_World_logo.svg.png",

  // Sports
  espn: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/512px-ESPN_wordmark.svg.png",
  espn2:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/ESPN2_logo.svg/512px-ESPN2_logo.svg.png",
  eurosport1:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Eurosport_1_-_Logo_2015.svg/512px-Eurosport_1_-_Logo_2015.svg.png",
  eurosport2:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Eurosport_2_-_Logo_2015.svg/512px-Eurosport_2_-_Logo_2015.svg.png",
  skysportsnews:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Sky_Sports_News.svg/512px-Sky_Sports_News.svg.png",
  dazn: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/DAZN_Logo_Master.svg/512px-DAZN_Logo_Master.svg.png",
  redbulltv:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Red_Bull_TV_logo.svg/512px-Red_Bull_TV_logo.svg.png",

  // Entertainment / docs
  natgeo:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Natgeologo.svg/512px-Natgeologo.svg.png",
  nationalgeographic:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Natgeologo.svg/512px-Natgeologo.svg.png",
  discoverychannel:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Discovery_Channel_logo.svg/512px-Discovery_Channel_logo.svg.png",
  history:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/History_Logo.svg/512px-History_Logo.svg.png",
  historychannel:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/History_Logo.svg/512px-History_Logo.svg.png",
  mtv: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/MTV-2021.svg/512px-MTV-2021.svg.png",
  mtvlive:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/MTV-2021.svg/512px-MTV-2021.svg.png",
  cartoonnetwork:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Cartoon_Network_2010_logo.svg/512px-Cartoon_Network_2010_logo.svg.png",
  nickelodeon:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Nickelodeon_2009_logo.svg/512px-Nickelodeon_2009_logo.svg.png",
  disneychannel:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/2019_Disney_Channel_logo.svg/512px-2019_Disney_Channel_logo.svg.png",
  pluto:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Pluto_TV_logo.svg/512px-Pluto_TV_logo.svg.png",
  plutotv:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Pluto_TV_logo.svg/512px-Pluto_TV_logo.svg.png",
  rakutentv:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Rakuten_TV_logo.svg/512px-Rakuten_TV_logo.svg.png",
  cbc: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/CBC_Logo_2021.svg/512px-CBC_Logo_2021.svg.png",
  rtve: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/RTVE_logo.svg/512px-RTVE_logo.svg.png",
  abc: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/ABC_News_logo_2021.svg/512px-ABC_News_logo_2021.svg.png",
};

export function normalizeChannelKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function getOfficialLogo(name: string, fallback?: string | null): string | null {
  const key = normalizeChannelKey(name);
  const official = CHANNEL_LOGOS[key];
  if (official) return official;
  return fallback ?? null;
}

const PICONS_BASE = "https://raw.githubusercontent.com/picons/picons/master/build-source/logos";
const TV_LOGO_BASE =
  "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/international";
const FANMINGMING_RAW = "https://raw.githubusercontent.com/fanmingming/live/main/tv";
const FANMINGMING_CDN = "https://live.fanmingming.cn/tv";

function normalizeChannelPath(name: string): string {
  return normalizeChannelKey(name);
}

function normalizeTvLogoKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getPiconsCandidates(name: string): string[] {
  const key = normalizeChannelPath(name);
  return [
    `${PICONS_BASE}/${key}.default.svg`,
    `${PICONS_BASE}/${key}.light.svg`,
    `${PICONS_BASE}/${key}.white.svg`,
    `${PICONS_BASE}/${key}.default.png`,
    `${PICONS_BASE}/${key}.light.png`,
    `${PICONS_BASE}/${key}.white.png`,
    `${PICONS_BASE}/${key}.svg`,
    `${PICONS_BASE}/${key}.png`,
  ];
}

function getTvLogoCandidates(name: string): string[] {
  const key = normalizeTvLogoKey(name);
  return [
    `${TV_LOGO_BASE}/${key}.png`,
    `${TV_LOGO_BASE}/${key}-int.png`,
    `${TV_LOGO_BASE}/${key}-international.png`,
    `${TV_LOGO_BASE}/${key}-tv.png`,
  ];
}

function getFanmingmingCandidates(name: string): string[] {
  const encoded = encodeURIComponent(name);
  return [`${FANMINGMING_CDN}/${encoded}.png`, `${FANMINGMING_RAW}/${encoded}.png`];
}

export function getChannelLogoCandidates(channel: Channel): string[] {
  const candidates: string[] = [];
  if (channel.logo) candidates.push(channel.logo);

  const curated = CHANNEL_LOGOS[channel.slug] ?? CHANNEL_LOGOS[normalizeChannelKey(channel.name)];
  if (curated) candidates.push(curated);

  candidates.push(...getPiconsCandidates(channel.name));
  candidates.push(...getTvLogoCandidates(channel.name));
  candidates.push(...getFanmingmingCandidates(channel.name));

  return Array.from(new Set(candidates)).filter(Boolean);
}

export function getPreferredChannelLogo(channel: Channel): string | null {
  return getChannelLogoCandidates(channel)[0] ?? null;
}
