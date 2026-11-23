# History of Timeline

An interactive world-history timeline visualization built with **SvelteKit 3**, **Svelte 5**, and **HTML5 Canvas**. Pan and zoom through 5,500 years of history — from the Bronze Age to the present — with eras below the axis and events above.

## Features

- **Canvas rendering** — smooth pan (drag) and zoom (scroll) across the full timeline
- **Eras** — color-coded era bars below the axis (Bronze Age → Cold War)
- **Events** — dated events above the axis with greedy label rows to avoid overlap
- **Details panel** — click any event or era to see its title, date range, and scrollable description
- **Auto dark theme** — follows your system `prefers-color-scheme` automatically via dodo-ui's `.dodo-theme--dark`
- **Fit all** — button to zoom out and show the entire timeline
- **Static site** — built with `@sveltejs/adapter-static`, deploys to GitHub Pages

## Tech Stack

| Layer         | Tech                                        |
| ------------- | ------------------------------------------- |
| Framework     | SvelteKit 3 + Svelte 5 (runes)              |
| Build tool    | Vite 8                                      |
| Canvas scales | d3-scale                                    |
| Layout logic  | Custom lane packing + label rows            |
| Colors        | dodo-ui CSS variables (`--dodo-color-*`)    |
| Icons         | @iconify/svelte (mdi)                       |
| Deploy        | GitHub Pages via `@sveltejs/adapter-static` |

## Project Structure

```
src/
  lib/
    timeline/
      Timeline.svelte   # Canvas timeline: pan, zoom, hit-test, draw
      InfoPanel.svelte  # Scrollable details panel for selected item
      format.ts         # Date formatting helpers (fmtYear, fmtRange)
      layout.ts         # Lane packing, label rows, ticks, LOD
      scale.ts          # createYearScale, formatYear, clamp
      types.ts          # TimelineEvent, TimelineEra, SelectedItem
      d3-types.d.ts     # d3 module type declarations
    data/
      events.json       # 23 timeline events
      eras.json         # 12 timeline eras
    components/
      DetailsPanel.svelte
  routes/
    +page.svelte        # Horizontal timeline route
    +layout.svelte      # Root layout + theme class toggle
```

## Data Files

Timeline content lives in two JSON files:

- `src/lib/data/events.json` — events (points in time)
- `src/lib/data/eras.json` — eras (time ranges)

See `DATA_GUIDE.md` for the full schema and instructions for manual or AI-agent data entry.

## Development

Requires **Node v26** (see `.nvmrc`).

```powershell
# Use Node 26 (via fnm)
fnm use 26

# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Type-check + lint + format check
pnpm run check

# Build for production
pnpm run build
```

## Deployment

Pushes to `main` trigger GitHub Actions (`.github/workflows/gh-pages.yml`) which builds and deploys to GitHub Pages at:

```
https://siddacool.github.io/history-of/
```

## License

MIT
