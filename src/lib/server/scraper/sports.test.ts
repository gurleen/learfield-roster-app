/// <reference types="bun" />
import { describe, expect, test } from 'bun:test';
import { FakeSitePage } from './fake-page';
import { collectClassicSports, listSports, titleFromSlug } from './sports';

const ORIGIN = 'https://example.edu';
const FALLBACK = [{ slug: 'womens-soccer', title: "Women's Soccer" }];

const links = (...hrefs: string[]) => hrefs.map((href) => `<a href="${href}">link</a>`).join('');

test('titleFromSlug', () => {
	expect(titleFromSlug('mens-basketball')).toBe("Men's Basketball");
	expect(titleFromSlug('womens-cross-country')).toBe("Women's Cross Country");
	expect(titleFromSlug('football')).toBe('Football');
});

describe('collectClassicSports', () => {
	test('prefers roster links, deduped and sorted by title', () => {
		const sports = collectClassicSports(
			[
				'/sports/softball/roster',
				'https://example.edu/sports/Baseball/roster/',
				'/sports/softball/roster',
				'/sports/football',
				'/sports/softball/schedule',
				null
			],
			ORIGIN
		);
		expect(sports).toEqual([
			{ slug: 'baseball', title: 'Baseball' },
			{ slug: 'softball', title: 'Softball' }
		]);
	});

	test('falls back to sport index links', () => {
		expect(collectClassicSports(['/sports/mens-golf', '/news'], ORIGIN)).toEqual([
			{ slug: 'mens-golf', title: "Men's Golf" }
		]);
	});
});

describe('listSports', () => {
	test('uses the NextGen API, skipping non-sports and sports without rosters', async () => {
		const page = new FakeSitePage({
			pages: { [`${ORIGIN}/`]: { html: '' } },
			api: {
				'/api/v2/Sports': {
					status: 200,
					data: [
						{ id: 1, title: 'Volleyball', globalSportNameSlug: 'volleyball', rosterId: 10 },
						{ id: 2, title: '', globalSportNameSlug: 'mens-golf', rosterId: 11 },
						{ id: 3, title: 'Spirit', globalSportNameSlug: 'spirit', nonSport: true, rosterId: 12 },
						{ id: 4, title: 'Hall of Fame', globalSportNameSlug: 'hof', rosterId: null }
					]
				}
			}
		});

		expect(await listSports(page, ORIGIN)).toEqual([
			{ slug: 'mens-golf', title: "Men's Golf" },
			{ slug: 'volleyball', title: 'Volleyball' }
		]);
		expect(page.opened).toEqual([`${ORIGIN}/`]);
	});

	test('scans Classic homepage links when there is no API', async () => {
		const page = new FakeSitePage({
			pages: {
				[`${ORIGIN}/`]: { html: links('/sports/football/roster', '/sports/baseball/roster') }
			}
		});

		expect(await listSports(page, ORIGIN)).toEqual([
			{ slug: 'baseball', title: 'Baseball' },
			{ slug: 'football', title: 'Football' }
		]);
	});

	test('skips a splash interstitial and tries the default roster page', async () => {
		const page = new FakeSitePage({
			pages: {
				[`${ORIGIN}/`]: { html: links('/tickets'), finalUrl: `${ORIGIN}/splash.aspx` },
				[`${ORIGIN}/sports/womens-soccer/roster`]: { html: links('/sports/softball/roster') }
			}
		});

		expect(await listSports(page, ORIGIN)).toEqual([{ slug: 'softball', title: 'Softball' }]);
		expect(page.opened).toHaveLength(2);
	});

	test("falls back to women's soccer when nothing is discoverable", async () => {
		const page = new FakeSitePage({
			pages: {
				[`${ORIGIN}/`]: { html: links('/news') },
				[`${ORIGIN}/sports/womens-soccer/roster`]: { html: '', status: 404 }
			}
		});

		expect(await listSports(page, ORIGIN)).toEqual(FALLBACK);
	});

	test('fails when the site cannot be loaded at all', async () => {
		const page = new FakeSitePage({});
		await expect(listSports(page, ORIGIN)).rejects.toThrow(
			"HTTP request failed: Failed to fetch athletics site (HTTP request failed: couldn't load"
		);
	});
});
