# Data Guide — History of Timeline

Add timeline events and eras by editing the JSON data files. The app reads from:

- `src/lib/data/events.json` — timeline events (points in time)
- `src/lib/data/eras.json` — timeline eras (time ranges)

No rebuild is required for data changes; the dev server hot-reloads automatically.

---

## 1. Adding Data Manually

Open the relevant JSON file and append entries following the schema below.

### Events (`src/lib/data/events.json`)

```json
{
  "id": "unique-kebab-id",
  "title": "Human-readable title",
  "year": -3400,
  "weight": 3,
  "description": "Short description of what happened.",
  "tags": ["tag1", "tag2"]
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | Yes | Unique, kebab-case, no spaces |
| `title` | string | Yes | Displayed in the info panel and label |
| `year` | number | Yes | Negative = BCE, positive = CE |
| `weight` | 1 \| 2 \| 3 | Yes | 1 = minor, 2 = medium, 3 = major. Controls LOD visibility at low zoom |
| `description` | string | No | Shown in the scrollable details panel |
| `tags` | string[] | No | Filtering metadata (not yet wired to UI) |

### Eras (`src/lib/data/eras.json`)

```json
{
  "id": "unique-kebab-id",
  "title": "Era Name",
  "start": -3300,
  "end": -1200,
  "description": "What defined this era.",
  "tags": ["ancient", "mesopotamia"]
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | Yes | Unique, kebab-case |
| `title` | string | Yes | Rendered on the era bar below the axis |
| `start` | number | Yes | Start year (negative = BCE) |
| `end` | number | Yes | End year (negative = BCE) |
| `description` | string | No | Shown in the info panel |
| `tags` | string[] | No | Filtering metadata |

### Weight / LOD behavior

- `weight: 3` — always visible
- `weight: 2` — visible when zoom level > 0.008 px/year
- `weight: 1` — visible when zoom level > 0.04 px/year

This keeps the canvas readable when zoomed out.

---

## 2. Adding Data via AI Agent

When instructing an AI agent to add timeline data, provide this context:

### Context for the agent

```
Project: History of Timeline (SvelteKit 3, Svelte 5, Vite 8)
Data files:
- src/lib/data/events.json — timeline events (points in time)
- src/lib/data/eras.json — timeline eras (time ranges)

Event schema:
{
  id: string (kebab-case, unique),
  title: string,
  year: number (negative = BCE),
  weight: 1 | 2 | 3,
  description?: string,
  tags?: string[]
}

Era schema:
{
  id: string (kebab-case, unique),
  title: string,
  start: number,
  end: number,
  description?: string,
  tags?: string[]
}

Rules:
- IDs must be unique across all entries (events and eras share no namespace, but keep them unique anyway)
- Use kebab-case for IDs (e.g. "fall-of-rome", not "Fall of Rome")
- Negative years = BCE, positive = CE, no year 0
- Weight 3 = always shown, weight 1 = only at high zoom
- Descriptions should be 1–3 sentences
- Do not modify existing entries unless correcting errors
- After editing, run: pnpm run check (Node v26 required)
```

### Example agent prompt

> "Add 5 new events to `src/lib/data/events.json` covering the Space Age (1957–1975). Use kebab-case IDs, weight 3 for moon landing, weight 2 for others, include descriptions and tags. Verify IDs don't collide with existing entries."

---

## 3. Verification

After editing data files:

```powershell
# Switch to Node v26 (required for svelte-check/eslint)
$env:PATH = "C:\Users\Sid da'Cool\AppData\Roaming\fnm\node-versions\v26.13.1\installation;" + $env:PATH

# Type-check
pnpm run svelte-check

# Lint + format check
pnpm run lint

# Build
pnpm run build
```

If only adding JSON data (no code changes), you can skip `svelte-check` — just refresh the dev server (`pnpm dev`).

---

## 4. File locations

```
src/lib/data/events.json    # 23 events (writing → fall of Berlin Wall)
src/lib/data/eras.json      # 12 eras (Bronze Age → Cold War)
src/lib/timeline/format.ts  # Shared date formatting helpers
src/lib/timeline/types.ts   # TypeScript types (TimelineEvent, TimelineEra, etc.)
```

---

## 5. Common mistakes

| Mistake | Fix |
|---|---|
| Duplicate `id` | Ensure every `id` is unique |
| Positive year for BCE | Use negative numbers (e.g. `-44` for 44 BCE) |
| Missing `weight` | Always include `weight: 1 \| 2 \| 3` |
| Trailing comma in JSON | JSON does not allow trailing commas |
| Spaces in `id` | Use kebab-case: `fall-of-rome`, not `fall of rome` |
