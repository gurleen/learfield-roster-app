# Roster scraper API (Tauri commands)

Backend implementation: `src-tauri/src/scraper/`. Frontend types: `src/lib/types/roster.ts`.

Call these with SvelteKit's `invoke()` from `@tauri-apps/api/core`:

```ts
import { invoke } from "@tauri-apps/api/core";
import type { RosterResult, SportInfo } from "$lib/types/roster";
```

No capability entries are needed — these are app-defined commands (not a Tauri plugin), so they're callable under the existing `core:default` permission in `src-tauri/capabilities/default.json`.

## `fetch_roster`

```ts
const roster = await invoke<RosterResult>("fetch_roster", { url });
```

- `url: string` — a Sidearm roster page URL, e.g. `https://gozips.com/sports/womens-soccer/roster`. Must match `/sports/{sport-slug}/roster` (trailing slash optional); anything else rejects before any network call.
- Resolves to `RosterResult` (see below).
- Rejects with a plain `string` error message on failure (Tauri commands return `Result<T, String>`) — display it as-is, there's no structured error code on the frontend side.

Detects NextGen (JSON API) vs Classic (HTML) automatically — the caller doesn't need to know which platform a school uses.

## `list_sports`

```ts
const sports = await invoke<SportInfo[]>("list_sports", { website });
```

- `website: string` — just the athletics site host or URL, e.g. `gozips.com` or `https://gozips.com/anything` (scheme/path ignored, normalized to an origin).
- Resolves to `SportInfo[]`, sorted alphabetically by `title`. Always non-empty on success — falls back to `{ slug: "womens-soccer", title: "Women's Soccer" }` if nothing else is discoverable.
- Use `slug` to build a roster URL for `fetch_roster`: `` `https://${website}/sports/${slug}/roster` ``.
- Rejects with a plain `string` error message only if the site couldn't be reached at all.

## Types (`src/lib/types/roster.ts`)

```ts
type Player = {
	firstName: string;
	lastName: string;
	fullName: string;
	jerseyNumber: string | null;
	position: string | null;
	academicYear: string | null;
	height: string | null;
	hometown: string | null;
	highSchool: string | null;
	previousSchool: string | null;
	major: string | null;
	bioUrl: string | null;
	headshotUrl: string | null; // resolved original image URL — safe to <img src> directly
};

type Coach = {
	name: string;
	title: string | null;
	bioUrl: string | null;
	headshotUrl: string | null;
};

type Platform = "nextgen" | "classic";

type RosterResult = {
	sourceUrl: string; // normalized roster URL actually fetched
	platform: Platform;
	schoolHost: string; // e.g. "gozips.com"
	sportSlug: string; // e.g. "womens-soccer"
	title: string | null; // roster page title, when the site provides one
	season: string | null; // e.g. "2025-26", when the site provides one
	players: Player[];
	coaches: Coach[];
};

type SportInfo = {
	slug: string; // e.g. "mens-basketball"
	title: string; // e.g. "Men's Basketball"
};
```

Notes for building the UI:
- Every `Player`/`Coach` field except `firstName`/`lastName`/`fullName`/`name` is nullable — render blanks/placeholders for `null`, don't assume presence.
- `players` and `coaches` can both be empty arrays even on a successful `fetch_roster` call (e.g. a roster page with no posted coaches).
- No image download/local caching exists yet — `headshotUrl` is a remote URL only.

## Out of scope (not implemented)

Image download, background removal, and any zip/export flow that exist in the reference `learfield-scraper` repo are **not** ported. Don't wire UI affordances for those.
