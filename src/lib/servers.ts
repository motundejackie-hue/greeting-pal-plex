/**
 * Every link source the app can pull from. Each entry is a "server" the user
 * can pick in the top bar; the one that produced a working link becomes the
 * default for the next channel.
 */
export type ServerDef = {
  id: string;
  label: string;
  url?: string;
  headers?: Record<string, string>;
  /** Force these categories onto every channel parsed from this playlist. */
  forceCategories?: string[];
};

export const SERVERS: ServerDef[] = [
  { id: "auto", label: "Auto (all servers)" },
  { id: "iptv-org", label: "iptv-org API" },
  {
    id: "iptv-org-m3u",
    label: "iptv-org Main",
    url: "https://iptv-org.github.io/iptv/index.m3u",
  },
  {
    id: "iptv-org-sports",
    label: "iptv-org Sports",
    url: "https://iptv-org.github.io/iptv/categories/sports.m3u",
    forceCategories: ["sports"],
  },
  {
    id: "free-tv",
    label: "Free-TV",
    url: "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8",
  },
  {
    id: "zilla",
    label: "Scraper Zilla (combined)",
    url: "https://raw.githubusercontent.com/abusaeeidx/IPTV-Scraper-Zilla/main/combined-playlist.m3u",
  },
  {
    id: "topembed-all",
    label: "TopEmbed (all)",
    url: "https://bit.ly/topembed-m3u1-all",
    headers: { Referer: "https://topembed.pw/", Origin: "https://topembed.pw" },
    forceCategories: ["sports"],
  },
  {
    id: "topembed-events",
    label: "TopEmbed (events)",
    url: "https://bit.ly/topembed-m3u1",
    headers: { Referer: "https://topembed.pw/", Origin: "https://topembed.pw" },
    forceCategories: ["sports"],
  },
  {
    id: "topembed-mirror",
    label: "TopEmbed (mirror)",
    url: "https://raw.githubusercontent.com/hispaniaestable/topembed-m3u/main/all_channels/playlist.m3u8",
    headers: { Referer: "https://topembed.pw/", Origin: "https://topembed.pw" },
    forceCategories: ["sports"],
  },
  {
    id: "ddy-all",
    label: "DaddyLive (all regions)",
    url: "https://bit.ly/ddy-m3u1-all",
    headers: {
      Referer: "https://daddylive.dad/",
      Origin: "https://daddylive.dad",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
    },
    forceCategories: ["sports"],
  },
  {
    id: "ddy-en",
    label: "DaddyLive (English)",
    url: "https://bit.ly/ddy-m3u1",
    headers: {
      Referer: "https://daddylive.dad/",
      Origin: "https://daddylive.dad",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
    },
    forceCategories: ["sports"],
  },
  {
    id: "fancode",
    label: "FanCode Live",
    url: "https://raw.githubusercontent.com/byte-capsule/FanCode-Hls-Fetcher/main/Fancode_Live.m3u",
    forceCategories: ["sports"],
  },
  {
    id: "t-sports",
    label: "T-Sports (universal)",
    url: "https://raw.githubusercontent.com/abusaeeidx/T-Sports-Playlist-Auto-Update/refs/heads/main/universal_player.m3u",
    forceCategories: ["sports"],
  },
  {
    id: "t-sports-ns",
    label: "T-Sports (NS Player)",
    url: "https://raw.githubusercontent.com/abusaeeidx/T-Sports-Playlist-Auto-Update/refs/heads/main/ns_player.m3u",
    forceCategories: ["sports"],
  },
  {
    id: "t-sports-ott",
    label: "T-Sports (OTT Navigator)",
    url: "https://raw.githubusercontent.com/abusaeeidx/T-Sports-Playlist-Auto-Update/refs/heads/main/ott_navigator.m3u",
    forceCategories: ["sports"],
  },
  {
    id: "twoonethree",
    label: "TwoOneThree Sports",
    url: "https://raw.githubusercontent.com/twoonethree/IPTV/master/Sports.m3u",
    forceCategories: ["sports"],
  },
  {
    id: "thetvapp",
    label: "TheTVApp",
    url: "https://raw.githubusercontent.com/abusaeeidx/IPTV-Scraper-Zilla/main/TheTVApp.m3u8",
    forceCategories: ["sports"],
  },
  {
    id: "zilla-crichd",
    label: "CricHD",
    url: "https://raw.githubusercontent.com/abusaeeidx/IPTV-Scraper-Zilla/main/CricHD.m3u",
    forceCategories: ["sports"],
  },
  {
    id: "zilla-pixelsports",
    label: "PixelSports",
    url: "https://raw.githubusercontent.com/abusaeeidx/IPTV-Scraper-Zilla/main/Pixelsports.m3u",
    forceCategories: ["sports"],
  },
  {
    id: "streamed-su",
    label: "Streamed.su Sports",
    url: "https://raw.githubusercontent.com/dtankdempse/streamed-su-sports/main/playlist.m3u8",
    forceCategories: ["sports"],
  },
  {
    id: "methstreams",
    label: "MethStreams",
    url: "https://raw.githubusercontent.com/dtankdempse/free-iptv-channels/main/playlist.m3u8",
    forceCategories: ["sports"],
  },
  {
    id: "zilla-tvpass",
    label: "TVPass",
    url: "https://raw.githubusercontent.com/abusaeeidx/IPTV-Scraper-Zilla/main/TVPass.m3u",
  },
  {
    id: "zilla-lgtv",
    label: "LG Channels",
    url: "https://raw.githubusercontent.com/abusaeeidx/IPTV-Scraper-Zilla/main/LGTV.m3u",
  },
  {
    id: "zilla-moveonjoy",
    label: "MoveOnJoy",
    url: "https://raw.githubusercontent.com/abusaeeidx/IPTV-Scraper-Zilla/main/Moveonjoy.m3u",
  },
  { id: "direct", label: "Direct links" },
];

export const PLAYLIST_SERVERS = SERVERS.filter((s) => Boolean(s.url));

/** Individual streams found in the wild — merged in as their own server. */
export const DIRECT_STREAMS = [
  {
    name: "Nova Sport 3",
    url: "http://185.188.188.235/live/novasport3/playlist.m3u8",
  },
  {
    name: "Premier Sport 2",
    url: "http://185.188.188.235/live/premiersport2/playlist.m3u8",
  },
  {
    name: "Football World Cup 2026",
    url: "http://rgkkw.live/8095/unt-s/tracks-v1a1/mono.m3u8",
  },
];

export function serverLabel(id: string): string {
  return SERVERS.find((s) => s.id === id)?.label ?? id;
}
