/// <reference types="bun" />
import { describe, expect, test } from 'bun:test';
import { FakeSitePage } from './fake-page';
import { parseRosterUrl, scrapeRoster } from './index';

const NEXTGEN = parseRosterUrl('https://example.edu/sports/womens-soccer/roster');
const CLASSIC = parseRosterUrl('https://classic.edu/sports/womens-soccer/roster');

const classicPage = await Bun.file(
	new URL('./testdata/classic_roster_sample.html', import.meta.url)
).text();

describe('scrapeRoster', () => {
	test('uses the NextGen API when the site has one', async () => {
		const page = new FakeSitePage({
			pages: { [NEXTGEN.normalizedUrl]: { html: '<div id="__nuxt"></div>' } },
			api: {
				'/api/v2/Sports': {
					status: 200,
					data: [{ id: 17, globalSportNameSlug: 'womens-soccer', rosterId: 342 }]
				},
				'/api/v2/Rosters?sportId=17': {
					status: 200,
					data: { items: [{ id: 342, players: [{ firstName: 'Jamie', lastName: 'Rivera' }] }] }
				}
			}
		});

		const result = await scrapeRoster(page, NEXTGEN);

		expect(result.platform).toBe('nextgen');
		expect(result.players.map((p) => p.fullName)).toEqual(['Jamie Rivera']);
		expect(page.opened).toEqual([NEXTGEN.normalizedUrl]);
	});

	test('parses the page as Classic when there is no API', async () => {
		const page = new FakeSitePage({
			pages: { [CLASSIC.normalizedUrl]: { html: classicPage } }
		});

		const result = await scrapeRoster(page, CLASSIC);

		expect(result.platform).toBe('classic');
		expect(result.players).toHaveLength(3);
		expect(page.fetched).toEqual(['/api/v2/Sports']);
	});

	test('reports a roster page that failed to load', async () => {
		const page = new FakeSitePage({
			pages: { [CLASSIC.normalizedUrl]: { html: classicPage, status: 404 } }
		});
		await expect(scrapeRoster(page, CLASSIC)).rejects.toThrow('Failed to fetch roster page (404)');
	});

	test('rejects pages that are neither NextGen nor Classic', async () => {
		const page = new FakeSitePage({
			pages: { [CLASSIC.normalizedUrl]: { html: '<main>Hello</main>' } }
		});
		await expect(scrapeRoster(page, CLASSIC)).rejects.toThrow(
			'Unsupported roster page: not Sidearm NextGen (API) or Classic (HTML roster list)'
		);
	});
});
