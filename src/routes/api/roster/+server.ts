import { apiResponse, browserBinding, requiredParam } from '$lib/server/api';
import { parseRosterUrl, scrapeRoster, withBrowserPage } from '$lib/server/scraper';
import type { RequestHandler } from './$types';

/** `GET /api/roster?url=https://gozips.com/sports/womens-soccer/roster` → `RosterResult` */
export const GET: RequestHandler = ({ url, platform }) =>
	apiResponse(async () => {
		const roster = parseRosterUrl(requiredParam(url, 'url'));
		return withBrowserPage(browserBinding(platform), (page) => scrapeRoster(page, roster));
	});
