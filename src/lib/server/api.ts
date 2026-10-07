import { json } from '@sveltejs/kit';
import type { BrowserWorker } from '@cloudflare/puppeteer';
import { errorMessage, ScraperError } from './scraper/errors';

/** Run an API handler; failures become `{ error }` JSON with a message the UI shows as-is. */
export async function apiResponse(run: () => Promise<unknown>): Promise<Response> {
	try {
		return json(await run());
	} catch (error) {
		if (error instanceof ScraperError) {
			console.warn(`[api] ${error.message}`);
			return json({ error: error.message }, { status: error.status });
		}
		console.error('[api] unexpected error', error);
		return json({ error: `Unexpected error: ${errorMessage(error)}` }, { status: 500 });
	}
}

export function browserBinding(platform: App.Platform | undefined): BrowserWorker {
	const binding = platform?.env.BROWSER;
	if (!binding) {
		throw new ScraperError('browser', 'the BROWSER binding is missing (see wrangler.jsonc)');
	}
	return binding;
}

export function requiredParam(url: URL, name: string): string {
	const value = url.searchParams.get(name)?.trim();
	if (!value) throw new ScraperError('invalid', `missing "${name}" query parameter`);
	return value;
}
