# Ultra-premium cinematic noir redesign

## Build
- Replace the current visual system with charcoal, graphite, and restrained dusty rose tokens, using Instrument Serif for display copy and Work Sans for interface text.
- Recompose the home screen around a full-width cinematic feature, compact genre rail, continue-watching shelf, and spacious channel rows inspired by the selected direction.
- Redesign channel cards as poster-like broadcast tiles with stronger artwork, compact metadata, ratings/status, and polished loading states.
- Limit the desktop navigation to Home, Movies, TV Shows, Anime, and Live TV; retain an ergonomic compact mobile navigation.
- Add a dedicated channel details page with a cinematic backdrop, channel metadata, favorite action, related channels, and a clear Watch button.
- Add a dedicated full-screen watch page that reuses the reliable HLS fallback engine and presents the existing playback controls within the noir system.
- Update home, browsing, favorites, and shared shell styling so the same card language, spacing, and color tone carry across the app.
- Add route-specific metadata for the new details and watch pages, then verify desktop and mobile layouts and player navigation.

## Technical details
- Keep the existing channel APIs, fallback sources, favorites, logo overrides, and playback engine intact.
- Pass channel identity through typed TanStack routes and resolve the full channel from existing search data.
- Use only semantic design tokens in the app UI; no new service or database work is required.
