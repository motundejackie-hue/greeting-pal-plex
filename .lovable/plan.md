# Deep navy channel-store redesign

## Build
- Replace the current charcoal/red movie palette with the reference’s near-black navy shell, blue selection states, cool-gray text, and bright white channel surfaces.
- Rework the shared channel card into a compact landscape logo tile: centered station logo on white, subtle border and shadow, small station name beneath, and lightweight live/favorite actions that do not obscure the logo.
- Apply the same compact card proportions to every home row, browse grid, favorites grid, related-channel row, loading placeholder, and continue-watching shelf.
- Restyle the top navigation, mobile navigation, search, genre rail, page headings, filters, menus, details page, player chrome, settings, Roku, logo tools, and admin surfaces to the same navy-and-white system.
- Keep the existing channel data, logos, playback, favorites, source recovery, server selection, and all actions unchanged.
- Verify the browse screen shown by the user plus home, details, favorites, and player layouts at desktop and mobile widths.

## Technical details
- Define the full palette, shadows, tile sizing, and loading surfaces as semantic tokens and shared utilities in the global design system.
- Remove poster artwork from shared channel cards while retaining cinematic imagery where it is useful for the feature and channel-detail backdrops.
- Preserve route metadata and all current navigation destinations.
