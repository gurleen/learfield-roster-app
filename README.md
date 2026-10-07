# Learfield Roster App

A web app for pulling team rosters from Sidearm Sports athletics sites and building lineups, exportable to CSV.

Built with SvelteKit and deployed as a Cloudflare Worker. The Worker scrapes rosters through [Browser Run](https://developers.cloudflare.com/browser-run/) (formerly Browser Rendering): athletics sites sit behind bot protection that rejects plain requests from Workers, so every request to a school site happens inside a real headless Chrome session. See [docs/roster-scraper-api.md](docs/roster-scraper-api.md) for the API.

## Developing

Install dependencies:

```sh
bun install
```

Start the dev server:

```sh
bun run dev
```

The Worker's bindings from `wrangler.jsonc` are emulated locally, including Browser Run, which drives a local Chrome (downloaded on first use).

Run the tests and type checks:

```sh
bun run test
bun run check
```

## Building and deploying

Production build, served locally with the same emulated bindings:

```sh
bun run build
bun run preview
```

Deploy to your Cloudflare account:

```sh
bunx wrangler login
bun run deploy
```

To run the built Worker in the actual Workers runtime locally, use `wrangler dev` with Node 22+ installed: under Bun alone, its dev proxy accepts connections but never responds.

## Before sharing the deployed URL

- **Access:** the deployed app is public, and every scrape spends Browser Run time on your account. To limit who can use it, put it behind [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-public-app/).
- **Plan limits:** the Workers Free plan includes 10 minutes of Browser Run time per day and allows one new browser every 20 seconds, which covers occasional use. The Workers Paid plan includes 10 browser hours per month. The app reuses a warm browser session between requests to stay under these limits.
