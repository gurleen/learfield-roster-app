import { ScraperError } from './errors';

export const DEFAULT_SPORT_SLUG = 'womens-soccer';

const ROSTER_PATH = /^\/sports\/([^/]+)\/roster\/?$/i;

const RESIZE_PARAMS = new Set([
	'width',
	'height',
	'quality',
	'mode',
	'anchor',
	'gravity',
	'type',
	'format'
]);

export type ParsedRosterUrl = {
	origin: string;
	sportSlug: string;
	normalizedUrl: string;
};

/** Validate a Sidearm roster page URL (`/sports/{slug}/roster`) and split out its parts. */
export function parseRosterUrl(rawUrl: string): ParsedRosterUrl {
	let url: URL;
	try {
		url = new URL(rawUrl.trim());
	} catch {
		throw new ScraperError('invalid', `"${rawUrl}" is not a valid URL`);
	}

	const match = /^https?:$/.test(url.protocol) ? ROSTER_PATH.exec(url.pathname) : null;
	if (!match) {
		throw new ScraperError(
			'unsupported',
			'URL must be a Sidearm roster page like https://school.edu/sports/womens-soccer/roster'
		);
	}

	const sportSlug = match[1];
	return {
		origin: url.origin,
		sportSlug,
		normalizedUrl: `${url.origin}/sports/${sportSlug}/roster`
	};
}

/** Normalize a bare host or any URL on an athletics site to its https origin. */
export function originFromWebsite(website: string): string {
	const trimmed = website.trim();
	try {
		const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
		if (url.hostname) return `https://${url.host}`;
	} catch {
		// Reported below.
	}
	throw new ScraperError('invalid', `"${website}" is not a website host or URL`);
}

export function joinUrl(base: string, path: string): string | null {
	try {
		return new URL(path, base).href;
	} catch {
		return null;
	}
}

export function schoolHost(origin: string): string {
	return new URL(origin).hostname;
}

function isSidearmImageCdn(hostname: string): boolean {
	const host = hostname.toLowerCase();
	return host === 'images.sidearmdev.com' || host.endsWith('.images.sidearmdev.com');
}

/** If this is a Sidearm convert/CDN URL, return the embedded origin asset URL. */
function unwrapSidearmCdnUrl(url: URL): string | null {
	if (!isSidearmImageCdn(url.hostname)) return null;
	const embedded = url.searchParams.get('url');
	if (embedded === null) return null;
	try {
		return new URL(embedded).href;
	} catch {
		return embedded;
	}
}

function stripResizeParams(url: URL): string {
	const retained = [...url.searchParams].filter(([key]) => !RESIZE_PARAMS.has(key.toLowerCase()));
	url.search = retained.map(([key, value]) => `${key}=${value}`).join('&');
	return url.href;
}

/**
 * Unwrap Sidearm's `images.sidearmdev.com/convert?url=...` CDN wrapper and
 * strip resize query params, yielding the stable original image URL.
 */
export function resolveOriginalImageUrl(
	raw: string | null | undefined,
	pageOrigin: string
): string | null {
	const trimmed = raw?.trim();
	if (!trimmed) return null;

	let url: URL;
	try {
		url = new URL(trimmed, pageOrigin);
	} catch {
		return null;
	}

	const seen = new Set<string>();
	for (let hop = 0; hop < 8; hop++) {
		const embedded = unwrapSidearmCdnUrl(url);
		if (embedded === null || seen.has(embedded)) break;
		seen.add(embedded);
		try {
			url = new URL(embedded);
		} catch {
			return embedded;
		}
	}

	return stripResizeParams(url);
}
