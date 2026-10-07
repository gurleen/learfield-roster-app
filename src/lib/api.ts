import type { RosterResult, SportInfo } from '$lib/types/roster';

/** Sports with rosters on an athletics site, e.g. `gozips.com`. */
export function listSports(website: string): Promise<SportInfo[]> {
	return getJson(`/api/sports?${new URLSearchParams({ website })}`);
}

/** Scrape a Sidearm roster page, e.g. `https://gozips.com/sports/womens-soccer/roster`. */
export function fetchRoster(url: string): Promise<RosterResult> {
	return getJson(`/api/roster?${new URLSearchParams({ url })}`);
}

async function getJson<T>(path: string): Promise<T> {
	const response = await fetch(path, { headers: { Accept: 'application/json' } });
	const body = await response.json().catch(() => null);
	if (!response.ok) {
		// API routes send `{ error }`; SvelteKit's own errors send `{ message }`.
		throw new Error(body?.error ?? body?.message ?? `Request failed (${response.status})`);
	}
	return body as T;
}
