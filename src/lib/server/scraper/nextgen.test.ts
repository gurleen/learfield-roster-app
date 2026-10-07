/// <reference types="bun" />
import { describe, expect, test } from 'bun:test';
import { FakeSitePage } from './fake-page';
import { formatHeight, scrapeNextgen, slugifyName, type SidearmSport } from './nextgen';
import { parseRosterUrl } from './url';

const ROSTER_URL = parseRosterUrl('https://example.edu/sports/womens-soccer/roster');

const SPORTS: SidearmSport[] = [
	{ id: 4, title: 'Football', globalSportNameSlug: 'football', nonSport: false, rosterId: 300 },
	{
		id: 17,
		title: "Women's Soccer",
		globalSportNameSlug: 'womens-soccer',
		nonSport: false,
		rosterId: 342
	}
];

const ROSTER = {
	id: 342,
	displayTitle: "2026 Example Women's Soccer Roster",
	season: { title: '2026' },
	players: [
		{
			firstName: 'Jamie',
			lastName: "Rivera O'Neil",
			jerseyNumber: '0',
			positionShort: 'GK',
			academicYearShort: 'R-So.',
			heightFeet: 5,
			heightInches: 9,
			hometown: 'Akron, Ohio',
			highSchool: 'Firestone',
			previousSchool: null,
			major: ' ',
			image: {
				url: '/images/2026/8/2/0_rivera.png',
				absoluteUrl:
					'https://images.sidearmdev.com/convert?url=https%3A%2F%2Fexample.edu%2Fimages%2F2026%2F8%2F2%2F0_rivera.png&width=180&type=webp'
			},
			rosterPlayerId: 10063
		}
	],
	coaches: [
		{
			firstName: 'Pat',
			lastName: 'Lee',
			title: 'Head Coach',
			image: { url: '/images/coach.jpg?width=80', absoluteUrl: null },
			staffId: 536
		},
		{ firstName: null, lastName: null, title: '  ', image: null, staffId: null }
	]
};

describe('formatHeight', () => {
	test('formats feet and inches, treating a missing half as zero', () => {
		expect(formatHeight(5, 9)).toBe(`5' 9''`);
		expect(formatHeight(6, null)).toBe(`6' 0''`);
		expect(formatHeight(null, 11)).toBe(`0' 11''`);
	});

	test('returns null when there is no height', () => {
		expect(formatHeight(null, undefined)).toBeNull();
		expect(formatHeight(0, 0)).toBeNull();
	});
});

test('slugifyName collapses non-alphanumerics into single dashes', () => {
	expect(slugifyName('Mary Jane', "O'Neil")).toBe('mary-jane-o-neil');
	expect(slugifyName(' Ana ', 'Díaz')).toBe('ana-d-az');
});

describe('scrapeNextgen', () => {
	test('maps the roster from the Rosters list', async () => {
		const page = new FakeSitePage({
			api: { '/api/v2/Rosters?sportId=17': { status: 200, data: { items: [ROSTER] } } }
		});

		const result = await scrapeNextgen(page, ROSTER_URL, SPORTS);

		expect(page.fetched).toEqual(['/api/v2/Rosters?sportId=17']);
		expect(result).toMatchObject({
			sourceUrl: 'https://example.edu/sports/womens-soccer/roster',
			platform: 'nextgen',
			schoolHost: 'example.edu',
			sportSlug: 'womens-soccer',
			title: "2026 Example Women's Soccer Roster",
			season: '2026'
		});
		expect(result.players).toEqual([
			{
				firstName: 'Jamie',
				lastName: "Rivera O'Neil",
				fullName: "Jamie Rivera O'Neil",
				jerseyNumber: '0',
				position: 'GK',
				academicYear: 'R-So.',
				height: `5' 9''`,
				hometown: 'Akron, Ohio',
				highSchool: 'Firestone',
				previousSchool: null,
				major: null,
				bioUrl: 'https://example.edu/sports/womens-soccer/roster/jamie-rivera-o-neil/10063',
				headshotUrl: 'https://example.edu/images/2026/8/2/0_rivera.png'
			}
		]);
		expect(result.coaches).toEqual([
			{
				name: 'Pat Lee',
				title: 'Head Coach',
				bioUrl: 'https://example.edu/sports/staff-directory/bios/536',
				headshotUrl: 'https://example.edu/images/coach.jpg'
			},
			{ name: 'Unknown', title: null, bioUrl: null, headshotUrl: null }
		]);
	});

	test('fetches the roster detail when the list omits players', async () => {
		const page = new FakeSitePage({
			api: {
				'/api/v2/Rosters?sportId=17': { status: 200, data: { items: [{ id: 342, players: [] }] } },
				'/api/v2/Rosters/342': { status: 200, data: ROSTER }
			}
		});

		const result = await scrapeNextgen(page, ROSTER_URL, SPORTS);

		expect(page.fetched).toEqual(['/api/v2/Rosters?sportId=17', '/api/v2/Rosters/342']);
		expect(result.players).toHaveLength(1);
	});

	test('reports a sport the site does not have', async () => {
		const page = new FakeSitePage({});
		await expect(scrapeNextgen(page, ROSTER_URL, SPORTS.slice(0, 1))).rejects.toThrow(
			'Not found: Sport "womens-soccer" not found on https://example.edu'
		);
	});

	test('reports API failures with the URL', async () => {
		const page = new FakeSitePage({
			api: { '/api/v2/Rosters?sportId=17': { status: 500, data: null } }
		});
		await expect(scrapeNextgen(page, ROSTER_URL, SPORTS)).rejects.toThrow(
			'NextGen API failed (500): https://example.edu/api/v2/Rosters?sportId=17'
		);
	});
});
