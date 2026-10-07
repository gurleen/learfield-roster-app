import type { SportInfo } from '$lib/types/roster';
import { ScraperError } from './errors';
import type { ExtractSpec } from './extract';
import { isSportsList, NEXTGEN_KEYS, SPORTS_PATH } from './nextgen';
import { isSuccess, type PageLoad, type SitePage } from './page';
import { DEFAULT_SPORT_SLUG } from './url';

const ROSTER_LINK = /^\/sports\/([a-z0-9-]+)\/roster\/?$/i;
const SPORT_LINK = /^\/sports\/([a-z0-9-]+)\/?$/i;

export const LINKS_SPEC = {
	links: { rows: 'a[href]', fields: { href: { attr: 'href' } } }
} satisfies ExtractSpec;

export function titleFromSlug(slug: string): string {
	return slug
		.split('-')
		.map((part) => {
			if (part === 'mens') return "Men's";
			if (part === 'womens') return "Women's";
			return part.charAt(0).toUpperCase() + part.slice(1);
		})
		.join(' ');
}

/** Alphabetical by title; slug breaks ties so the order is stable. */
function sortSports(sports: SportInfo[]): SportInfo[] {
	return sports.sort((a, b) => {
		const x = a.title.toLowerCase();
		const y = b.title.toLowerCase();
		if (x !== y) return x < y ? -1 : 1;
		return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
	});
}

function withFallback(sports: SportInfo[]): SportInfo[] {
	return sports.length > 0 ? sports : [{ slug: DEFAULT_SPORT_SLUG, title: "Women's Soccer" }];
}

/** Sidearm interstitial (tickets, season launch), not a page with sports navigation. */
function isAthleticsSplashUrl(url: string): boolean {
	try {
		return new URL(url).pathname.toLowerCase().endsWith('/splash.aspx');
	} catch {
		return url.toLowerCase().includes('splash.aspx');
	}
}

/**
 * Roster sports linked from a Classic Sidearm page. Prefers `/sports/{slug}/roster`
 * links; otherwise uses `/sports/{slug}`.
 */
export function collectClassicSports(hrefs: (string | null)[], origin: string): SportInfo[] {
	const rosterSlugs = new Set<string>();
	const indexSlugs = new Set<string>();

	for (const href of hrefs) {
		if (href === null) continue;
		let path: string;
		try {
			path = new URL(href, origin).pathname;
		} catch {
			continue;
		}
		const roster = ROSTER_LINK.exec(path);
		if (roster) {
			rosterSlugs.add(roster[1].toLowerCase());
			continue;
		}
		const index = SPORT_LINK.exec(path);
		if (index) indexSlugs.add(index[1].toLowerCase());
	}

	const slugs = rosterSlugs.size > 0 ? rosterSlugs : indexSlugs;
	return sortSports([...slugs].map((slug) => ({ slug, title: titleFromSlug(slug) })));
}

/** Sports from the NextGen API, or `null` when the site doesn't have one. */
async function listNextgenSports(page: SitePage): Promise<SportInfo[] | null> {
	const response = await page.fetchJson(SPORTS_PATH, NEXTGEN_KEYS);
	if (!isSportsList(response)) return null;

	const bySlug = new Map<string, SportInfo>();
	for (const sport of response.data) {
		const slug = sport.globalSportNameSlug?.trim();
		if (!slug || sport.nonSport || sport.rosterId == null) continue;
		bySlug.set(slug, { slug, title: sport.title?.trim() || titleFromSlug(slug) });
	}
	return sortSports([...bySlug.values()]);
}

/**
 * List sports with rosters for a Sidearm athletics site: from the NextGen API
 * when there is one, otherwise from links on the Classic homepage (or, failing
 * that, a default roster page).
 */
export async function listSports(page: SitePage, origin: string): Promise<SportInfo[]> {
	const candidates = [`${origin}/`, `${origin}/sports/${DEFAULT_SPORT_SLUG}/roster`];

	// `undefined` until a page has loaded on the site and the API could be asked.
	let nextgen: SportInfo[] | null | undefined;
	let lastStatus: number | null = null;
	let lastError: ScraperError | null = null;
	let fetchedOk = false;

	for (const url of candidates) {
		let load: PageLoad;
		try {
			load = await page.open(url);
		} catch (error) {
			if (!(error instanceof ScraperError)) throw error;
			lastError = error;
			continue;
		}

		if (nextgen === undefined) {
			nextgen = await listNextgenSports(page);
			if (nextgen && nextgen.length > 0) return nextgen;
		}

		lastStatus = load.status;
		if (!isSuccess(load.status)) continue;
		fetchedOk = true;
		if (isAthleticsSplashUrl(load.url)) continue;

		const { links } = await page.extract(LINKS_SPEC);
		const found = collectClassicSports(
			links.map((link) => link.href),
			origin
		);
		if (found.length > 0) return found;
	}

	if (!fetchedOk) {
		if (nextgen) return withFallback(nextgen);
		const detail =
			lastError?.message ?? (lastStatus === null ? 'no response' : `HTTP ${lastStatus}`);
		throw new ScraperError('http', `Failed to fetch athletics site (${detail})`);
	}
	return withFallback([]);
}
