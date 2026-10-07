/** Failure categories, mirroring the desktop app's Rust `ScraperError`. */
export type ScraperErrorKind =
	'invalid' | 'http' | 'blocked' | 'unsupported' | 'not_found' | 'parse' | 'browser';

const PREFIX: Record<ScraperErrorKind, string> = {
	invalid: 'Invalid request',
	http: 'HTTP request failed',
	blocked: 'Athletics site blocked the request',
	unsupported: 'Unsupported roster page',
	not_found: 'Not found',
	parse: 'Failed to parse response',
	browser: 'Browser Run unavailable'
};

const STATUS: Record<ScraperErrorKind, number> = {
	invalid: 400,
	unsupported: 422,
	not_found: 404,
	http: 502,
	blocked: 502,
	parse: 502,
	browser: 503
};

export class ScraperError extends Error {
	readonly kind: ScraperErrorKind;

	constructor(kind: ScraperErrorKind, detail: string) {
		super(`${PREFIX[kind]}: ${detail}`);
		this.name = 'ScraperError';
		this.kind = kind;
	}

	/** HTTP status the API routes respond with. */
	get status(): number {
		return STATUS[this.kind];
	}
}

export function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
