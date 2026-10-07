export const ROSTER_CSV_HEADER = [
	"Jersey #",
	"Name",
	"Position",
	"Year",
	"Height",
	"Hometown",
	"High School",
	"Previous School",
	"Major",
];

export function csvField(value: string | null | undefined): string {
	const text = value ?? "";
	return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(header: string[], rows: (string | null)[][]): string {
	const lines = [header.map(csvField).join(",")];
	for (const row of rows) {
		lines.push(row.map(csvField).join(","));
	}
	return lines.join("\n");
}

/** Saves CSV text through the browser's download flow. */
export function downloadCsv(filename: string, csv: string) {
	const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	// Revoking synchronously can cancel the download in some browsers.
	setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Parses RFC 4180-style CSV text (quoted fields, escaped quotes, embedded newlines) into rows of raw string cells. */
export function parseCsv(text: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = "";
	let inQuotes = false;

	for (let i = 0; i < text.length; i++) {
		const char = text[i];

		if (inQuotes) {
			if (char === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i++;
				} else {
					inQuotes = false;
				}
			} else {
				field += char;
			}
			continue;
		}

		if (char === '"') {
			inQuotes = true;
		} else if (char === ",") {
			row.push(field);
			field = "";
		} else if (char === "\n" || char === "\r") {
			if (char === "\r" && text[i + 1] === "\n") i++;
			row.push(field);
			rows.push(row);
			row = [];
			field = "";
		} else {
			field += char;
		}
	}

	if (field.length > 0 || row.length > 0) {
		row.push(field);
		rows.push(row);
	}

	return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}
