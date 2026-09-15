# Learfield Roster App

A desktop app for pulling team rosters and building lineups, exportable to CSV.

Built with SvelteKit and Tauri, with a Rust backend that scrapes roster data.

## Developing

Install dependencies:

```sh
bun install
```

Run the web frontend alone:

```sh
bun run dev
```

Run the full desktop app (frontend + Rust backend):

```sh
bun run tauri dev
```

## Building

Production web build:

```sh
bun run build
```

Desktop app bundle for your current platform:

```sh
bun run tauri build
```

Signed macOS and Windows builds run from GitHub Actions: trigger the "Build Desktop Application" workflow manually from the Actions tab.
