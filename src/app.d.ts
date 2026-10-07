// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				/** Browser Run binding, declared under `browser` in wrangler.jsonc. */
				BROWSER: import('@cloudflare/puppeteer').BrowserWorker;
			};
		}
	}
}

export {};
