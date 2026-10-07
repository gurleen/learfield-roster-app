import type { Coach, Player, RosterResult } from '$lib/types/roster';
import { ScraperError } from './errors';
import { isSuccess, type ApiResponse, type SitePage } from './page';
import { nonEmpty } from './text';
import { resolveOriginalImageUrl, schoolHost, type ParsedRosterUrl } from './url';

export const SPORTS_PATH = '/api/v2/Sports';

/**
 * Every API field the mappers read. The page drops everything else (bios,
 * social links, ...) before sending responses back: a 105-player football
 * roster shrinks from ~380 KB to ~40 KB.
 */
export const NEXTGEN_KEYS = [
	// /api/v2/Sports
	'id',
	'title',
	'globalSportNameSlug',
	'nonSport',
	'rosterId',
	// /api/v2/Rosters
	'items',
	'displayTitle',
	'season',
	'players',
	'coaches',
	'firstName',
	'lastName',
	'jerseyNumber',
	'positionShort',
	'academicYearShort',
	'heightFeet',
	'heightInches',
	'hometown',
	'highSchool',
	'previousSchool',
	'major',
	'image',
	'url',
	'absoluteUrl',
	'rosterPlayerId',
	'staffId'
] as const;

export type SidearmSport = {
	id: number;
	title?: string | null;
	globalSportNameSlug?: string | null;
	nonSport?: boolean | null;
	rosterId?: number | null;
};

type SidearmImage = {
	url?: string | null;
	absoluteUrl?: string | null;
};

type SidearmPlayer = {
	firstName?: string | null;
	lastName?: string | null;
	jerseyNumber?: string | null;
	positionShort?: string | null;
	academicYearShort?: string | null;
	heightFeet?: number | null;
	heightInches?: number | null;
	hometown?: string | null;
	highSchool?: string | null;
	previousSchool?: string | null;
	major?: string | null;
	image?: SidearmImage | null;
	rosterPlayerId?: number | null;
};

type SidearmCoach = {
	firstName?: string | null;
	lastName?: string | null;
	title?: string | null;
	image?: SidearmImage | null;
	staffId?: number | null;
};

type SidearmRoster = {
	id: number;
	displayTitle?: string | null;
	season?: { title?: string | null } | null;
	players?: SidearmPlayer[] | null;
	coaches?: SidearmCoach[] | null;
};

type RostersListResponse = {
	items?: SidearmRoster[] | null;
};

/** True when `/api/v2/Sports` answered like a NextGen site: 2xx with a JSON array. */
export function isSportsList(
	response: ApiResponse
): response is ApiResponse & { data: SidearmSport[] } {
	return isSuccess(response.status) && Array.isArray(response.data);
}

export function formatHeight(
	feet: number | null | undefined,
	inches: number | null | undefined
): string | null {
	if (feet == null && inches == null) return null;
	const f = feet ?? 0;
	const i = inches ?? 0;
	if (f === 0 && i === 0) return null;
	return `${f}' ${i}''`;
}

export function slugifyName(first: string, last: string): string {
	return `${first}-${last}`
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function imageUrl(image: SidearmImage | null | undefined, origin: string): string | null {
	return resolveOriginalImageUrl(image?.absoluteUrl ?? image?.url, origin);
}

function mapPlayer(p: SidearmPlayer, origin: string, sportSlug: string): Player {
	const firstName = p.firstName ?? '';
	const lastName = p.lastName ?? '';
	return {
		firstName,
		lastName,
		fullName: [firstName, lastName].filter(Boolean).join(' ').trim(),
		jerseyNumber: nonEmpty(p.jerseyNumber),
		position: nonEmpty(p.positionShort),
		academicYear: nonEmpty(p.academicYearShort),
		height: formatHeight(p.heightFeet, p.heightInches),
		hometown: nonEmpty(p.hometown),
		highSchool: nonEmpty(p.highSchool),
		previousSchool: nonEmpty(p.previousSchool),
		major: nonEmpty(p.major),
		bioUrl:
			p.rosterPlayerId == null
				? null
				: `${origin}/sports/${sportSlug}/roster/${slugifyName(firstName, lastName)}/${p.rosterPlayerId}`,
		headshotUrl: imageUrl(p.image, origin)
	};
}

function mapCoach(c: SidearmCoach, origin: string): Coach {
	const name = [c.firstName, c.lastName]
		.filter((part) => part != null)
		.join(' ')
		.trim();
	return {
		name: name || 'Unknown',
		title: nonEmpty(c.title),
		bioUrl: c.staffId == null ? null : `${origin}/sports/staff-directory/bios/${c.staffId}`,
		headshotUrl: imageUrl(c.image, origin)
	};
}

async function fetchApi<T>(page: SitePage, origin: string, path: string): Promise<T> {
	const response = await page.fetchJson(path, NEXTGEN_KEYS);
	if (!isSuccess(response.status)) {
		const status = response.status === 0 ? 'no response' : response.status;
		throw new ScraperError('http', `NextGen API failed (${status}): ${origin}${path}`);
	}
	if (response.data === null) {
		throw new ScraperError('parse', `NextGen API returned non-JSON: ${origin}${path}`);
	}
	return response.data as T;
}

/** Scrape a roster through the NextGen JSON API, given the site's `/api/v2/Sports` list. */
export async function scrapeNextgen(
	page: SitePage,
	parsed: ParsedRosterUrl,
	sports: SidearmSport[]
): Promise<RosterResult> {
	const { origin, sportSlug } = parsed;

	const sport = sports.find((s) => s.globalSportNameSlug === sportSlug);
	if (!sport) {
		throw new ScraperError('not_found', `Sport "${sportSlug}" not found on ${origin}`);
	}

	const list = await fetchApi<RostersListResponse>(
		page,
		origin,
		`/api/v2/Rosters?sportId=${sport.id}`
	);
	const roster = list.items?.[0];
	if (!roster) {
		throw new ScraperError('not_found', `No roster found for sport id ${sport.id}`);
	}

	const detail = roster.players?.length
		? roster
		: await fetchApi<SidearmRoster>(page, origin, `/api/v2/Rosters/${roster.id}`);

	return {
		sourceUrl: parsed.normalizedUrl,
		platform: 'nextgen',
		schoolHost: schoolHost(origin),
		sportSlug,
		title: nonEmpty(detail.displayTitle),
		season: nonEmpty(detail.season?.title),
		players: (detail.players ?? []).map((p) => mapPlayer(p, origin, sportSlug)),
		coaches: (detail.coaches ?? []).map((c) => mapCoach(c, origin))
	};
}
