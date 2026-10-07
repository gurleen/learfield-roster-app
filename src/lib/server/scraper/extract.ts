/** One value to read from a matched row: an element's text, or one of its attributes. */
export type FieldSpec = {
	/** CSS selector, relative to the row. Omit to read the row element itself. */
	selector?: string;
	/** Read this attribute instead of the element's text. */
	attr?: string;
};

export type RowSpec = {
	/** CSS selector for the rows, matched against the whole document. */
	rows: string;
	limit?: number;
	fields: Record<string, FieldSpec>;
};

export type ExtractSpec = Record<string, RowSpec>;

export type ExtractedRows = Record<string, Record<string, string | null>[]>;

/** Rows per group. A field is `null` when its element or attribute is missing. */
export type Extracted<S extends ExtractSpec> = {
	[Group in keyof S]: Record<keyof S[Group]['fields'], string | null>[];
};

/**
 * Read text and attributes out of the current document: Browser Run's `/scrape`
 * Quick Action, but with fields grouped per row (player, coach, ...). Text
 * matches the Rust adapter's: every descendant text node joined with a space,
 * then whitespace-collapsed.
 *
 * This runs inside the browser tab via `page.evaluate()`, so it has to stay
 * self-contained: no imports or module-level references, and no named functions
 * declared in the body (Wrangler's esbuild pass wraps those in a `__name()`
 * helper that doesn't exist in the page).
 */
export function extractRows(spec: ExtractSpec): ExtractedRows {
	const result: ExtractedRows = {};
	for (const [group, rowSpec] of Object.entries(spec)) {
		const rows = Array.from(document.querySelectorAll(rowSpec.rows)).slice(0, rowSpec.limit);
		result[group] = rows.map((row) => {
			const values: Record<string, string | null> = {};
			for (const [key, field] of Object.entries(rowSpec.fields)) {
				const el = field.selector ? row.querySelector(field.selector) : row;
				if (!el) {
					values[key] = null;
				} else if (field.attr) {
					values[key] = el.getAttribute(field.attr);
				} else {
					const parts: string[] = [];
					const stack: Node[] = [el];
					for (let node = stack.pop(); node; node = stack.pop()) {
						if (node.nodeType === 3) parts.push(node.nodeValue ?? '');
						for (let i = node.childNodes.length - 1; i >= 0; i--) stack.push(node.childNodes[i]);
					}
					values[key] = parts.join(' ').split(/\s+/).filter(Boolean).join(' ');
				}
			}
			return values;
		});
	}
	return result;
}
