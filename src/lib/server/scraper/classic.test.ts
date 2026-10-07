/// <reference types="bun" />
import { describe, expect, test } from 'bun:test';
import { buildClassicRoster, CLASSIC_ROSTER_SPEC, splitName } from './classic';
import { extractFromHtml } from './fake-page';
import { parseRosterUrl } from './url';

const fixture = await Bun.file(
	new URL('./testdata/classic_roster_sample.html', import.meta.url)
).text();

describe('splitName', () => {
	test('treats everything but the last word as the first name', () => {
		expect(splitName('')).toEqual(['', '']);
		expect(splitName('Madonna')).toEqual(['Madonna', '']);
		expect(splitName('Valentina Espinel')).toEqual(['Valentina', 'Espinel']);
		expect(splitName('  Mary Jane   Watson ')).toEqual(['Mary Jane', 'Watson']);
	});
});

describe('Classic roster extraction', () => {
	test('scrapes players and coaches from a real Classic page', () => {
		const rows = extractFromHtml(fixture, CLASSIC_ROSTER_SPEC);
		expect(rows.marker).toHaveLength(1);

		const result = buildClassicRoster(
			rows,
			parseRosterUrl('https://bamastatesports.com/sports/womens-soccer/roster')
		);
		expect(result.platform).toBe('classic');
		expect(result.schoolHost).toBe('bamastatesports.com');
		expect(result.sportSlug).toBe('womens-soccer');
		expect(result.title).toBe('Alabama State University Athletics');
		expect(result.season).toBeNull();
		expect(result.players).toHaveLength(3);
		expect(result.coaches).toHaveLength(2);

		expect(result.players[0]).toEqual({
			firstName: 'Valentina',
			lastName: 'Espinel',
			fullName: 'Valentina Espinel',
			jerseyNumber: '0',
			position: 'Goalkeeper',
			academicYear: 'Fr.',
			height: `5'7"`,
			hometown: 'Quito, Ecuador',
			highSchool: null,
			previousSchool: 'Unidad Educativa Particular Letort',
			major: null,
			bioUrl: 'https://bamastatesports.com/sports/womens-soccer/roster/valentina-espinel/9505',
			headshotUrl: 'https://bamastatesports.com/images/2026/8/7/V_Espinel_2026_WSOC_Headshot.png'
		});

		expect(result.coaches[0]).toEqual({
			name: 'Alicia Wilson',
			title: "Head Women's Soccer Coach",
			bioUrl: 'https://bamastatesports.com/sports/womens-soccer/roster/coaches/alicia-wilson/1536',
			headshotUrl: 'https://bamastatesports.com/images/2025/6/24/wilson_alicia_060325.JPG'
		});
	});

	test('joins text across elements with a space, like the Rust adapter', () => {
		const rows = extractFromHtml(
			'<li class="sidearm-roster-player"><div class="sidearm-roster-player-name"><span>Ana</span><span>Díaz</span></div></li>',
			CLASSIC_ROSTER_SPEC
		);
		expect(rows.players[0].name).toBe('Ana Díaz');
		expect(rows.players[0].nameLink).toBeNull();
	});

	test('reads the season and falls back to src for images', () => {
		const rows = extractFromHtml(
			`<html><body>
			<select id="sidearm-roster-select-year"><option>2025</option><option selected>2026</option></select>
			<ul><li class="sidearm-roster-coach"><div class="sidearm-roster-coach-image"><img src="/c.jpg?width=80"></div></li></ul>
			</body></html>`,
			CLASSIC_ROSTER_SPEC
		);
		const result = buildClassicRoster(rows, parseRosterUrl('https://x.edu/sports/golf/roster'));
		expect(result.season).toBe('2026');
		expect(result.coaches[0]).toEqual({
			name: 'Unknown',
			title: null,
			bioUrl: null,
			headshotUrl: 'https://x.edu/c.jpg'
		});
	});

	test('finds no Classic markup on other pages', () => {
		const rows = extractFromHtml('<div>not a roster page</div>', CLASSIC_ROSTER_SPEC);
		expect(rows.marker).toHaveLength(0);
		expect(rows.players).toHaveLength(0);
	});
});
