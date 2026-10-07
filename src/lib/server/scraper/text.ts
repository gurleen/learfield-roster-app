/** Trimmed text, or `null` when missing or blank. */
export function nonEmpty(value: string | number | null | undefined): string | null {
	if (value === null || value === undefined) return null;
	return String(value).trim() || null;
}
