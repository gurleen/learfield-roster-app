import type { Coach, Player, RosterResult } from '$lib/types/roster';
import type { Extracted, ExtractSpec } from './extract';
import { nonEmpty } from './text';
import { joinUrl, resolveOriginalImageUrl, schoolHost, type ParsedRosterUrl } from './url';

/** What to read from Sidearm's server-rendered ("Classic") roster markup. */
export const CLASSIC_ROSTER_SPEC = {
	players: {
		rows: 'li.sidearm-roster-player',
		fields: {
			jersey: { selector: '.sidearm-roster-player-jersey-number' },
			nameLink: { selector: '.sidearm-roster-player-name a' },
			name: { selector: '.sidearm-roster-player-name' },
			position: { selector: '.sidearm-roster-player-position-long-short' },
			height: { selector: '.sidearm-roster-player-height' },
			academicYear: { selector: '.sidearm-roster-player-academic-year' },
			hometown: { selector: '.sidearm-roster-player-hometown' },
			highSchool: { selector: '.sidearm-roster-player-highschool' },
			major: { selector: '.sidearm-roster-player-major' },
			previousSchool: {
				selector: '.sidearm-roster-player-previous-school, .sidearm-roster-player-previous'
			},
			bioPath: { attr: 'data-player-url' },
			imageDataSrc: { selector: '.sidearm-roster-player-image img', attr: 'data-src' },
			imageSrc: { selector: '.sidearm-roster-player-image img', attr: 'src' }
		}
	},
	coaches: {
		rows: 'li.sidearm-roster-coach',
		fields: {
			name: { selector: '.sidearm-roster-coach-name' },
			title: { selector: '.sidearm-roster-coach-title' },
			bioPath: { selector: '.sidearm-roster-coach-link a', attr: 'href' },
			imageDataSrc: { selector: '.sidearm-roster-coach-image img', attr: 'data-src' },
			imageSrc: { selector: '.sidearm-roster-coach-image img', attr: 'src' }
		}
	},
	page: {
		rows: 'html',
		fields: {
			h1: { selector: 'h1' },
			headerH1: { selector: '.sidearm-roster-header h1' },
			seasonById: { selector: 'select#sidearm-roster-select-year option[selected]' },
			seasonByClass: { selector: 'select.sidearm-roster-select-year option[selected]' }
		}
	},
	/** Any Classic roster markup at all; an empty roster page still counts. */
	marker: { rows: '[class*="sidearm-roster-player"]', limit: 1, fields: {} }
} satisfies ExtractSpec;

export type ClassicRosterRows = Extracted<typeof CLASSIC_ROSTER_SPEC>;

/** Naive split, same as the Rust adapter: everything but the last word is the first name. */
export function splitName(full: string): [first: string, last: string] {
	const parts = full.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return ['', ''];
	if (parts.length === 1) return [parts[0], ''];
	return [parts.slice(0, -1).join(' '), parts[parts.length - 1]];
}

/** Prefer the lazy-load `data-src` over `src`, as the page's own script would. */
function imageSource(dataSrc: string | null, src: string | null): string | null {
	return (dataSrc ?? src)?.trim() || null;
}

function toPlayer(row: ClassicRosterRows['players'][number], origin: string): Player {
	const fullName = row.nameLink ?? row.name ?? '';
	const [firstName, lastName] = splitName(fullName);
	return {
		firstName,
		lastName,
		fullName,
		jerseyNumber: nonEmpty(row.jersey),
		position: nonEmpty(row.position),
		academicYear: nonEmpty(row.academicYear),
		height: nonEmpty(row.height),
		hometown: nonEmpty(row.hometown),
		highSchool: nonEmpty(row.highSchool),
		previousSchool: nonEmpty(row.previousSchool),
		major: nonEmpty(row.major),
		bioUrl: row.bioPath === null ? null : joinUrl(origin, row.bioPath),
		headshotUrl: resolveOriginalImageUrl(imageSource(row.imageDataSrc, row.imageSrc), origin)
	};
}

function toCoach(row: ClassicRosterRows['coaches'][number], origin: string): Coach {
	return {
		name: nonEmpty(row.name) ?? 'Unknown',
		title: nonEmpty(row.title),
		bioUrl: row.bioPath === null ? null : joinUrl(origin, row.bioPath),
		headshotUrl: resolveOriginalImageUrl(imageSource(row.imageDataSrc, row.imageSrc), origin)
	};
}

/** Build a roster from rows extracted with {@link CLASSIC_ROSTER_SPEC}. */
export function buildClassicRoster(rows: ClassicRosterRows, parsed: ParsedRosterUrl): RosterResult {
	const [page] = rows.page;
	return {
		sourceUrl: parsed.normalizedUrl,
		platform: 'classic',
		schoolHost: schoolHost(parsed.origin),
		sportSlug: parsed.sportSlug,
		title: nonEmpty(page?.h1) ?? nonEmpty(page?.headerH1),
		season: nonEmpty(page?.seasonById ?? page?.seasonByClass),
		players: rows.players.map((row) => toPlayer(row, parsed.origin)),
		coaches: rows.coaches.map((row) => toCoach(row, parsed.origin))
	};
}
