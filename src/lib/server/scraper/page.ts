import type { Extracted, ExtractSpec } from './extract';

export type PageLoad = {
	/** Status of the main document response, after redirects and bot interstitials. */
	status: number | null;
	/** The tab's final URL. */
	url: string;
};

export type ApiResponse = {
	/** `0` when the request never got a response. */
	status: number;
	/** Parsed JSON body, or `null` when the body wasn't JSON. */
	data: unknown;
};

/**
 * A browser tab on an athletics site. Sidearm sites sit behind bot protection
 * that rejects plain fetches from Workers, so every request happens inside a
 * real page (see `browser.ts`).
 */
export interface SitePage {
	/** Navigate to `url` and wait until the page is past any bot-protection interstitial. */
	open(url: string): Promise<PageLoad>;
	/** GET a path on the current page's origin from inside the page, keeping only `keys` of the JSON body. */
	fetchJson(path: string, keys: readonly string[]): Promise<ApiResponse>;
	/** Run `extractRows` against the current document. */
	extract<S extends ExtractSpec>(spec: S): Promise<Extracted<S>>;
}

/** `null` statuses (navigations Chrome didn't report a response for) count as success. */
export function isSuccess(status: number | null): boolean {
	return status === null || (status >= 200 && status < 300);
}
