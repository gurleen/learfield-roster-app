# Roster scraper API

Server implementation: `src/lib/server/scraper/`, exposed by the routes in `src/routes/api/`. Shared types: `src/lib/types/roster.ts`.

The UI calls the endpoints through `src/lib/api.ts`, which throws an `Error` carrying the server's message:

```ts
import { fetchRoster, listSports } from '$lib/api';
```

## `GET /api/roster?url=…`

```ts
const roster = await fetchRoster('https://gozips.com/sports/womens-soccer/roster');
```

- `url`: a Sidearm roster page URL. Must match `/sports/{sport-slug}/roster` (trailing slash optional); anything else is rejected before any browser work.
- Responds with a `RosterResult` (see below).

Detects NextGen (JSON API) vs Classic (server-rendered HTML) automatically; callers don't need to know which platform a school uses.

## `GET /api/sports?website=…`

```ts
const sports = await listSports('gozips.com');
```

- `website`: the athletics site host or any URL on it, e.g. `gozips.com` or `https://gozips.com/anything`. Normalized to its https origin.
- Responds with `SportInfo[]`, sorted alphabetically by `title`. Always non-empty on success: falls back to `{ slug: "womens-soccer", title: "Women's Soccer" }` if nothing else is discoverable.
- Build a roster URL from a `slug` with `` `https://${website}/sports/${slug}/roster` ``.

## Errors

Failures respond with `{ "error": string }`, a message meant to be shown to the user as-is.

| Status | When                                                                                      |
| ------ | ----------------------------------------------------------------------------------------- |
| 400    | Missing or malformed `url` / `website` parameter                                          |
| 404    | The sport or its roster doesn't exist on a NextGen site                                   |
| 422    | Not a `/sports/{slug}/roster` URL, or the page is neither NextGen nor Classic             |
| 502    | The site was unreachable, returned an error, blocked the browser, or sent unexpected data |
| 503    | Browser Run couldn't start a browser session (for example, plan limits)                   |

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
	headshotUrl: string | null; // resolved original image URL, safe to <img src> directly
};

type Coach = {
	name: string;
	title: string | null;
	bioUrl: string | null;
	headshotUrl: string | null;
};

type Platform = 'nextgen' | 'classic';

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

Notes for building UI:

- Every `Player`/`Coach` field except `firstName`/`lastName`/`fullName`/`name` is nullable. Render blanks or placeholders for `null`.
- `players` and `coaches` can both be empty arrays on a successful response (for example, a roster page with no posted coaches).
- `headshotUrl` is a remote URL only; nothing is downloaded or cached.

## How scraping works

Sidearm sites sit behind bot protection (Imperva on the sites tested) that rejects plain requests from Workers, so the scraper never fetches a school site directly. Each API request runs in one tab of a [Browser Run](https://developers.cloudflare.com/browser-run/) session (`browser.ts`):

- **Sessions** are reused when a warm one has room, then released with `disconnect()` so the next request can pick them up (they idle out after 60 seconds). Each request gets its own browser context, so cookies don't leak between requests.
- **NextGen:** the tab loads the roster page, then calls `/api/v2/Sports`, `/api/v2/Rosters?sportId=…` and, when needed, `/api/v2/Rosters/{id}` with `fetch()` from inside the page, so the requests carry the cookies the site's bot protection issued. The page trims each response to the fields the mappers read (`NEXTGEN_KEYS`).
- **Classic:** `extractRows` (`extract.ts`) runs in the page and returns just the text and attributes named in `CLASSIC_ROSTER_SPEC`, keeping DevTools messages small. Turning those rows into players and coaches happens in the Worker.
- **Sports list:** the NextGen API when the site has one; otherwise roster links scraped from the homepage, then from a default roster page.

Functions passed to `page.evaluate()` run inside the page, so they must not reference anything outside their own body. The comment on `extractRows` explains the constraints.

The scraping logic is tested against `FakeSitePage` (`fake-page.ts`), which serves canned documents and runs `extractRows` through linkedom. There are no tests against live sites.

## Out of scope (not implemented)

Image download, background removal, and the zip/export flow from the original `learfield-scraper` reference implementation aren't ported. Don't wire UI affordances for them.
