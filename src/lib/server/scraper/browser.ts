import puppeteer, {
	TimeoutError,
	type Browser,
	type BrowserWorker,
	type HTTPResponse,
	type Page
} from '@cloudflare/puppeteer';
import { errorMessage, ScraperError } from './errors';
import { extractRows, type Extracted, type ExtractSpec } from './extract';
import type { ApiResponse, PageLoad, SitePage } from './page';

const NAVIGATION_TIMEOUT_MS = 30_000;
const API_TIMEOUT_MS = 15_000;
/** How long a bot-protection interstitial gets to hand over to the real page. */
const READY_TIMEOUT_MS = 10_000;
/** Every real Sidearm page, NextGen or Classic, links to its sports from the nav. */
const READY_SELECTOR = 'a[href*="/sports/"]';
/** Signatures of bot-protection block pages; Imperva fronts most Sidearm sites. */
const BLOCK_MARKERS = ['_Incapsula_Resource', 'Incapsula incident ID', 'cf-chl-', 'Access Denied'];
/** Per Cloudflare's session-reuse guide: open contexts a shared browser takes before we launch another. */
const MAX_CONTEXTS_PER_BROWSER = 4;

/**
 * Run `task` in a fresh tab on a Browser Run session, isolated in its own
 * browser context. A warm session is reused when one has room, which skips the
 * cold start and the Free plan's one-new-browser-every-20-seconds limit; we
 * disconnect rather than close so it stays warm (it idles out after 60s).
 */
export async function withBrowserPage<T>(
	binding: BrowserWorker,
	task: (page: SitePage) => Promise<T>
): Promise<T> {
	const browser = await connectBrowser(binding);
	try {
		const context = await browser.createBrowserContext();
		try {
			return await task(new BrowserSitePage(await context.newPage()));
		} finally {
			await context.close().catch(() => {});
		}
	} finally {
		await browser.disconnect().catch(() => {});
	}
}

async function connectBrowser(binding: BrowserWorker): Promise<Browser> {
	const sessions = await puppeteer.sessions(binding).catch(() => []);
	// Start at a random session so concurrent requests spread across browsers.
	const start = Math.floor(Math.random() * sessions.length);
	for (const { sessionId } of [...sessions.slice(start), ...sessions.slice(0, start)]) {
		let browser: Browser | undefined;
		try {
			browser = await puppeteer.connect(binding, sessionId);
			if (await hasCapacity(browser)) return browser;
		} catch {
			// The session closed after it was listed.
		}
		await browser?.disconnect().catch(() => {});
	}

	try {
		return await puppeteer.launch(binding);
	} catch (error) {
		throw new ScraperError('browser', `couldn't start a browser session (${errorMessage(error)})`);
	}
}

async function hasCapacity(browser: Browser): Promise<boolean> {
	const client = await browser.target().createCDPSession();
	try {
		const { browserContextIds } = await client.send('Target.getBrowserContexts');
		return browserContextIds.length < MAX_CONTEXTS_PER_BROWSER;
	} finally {
		await client.detach().catch(() => {});
	}
}

class BrowserSitePage implements SitePage {
	readonly #page: Page;

	constructor(page: Page) {
		this.#page = page;
	}

	async open(url: string): Promise<PageLoad> {
		const page = this.#page;
		// Interstitials reload into the real page, so keep the latest main-document status.
		let status: number | null = null;
		const onResponse = (response: HTTPResponse) => {
			if (response.request().isNavigationRequest() && response.frame() === page.mainFrame()) {
				status = response.status();
			}
		};

		page.on('response', onResponse);
		try {
			await page
				.goto(url, { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT_MS })
				.catch((error: unknown) => {
					// An interstitial can replace the navigation mid-flight; the wait below covers it.
					if (!errorMessage(error).includes('net::ERR_ABORTED')) throw error;
				});
			const ready = await page.waitForSelector(READY_SELECTOR, { timeout: READY_TIMEOUT_MS }).then(
				() => true,
				() => false
			);
			if (!ready && (await this.#looksBlocked())) {
				throw new ScraperError('blocked', `bot protection rejected the browser at ${url}`);
			}
		} catch (error) {
			throw navigationError(error, url);
		} finally {
			page.off('response', onResponse);
		}

		return { status, url: page.url() };
	}

	async fetchJson(path: string, keys: readonly string[]): Promise<ApiResponse> {
		const { status, json } = await this.#page.evaluate(
			async (apiPath, keepKeys, timeoutMs) => {
				try {
					const response = await fetch(new URL(apiPath, location.origin), {
						headers: { Accept: 'application/json' },
						signal: AbortSignal.timeout(timeoutMs)
					});
					const body = await response.text();
					try {
						const keep = new Set(keepKeys);
						const trimmed = JSON.stringify(JSON.parse(body), (key, value) =>
							key === '' || /^\d+$/.test(key) || keep.has(key) ? value : undefined
						);
						return { status: response.status, json: trimmed };
					} catch {
						return { status: response.status, json: null };
					}
				} catch {
					return { status: 0, json: null };
				}
			},
			path,
			[...keys],
			API_TIMEOUT_MS
		);
		return { status, data: json === null ? null : JSON.parse(json) };
	}

	async extract<S extends ExtractSpec>(spec: S): Promise<Extracted<S>> {
		return (await this.#page.evaluate(extractRows, spec)) as Extracted<S>;
	}

	async #looksBlocked(): Promise<boolean> {
		return this.#page
			.evaluate((markers) => {
				const html = document.documentElement.outerHTML;
				return markers.some((marker) => html.includes(marker));
			}, BLOCK_MARKERS)
			.catch(() => false);
	}
}

function navigationError(error: unknown, url: string): ScraperError {
	if (error instanceof ScraperError) return error;
	const message = errorMessage(error);
	if (message.includes('ERR_TOO_MANY_REDIRECTS')) {
		return new ScraperError('blocked', `redirect loop while fetching ${url}`);
	}
	if (error instanceof TimeoutError) {
		return new ScraperError('http', `timed out loading ${url}`);
	}
	// Chrome's messages read "net::ERR_NAME_NOT_RESOLVED at <url>"; the code alone is enough.
	const netError = /net::ERR_[A-Z_]+/.exec(message)?.[0];
	return new ScraperError('http', `couldn't load ${url} (${netError ?? message})`);
}
