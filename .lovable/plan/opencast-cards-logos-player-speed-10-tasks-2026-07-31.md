# Opencast — Cards, Logos, Player & Speed (10 tasks)

Everything below ships in one pass.

## 1. Compact card size from the screenshot
Rebuild the channel card to the reference proportions: small rounded dark tile, centered logo (TV glyph fallback), red `LIVE` chip top-left, name centered below inside the tile. Target ~200px wide, 4:3-ish tile, tight 12px gaps.

## 2. One card everywhere
Home rows, Browse (including filtered results), Favorites and Logos all render the same card at the same size — a shared 6-across responsive grid (3 on phones, 6 on desktop) matching the image.

## 3. Logo skeleton + no glitch
`ChannelLogo` gets a shimmering skeleton while loading, cross-fades in on success, and falls through candidates silently. No layout shift, no flashing. Rows/grids show skeleton cards while data loads so pages never look empty.

## 4. Full logo audit + backfill
Run the catalog through the resolver (curated table → `tv_logos` → iptv-org → picons → fanmingming), write every resolved URL into `tv_logos`, and expand the hardcoded table for the top ~300 well-known channels so the common stations always have real artwork.

## 5. Paste-a-logo on every station
Each card (and the player header) gets a small "Add logo" action opening a compact popover: paste an image URL → Save → written to `tv_logos` and applied app-wide instantly (optimistic cache update). The /logos page keeps drag & drop.

## 6. Successful-stream caching
When a source plays, persist `{slug → working url + proxy mode + timestamp}` in the backend (`tv_streams` table) plus localStorage. Next open tries the cached URL first, so no re-walk through 16 candidates. Cache is invalidated if that URL later fails.

## 7. Corporate player controls
Custom control bar over the video: play/pause, next channel, mute + volume slider, quality, fullscreen, close. Native browser controls hidden. Source/attempt internals hidden from users.

## 8. Broadcast buffering animation
While a link is being resolved: dark scene with the Opencast TV icon, the channel logo watermarked behind, animated broadcast-signal rings and "Broadcast buffering…". Video starts playing muted behind the overlay first; once the first frame arrives the logo scales up, "Enjoy" appears, overlay fades and playback is revealed.

## 9. Speed
Server catalog cached with longer TTL, home payload trimmed to what's rendered, images `loading=lazy` + `decoding=async` + fixed aspect boxes, memoized cards/rows, virtualized long grids, prefetch on hover/touchstart.

## 10. Responsiveness of input
`touch-action: manipulation`, active-press states, passive scroll listeners, momentum scrolling on rows, no hover-only affordances on touch, larger hit targets, and removal of layout-thrashing animations so taps and scrolls feel instant.

## Technical notes
- New table `tv_streams` (slug, url, mode, verified_at) with grants + RLS; public read, authed write.
- Logo writes go to existing `tv_logos`.
- All colors stay semantic tokens in `src/styles.css`.
