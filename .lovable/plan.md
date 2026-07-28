# Opencast v3 — Ten Task Plan

A full rebuild of the app around a Smart-TV style interface (like the reference screenshots), a cloud-backed channel + logo library, aggregated free IPTV sources, and a testing/admin page.

## 1. Backend tables (Cloud)
Create three tables, all with grants + RLS:
- `tv` — id, name, slug (unique), country, categories[], languages[], stream_url, quality, source, is_hidden, created_at. Public read; writes for signed-in users.
- `tv_logos` — id, channel_slug (unique), name, logo_url, source (picons / fanmingming / m3u / manual), verified. Public read.
- `favorites` — user_id, channel_slug (auth-only, `auth.uid()` scoped).
Deleting a channel sets `is_hidden = true` in `tv` → **permanent across devices and sessions**, not localStorage.

## 2. Aggregation server functions
`src/lib/iptv.functions.ts`:
- Fetch iptv-org `channels.json`, `streams.json`, `countries.json`, `categories.json`.
- Fetch + parse the 8 M3U playlists (TopEmbed sent with `Referer: https://topembed.pw/`).
- Dedupe by lowercased name + stream URL, prefer higher resolution/bitrate.
- Return a paginated, filtered slice (never the whole 80k set to the browser).
- Results cached server-side and in `localStorage` with a 24-hour expiry + background refresh.

## 3. Logo pipeline → every card has a real logo
Server fn `syncLogos` resolves a logo for every channel, in order: `tv_logos` table → curated table in `channel-logos.ts` → iptv-org logo → picons name match → fanmingming/live fallback. Resolved URLs are written back to `tv_logos` so lookups get faster over time. Only if all fail does the card show a gradient-initials tile.

## 4. Smart-TV home UI (matches the reference images)
- Left icon rail: Search, Home, Favorites, News, Games, Kids, Shows, Family, Entertainment, Documentary, Settings. **Country list removed from the sidebar** (country becomes a top-bar dropdown filter).
- Top: circular app/category "bubble" strip like the Samsung shot.
- Big cinematic hero banner for a featured channel with Watch Now.
- Horizontal rows with their own independent scroll + chevrons: Recent, Popular, News, Sports, Movies, Kids, Local, Top Picks.
- Cards are logo-first tiles (rounded, no borders, gap-only grid), tiny 3-up on phones.

## 5. Filtering, search, virtualization
Country dropdown (all countries + counts), category dropdown, combined filtering, live name search, grid/list toggle, infinite scroll with windowed rendering and lazy images so large lists stay smooth.

## 6. Player
hls.js with `maxBufferLength: 30`, ABR on, 3 retry attempts, then `/api/stream-proxy`, then `corsproxy.io`. Compact popup by default with back/exit/fullscreen, quality selector when multiple levels exist, channel logo + flag + category in the header, friendly error states.

## 7. `/test` page
- Paste an HLS link → play it in an embedded test player.
- If it works: **Add channel to list** (writes to `tv`).
- **Add logo here**: pick any channel from the full list, paste/upload a logo, tap Update → saved to `tv_logos` and used app-wide.
- **Get channel from YouTube**: type a channel name, the YouTube v3 key fetches candidates, you verify, then add to the list. (The old "Add YouTube link" button is removed.)

## 8. Google sign-in
Sign in with Google (managed) plus email/password. Signed-in users get cloud-synced favorites, recently watched, and their channel/logo edits. Sign-in button lives in the top bar.

## 9. Settings page
Theme (dark default), default country, autoplay previews on/off, clear cache, restore hidden channels, force playlist refresh, account/sign-out.

## 10. PWA + polish
Installable PWA (manifest, icons, standalone display), new professional favicon/app icon, refined iconography throughout, loading skeletons, keyboard shortcuts, SEO head tags per route, then typecheck + build + Playwright smoke test + publish.

## Technical notes
- Env-configurable: `VITE_CORS_PROXY_URL`, `VITE_IPTV_API_URL`.
- Playlist fetching/parsing runs server-side (avoids CORS and keeps payloads small).
- All colors stay semantic tokens in `src/styles.css` (red/orange brand kept).
- Offline caching is not added — only installability — since live streams need the network.

Once approved, I will execute all ten tasks in one continuous pass, with no part deferred.