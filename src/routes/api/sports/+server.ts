import { apiResponse, browserBinding, requiredParam } from '$lib/server/api';
import { listSports, originFromWebsite, withBrowserPage } from '$lib/server/scraper';
import type { RequestHandler } from './$types';

/** `GET /api/sports?website=gozips.com` → `SportInfo[]` */
export const GET: RequestHandler = ({ url, platform }) =>
	apiResponse(async () => {
		const origin = originFromWebsite(requiredParam(url, 'website'));
		return withBrowserPage(browserBinding(platform), (page) => listSports(page, origin));
	});
