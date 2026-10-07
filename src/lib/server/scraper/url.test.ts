/// <reference types="bun" />
import { describe, expect, test } from 'bun:test';
import { ScraperError } from './errors';
import { originFromWebsite, parseRosterUrl, resolveOriginalImageUrl } from './url';

describe('parseRosterUrl', () => {
	test('parses a roster URL', () => {
		expect(parseRosterUrl('https://gozips.com/sports/womens-soccer/roster')).toEqual({
			origin: 'https://gozips.com',
			sportSlug: 'womens-soccer',
			normalizedUrl: 'https://gozips.com/sports/womens-soccer/roster'
		});
	});

	test('accepts a trailing slash and surrounding whitespace', () => {
		const parsed = parseRosterUrl('  https://gozips.com/sports/mens-basketball/roster/ ');
		expect(parsed.sportSlug).toBe('mens-basketball');
		expect(parsed.normalizedUrl).toBe('https://gozips.com/sports/mens-basketball/roster');
	});

	test('rejects pages that are not rosters', () => {
		expect(() => parseRosterUrl('https://gozips.com/sports/womens-soccer')).toThrow(
			'Unsupported roster page'
		);
	});

	test('rejects non-web schemes and unparseable input', () => {
		expect(() => parseRosterUrl('ftp://gozips.com/sports/womens-soccer/roster')).toThrow(
			ScraperError
		);
		expect(() => parseRosterUrl('gozips.com/sports/womens-soccer/roster')).toThrow(
			'Invalid request'
		);
	});
});

describe('originFromWebsite', () => {
	test('normalizes hosts and URLs to an https origin', () => {
		expect(originFromWebsite('gozips.com')).toBe('https://gozips.com');
		expect(originFromWebsite('https://gozips.com/')).toBe('https://gozips.com');
		expect(originFromWebsite(' http://gozips.com/sports/football/roster ')).toBe(
			'https://gozips.com'
		);
	});

	test('rejects input that is not a host', () => {
		expect(() => originFromWebsite('not a site')).toThrow('Invalid request');
	});
});

describe('resolveOriginalImageUrl', () => {
	test('unwraps the Sidearm CDN and strips resize params', () => {
		const raw =
			'https://images.sidearmdev.com/convert?url=https%3A%2F%2Fcdn.example.com%2Fphoto.jpg%3Fwidth%3D80%26quality%3D90&type=webp';
		expect(resolveOriginalImageUrl(raw, 'https://gozips.com')).toBe(
			'https://cdn.example.com/photo.jpg'
		);
	});

	test('resolves relative URLs against the page origin', () => {
		expect(
			resolveOriginalImageUrl(
				'/images/2026/8/7/headshot.png?width=80',
				'https://bamastatesports.com'
			)
		).toBe('https://bamastatesports.com/images/2026/8/7/headshot.png');
	});

	test('keeps query params that are not resize params', () => {
		expect(resolveOriginalImageUrl('https://x.edu/a.jpg?WIDTH=80&v=2', 'https://x.edu')).toBe(
			'https://x.edu/a.jpg?v=2'
		);
	});

	test('returns null for a missing image', () => {
		expect(resolveOriginalImageUrl(null, 'https://gozips.com')).toBeNull();
		expect(resolveOriginalImageUrl('  ', 'https://gozips.com')).toBeNull();
	});
});
