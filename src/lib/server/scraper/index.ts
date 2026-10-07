import type { RosterResult } from '$lib/types/roster';
import { buildClassicRoster, CLASSIC_ROSTER_SPEC } from './classic';
import { ScraperError } from './errors';
import { isSportsList, NEXTGEN_KEYS, scrapeNextgen, SPORTS_PATH } from './nextgen';
import { isSuccess, type SitePage } from './page';
import type { ParsedRosterUrl } from './url';

export { withBrowserPage } from './browser';
export { ScraperError } from './errors';
export { listSports } from './sports';
export { originFromWebsite, parseRosterUrl } from './url';

/** Scrape a roster page, detecting NextGen (JSON API) vs Classic (HTML) automatically. */
export async function scrapeRoster(page: SitePage, roster: ParsedRosterUrl): Promise<RosterResult> {
	// Loading the roster page first puts the tab on the site, so the API probe
	// below carries whatever cookies its bot protection handed out.
	const load = await page.open(roster.normalizedUrl);

	const sports = await page.fetchJson(SPORTS_PATH, NEXTGEN_KEYS);
	if (isSportsList(sports)) {
		return scrapeNextgen(page, roster, sports.data);
	}

	if (!isSuccess(load.status)) {
		throw new ScraperError('http', `Failed to fetch roster page (${load.status})`);
	}
	const rows = await page.extract(CLASSIC_ROSTER_SPEC);
	if (rows.marker.length > 0) {
		return buildClassicRoster(rows, roster);
	}

	throw new ScraperError('unsupported', 'not Sidearm NextGen (API) or Classic (HTML roster list)');
}
