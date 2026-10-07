// Test double for `SitePage`: serves canned documents and API responses, and
// runs the real in-page extractor against the current document via linkedom.
import { parseHTML } from 'linkedom';
import { ScraperError } from './errors';
import { extractRows, type Extracted, type ExtractSpec } from './extract';
import type { ApiResponse, PageLoad, SitePage } from './page';

export type FakeDocument = {
	html: string;
	status?: number | null;
	/** Where the tab ends up, when it isn't the requested URL. */
	finalUrl?: string;
};

export type FakeSite = {
	/** Documents by URL. Unknown URLs fail to load. */
	pages?: Record<string, FakeDocument>;
	/** API responses by path. Unknown paths answer 404. */
	api?: Record<string, ApiResponse>;
};

export class FakeSitePage implements SitePage {
	readonly opened: string[] = [];
	readonly fetched: string[] = [];
	readonly #site: FakeSite;
	#html = '';

	constructor(site: FakeSite) {
		this.#site = site;
	}

	async open(url: string): Promise<PageLoad> {
		this.opened.push(url);
		const page = this.#site.pages?.[url];
		if (!page) throw new ScraperError('http', `couldn't load ${url} (net::ERR_NAME_NOT_RESOLVED)`);
		this.#html = page.html;
		return { status: page.status === undefined ? 200 : page.status, url: page.finalUrl ?? url };
	}

	async fetchJson(path: string): Promise<ApiResponse> {
		this.fetched.push(path);
		return this.#site.api?.[path] ?? { status: 404, data: null };
	}

	async extract<S extends ExtractSpec>(spec: S): Promise<Extracted<S>> {
		return extractFromHtml(this.#html, spec);
	}
}

/** Run `extractRows` against an HTML string, the way it runs in the browser tab. */
export function extractFromHtml<S extends ExtractSpec>(html: string, spec: S): Extracted<S> {
	const { document } = parseHTML(html);
	Object.assign(globalThis, { document });
	return extractRows(spec) as Extracted<S>;
}
