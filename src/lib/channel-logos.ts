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

  // Sports (extended)
  skysportsmainevent:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Sky_Sports_News.svg/512px-Sky_Sports_News.svg.png",
  skysportsfootball:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Sky_Sports_News.svg/512px-Sky_Sports_News.svg.png",
  beinsports:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/BeIN_Sports_logo.svg/512px-BeIN_Sports_logo.svg.png",
  beinsports1:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/BeIN_Sports_logo.svg/512px-BeIN_Sports_logo.svg.png",
  supersport:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/SuperSport_logo.svg/512px-SuperSport_logo.svg.png",
  tntsports:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/TNT_Sports_logo_2023.svg/512px-TNT_Sports_logo_2023.svg.png",
  foxsports:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2015_Fox_Sports_logo.svg/512px-2015_Fox_Sports_logo.svg.png",
  foxsports1:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2015_Fox_Sports_logo.svg/512px-2015_Fox_Sports_logo.svg.png",
  nbcsports:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/NBC_Sports_2022.svg/512px-NBC_Sports_2022.svg.png",
  cbssportsnetwork:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/CBS_Sports_Network_logo.svg/512px-CBS_Sports_Network_logo.svg.png",
  nflnetwork:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/NFL_Network_logo.svg/512px-NFL_Network_logo.svg.png",
  nbatv:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/NBA_TV.svg/512px-NBA_TV.svg.png",
  tsn: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/TSN-Logo.svg/512px-TSN-Logo.svg.png",
  sportsnet:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Sportsnet_logo.svg/512px-Sportsnet_logo.svg.png",
  starsports1:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Star_Sports_logo.svg/512px-Star_Sports_logo.svg.png",
  willowtv:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Willow_TV_logo.svg/512px-Willow_TV_logo.svg.png",
  motorsporttv:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Motorsport.tv_logo.svg/512px-Motorsport.tv_logo.svg.png",

  // Entertainment, movies and kids (extended)
  hbo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/512px-HBO_logo.svg.png",
  amc: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/AMC_logo_2019.svg/512px-AMC_logo_2019.svg.png",
  tnt: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/TNT_Logo_2016.svg/512px-TNT_Logo_2016.svg.png",
  syfy:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Syfy.svg/512px-Syfy.svg.png",
  comedycentral:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Comedy_Central_2018.svg/512px-Comedy_Central_2018.svg.png",
  eentertainment:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/E%21_Logo_2012.svg/512px-E%21_Logo_2012.svg.png",
  fx: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/FX_International_logo.svg/512px-FX_International_logo.svg.png",
  paramountnetwork:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Paramount_Network.svg/512px-Paramount_Network.svg.png",
  animalplanet:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/2018_Animal_Planet_logo.svg/512px-2018_Animal_Planet_logo.svg.png",
  travelchannel:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Travel_Channel_-_new_logo.svg/512px-Travel_Channel_-_new_logo.svg.png",
  foodnetwork:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Food_Network_logo.svg/512px-Food_Network_logo.svg.png",
  hgtv:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/HGTV_US_Logo_2015.svg/512px-HGTV_US_Logo_2015.svg.png",
  tlc: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/TLC_Logo.svg/512px-TLC_Logo.svg.png",
  cartoonito:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Cartoonito_2021.svg/512px-Cartoonito_2021.svg.png",
  boomerang:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Boomerang_2014_logo.svg/512px-Boomerang_2014_logo.svg.png",
  babytv:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/BabyTV_logo.svg/512px-BabyTV_logo.svg.png",
  pbskids:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/PBS_Kids_Logo.svg/512px-PBS_Kids_Logo.svg.png",
  disneyjunior:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Disney_Junior_2011.svg/512px-Disney_Junior_2011.svg.png",
  nickjr:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Nick_Jr._logo_2009.svg/512px-Nick_Jr._logo_2009.svg.png",
  itv: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/ITV_logo_2019.svg/512px-ITV_logo_2019.svg.png",
  channel4:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Channel_4_logo_2015.svg/512px-Channel_4_logo_2015.svg.png",
  channel5:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Channel_5_%28UK%29_logo_2016.svg/512px-Channel_5_%28UK%29_logo_2016.svg.png",
  tv5monde:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/TV5MONDE_logo.svg/512px-TV5MONDE_logo.svg.png",
  arte:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Arte_Logo_2011.svg/512px-Arte_Logo_2011.svg.png",
  cgtn:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/CGTN.svg/512px-CGTN.svg.png",
  i24news:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/I24news_logo.svg/512px-I24news_logo.svg.png",
  cbsn: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/CBS_News_logo_2020.svg/512px-CBS_News_logo_2020.svg.png",
  tubi:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Tubi_logo.svg/512px-Tubi_logo.svg.png",
  samsungtvplus:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Samsung_TV_Plus_logo.svg/512px-Samsung_TV_Plus_logo.svg.png",
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
