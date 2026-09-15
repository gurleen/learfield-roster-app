# Recreate Learfield/Sidearm roster scraper in Rust (src-tauri)

## Context

`learfield-roster-app` needs to fetch college athletics roster data from Sidearm Sports sites (a Learfield product), for the app's frontend to consume. A reference implementation already exists at `/Users/gurleen/Developer/learfield-scraper` (TypeScript/Bun, deployed as a Cloudflare Worker) that solves this problem for two site variants — "NextGen" (JSON API) and "Classic" (server-rendered HTML). This task ports that scraping logic to Rust, running inside this Tauri v2 app's `src-tauri` process, exposed to the SvelteKit frontend via `invoke()`. Image download and background removal (present in the reference repo) are explicitly out of scope for now — only roster data extraction.

The `src-tauri` side of this app is currently a blank `create-tauri-app`/`sv` scaffold: no HTTP client, no HTML parser, no commands registered, no modules besides `main.rs`/`lib.rs`. This is the first non-trivial Rust code in the project.

## Approach

### Dependencies (`src-tauri/Cargo.toml`)

Add:
- `reqwest` (with `json`, `cookies` features) — HTTP client with built-in redirect handling and cookie jar, replacing the reference repo's hand-rolled cookie/redirect logic
- `scraper` — CSS-selector-based HTML parsing, Rust equivalent of cheerio
- `serde` / `serde_json` — already present
- Tauri v2 supports `async fn` commands natively; `reqwest`'s `rt`-enabled build pulls in `tokio` transitively, so no explicit `tokio` dependency needed unless spawning tasks manually

### Module layout

New module `src-tauri/src/scraper/`:
- `mod.rs` — public `scrape_roster(url: &str) -> Result<RosterResult, ScraperError>` and `list_sports(website: &str) -> Result<Vec<SportInfo>, ScraperError>`, platform detection (`is_nextgen`) mirroring `src/scrape.ts`
- `types.rs` — `Player`, `Coach`, `RosterResult`, `SportInfo` structs, `#[serde(rename_all = "camelCase")]`, matching `learfield-scraper/src/types.ts` field-for-field (no `weight` field — not present upstream either)
- `nextgen.rs` — JSON API adapter, port of `src/adapters/nextgen.ts`: `SidearmSport`, `SidearmPlayer`, `SidearmCoach`, `SidearmRoster`, `RostersListResponse` request/response structs; hits `GET {origin}/api/v2/Sports`, `GET {origin}/api/v2/Rosters?sportId=`, `GET {origin}/api/v2/Rosters/{id}` as needed; builds bio URLs (`/sports/{slug}/roster/{slugified-name}/{id}`, `/sports/staff-directory/bios/{id}`)
- `classic.rs` — HTML adapter, port of `src/adapters/classic.ts`: cheerio selectors translated to `scraper::Selector` strings verbatim (`li.sidearm-roster-player`, `.sidearm-roster-player-jersey-number`, `.sidearm-roster-player-name a`, `.sidearm-roster-player-position-long-short`, `.sidearm-roster-player-height`, `.sidearm-roster-player-academic-year`, `.sidearm-roster-player-hometown`, `.sidearm-roster-player-highschool`, `.sidearm-roster-player-major`, `.sidearm-roster-player-previous-school, .sidearm-roster-player-previous`, `data-player-url` attr for bio URL, `li.sidearm-roster-coach` + coach equivalents, title/season selectors); same naive `split_name` (all-but-last-token = first name)
- `sports.rs` — port of `src/sports.ts`: NextGen path filters `/api/v2/Sports` results (`!nonSport && rosterId.is_some()`); Classic path fetches homepage + a default-sport roster page and scrapes `<a href>` links matching `/sports/{slug}/roster` or `/sports/{slug}`; skip Sidearm `/splash.aspx` interstitial pages
- `fetch.rs` — shared HTTP helpers: builds a `reqwest::Client` with cookie store enabled and a fixed redirect policy; `SIDEARM_USER_AGENT` constant (same string as reference, adjusted to this repo); explicit same-URL redirect-loop detection via a custom `reqwest::redirect::Policy::custom` closure that tracks visited URLs and returns an error after seeing the same URL twice, surfaced as a distinct `ScraperError::Blocked` variant (per your answer: detect loops explicitly, no headless-browser/cache fallback — just fail with a clear, specific error)
- `error.rs` — `ScraperError` enum (`Http`, `Blocked`, `UnsupportedPlatform`, `NotFound`, `Parse`) implementing `std::error::Error`, converted to `String` at the Tauri command boundary (Tauri commands return `Result<T, String>`)
- `url.rs` — port of `parseRosterUrl` (`/sports/{slug}/roster` regex → origin + normalized URL + sport slug)

Image URL handling: keep `resolve_original_image_url`-equivalent logic (unwrap `images.sidearmdev.com/convert?url=...` and strip resize query params) since it's cheap and makes `headshotUrl` correct/stable for later use, but do **not** implement any actual image fetching/download/zip logic.

### Tauri commands (`src-tauri/src/lib.rs`)

```rust
mod scraper;

#[tauri::command]
async fn fetch_roster(url: String) -> Result<scraper::types::RosterResult, String> {
    scraper::scrape_roster(&url).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn list_sports(website: String) -> Result<Vec<scraper::types::SportInfo>, String> {
    scraper::list_sports(&website).await.map_err(|e| e.to_string())
}
```

Register both in `.invoke_handler(tauri::generate_handler![fetch_roster, list_sports])`. No new entries needed in `src-tauri/capabilities/default.json` — custom commands are callable under the existing `core:default` permission; only Tauri *plugins* need capability entries, and we're using raw `reqwest`, not `tauri-plugin-http`.

### Frontend types (reference only, not building UI yet)

Since the task says "we will be calling this from the app frontend" but frontend UI work isn't requested yet, only add a plain TypeScript type file mirroring the Rust structs (e.g. `src/lib/types/roster.ts`) so a future `invoke<RosterResult>('fetch_roster', { url })` call has something to import. No SvelteKit routes/components will be built in this pass.

## Verification

- `cd src-tauri && cargo build` — confirms crate compiles with new dependencies
- `cargo test` for unit tests on: `parse_roster_url` (NextGen/Classic URL forms), `split_name` edge cases, classic HTML selector parsing against a saved sample fixture (grab one real roster page HTML snapshot from a known Sidearm Classic site and check it into `src-tauri/src/scraper/testdata/` for the test to parse), image URL unwrapping/stripping
- Manual end-to-end check: temporary `#[cfg(test)]` or a throwaway `main.rs` debug print calling `scrape_roster` against a real public roster URL for both a known NextGen school and a known Classic school (pick two from `learfield-scraper`'s `ncaa-teams.json` or ones already validated in that repo), confirm non-empty `players` and correctly populated fields
- Run `bun run tauri dev`, and from the browser devtools console (or a temporary button) call `invoke('fetch_roster', { url: '<real roster URL>' })` to confirm the command is reachable end-to-end from the frontend
