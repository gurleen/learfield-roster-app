<script lang="ts">
	import { open, save } from "@tauri-apps/plugin-dialog";
	import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
	import { CircleAlert, FolderOpen, GripVertical, ListOrdered, Plus, Save, X } from "@lucide/svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { NumericInput } from "$lib/components/ui/numeric-input/index.js";
	import { Spinner } from "$lib/components/ui/spinner/index.js";
	import { NonIdealState } from "$lib/components/ui/non-ideal-state/index.js";
	import { ROSTER_CSV_HEADER, parseCsv, toCsv } from "$lib/csv";
	import { cn } from "$lib/utils.js";

	type CsvPlayer = {
		id: string;
		jerseyNumber: string | null;
		fullName: string;
		position: string | null;
		academicYear: string | null;
		height: string | null;
		hometown: string | null;
		highSchool: string | null;
		previousSchool: string | null;
		major: string | null;
	};

	let roster = $state<CsvPlayer[]>([]);
	let lineup = $state<CsvPlayer[]>([]);
	let starters = $state<number | undefined>(11);
	let loadedFileName = $state<string | null>(null);

	let loading = $state(false);
	let loadError = $state<string | null>(null);
	let savingCsv = $state(false);
	let saveError = $state<string | null>(null);

	const available = $derived(roster.filter((player) => !lineup.some((l) => l.id === player.id)));
	const lineupFull = $derived(starters !== undefined && lineup.length >= starters);

	function cell(row: string[], index: number): string | null {
		if (index < 0) return null;
		const value = row[index];
		return value === undefined || value === "" ? null : value;
	}

	function csvRowsToPlayers(rows: string[][]): CsvPlayer[] {
		if (rows.length === 0) return [];

		const header = rows[0].map((h) => h.trim().toLowerCase());
		const col = (name: string) => header.indexOf(name.toLowerCase());
		const idx = {
			jersey: col("Jersey #"),
			name: col("Name"),
			position: col("Position"),
			year: col("Year"),
			height: col("Height"),
			hometown: col("Hometown"),
			highSchool: col("High School"),
			previousSchool: col("Previous School"),
			major: col("Major"),
		};

		if (idx.name < 0) {
			throw new Error('CSV is missing a "Name" column');
		}

		return rows
			.slice(1)
			.map((row, i) => ({
				id: `${i}-${row[idx.name] ?? ""}`,
				jerseyNumber: cell(row, idx.jersey),
				fullName: cell(row, idx.name) ?? "",
				position: cell(row, idx.position),
				academicYear: cell(row, idx.year),
				height: cell(row, idx.height),
				hometown: cell(row, idx.hometown),
				highSchool: cell(row, idx.highSchool),
				previousSchool: cell(row, idx.previousSchool),
				major: cell(row, idx.major),
			}))
			.filter((player) => player.fullName);
	}

	async function loadCsv() {
		loadError = null;

		try {
			const path = await open({ filters: [{ name: "CSV", extensions: ["csv"] }], multiple: false });
			if (!path) return;

			loading = true;
			const text = await readTextFile(path);
			roster = csvRowsToPlayers(parseCsv(text));
			lineup = [];
			loadedFileName = path.split(/[\\/]/).pop() ?? path;
		} catch (error) {
			loadError = String(error);
		} finally {
			loading = false;
		}
	}

	function addToLineup(player: CsvPlayer) {
		if (lineupFull) return;
		lineup = [...lineup, player];
	}

	function removeFromLineup(player: CsvPlayer) {
		lineup = lineup.filter((p) => p.id !== player.id);
	}

	let draggedIndex = $state<number | null>(null);
	let dragOverIndex = $state<number | null>(null);

	function handleDragStart(event: DragEvent, index: number) {
		draggedIndex = index;
		event.dataTransfer?.setData("text/plain", String(index));
		if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
	}

	function handleDragOver(event: DragEvent, index: number) {
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
		dragOverIndex = index;
	}

	function handleDrop(event: DragEvent, index: number) {
		event.preventDefault();
		if (draggedIndex === null || draggedIndex === index) {
			draggedIndex = null;
			dragOverIndex = null;
			return;
		}

		const next = lineup.slice();
		const [moved] = next.splice(draggedIndex, 1);
		next.splice(index, 0, moved);
		lineup = next;
		draggedIndex = null;
		dragOverIndex = null;
	}

	function handleDragEnd() {
		draggedIndex = null;
		dragOverIndex = null;
	}

	function lineupToCsv(): string {
		const rows = lineup.map((player) => [
			player.jerseyNumber,
			player.fullName,
			player.position,
			player.academicYear,
			player.height,
			player.hometown,
			player.highSchool,
			player.previousSchool,
			player.major,
		]);
		return toCsv(ROSTER_CSV_HEADER, rows);
	}

	async function saveLineupCsv() {
		if (lineup.length === 0) return;

		saveError = null;

		try {
			const path = await save({
				defaultPath: "starting-lineup.csv",
				filters: [{ name: "CSV", extensions: ["csv"] }],
			});
			if (!path) return;

			savingCsv = true;
			await writeTextFile(path, lineupToCsv());
		} catch (error) {
			saveError = String(error);
		} finally {
			savingCsv = false;
		}
	}
</script>

<div class="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
	<Card.Root>
		<Card.Header>
			<Card.Title>Starting lineup</Card.Title>
			<Card.Description>Load a saved roster CSV, then select and order the starting lineup.</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4 sm:flex-row sm:items-end">
			<div class="space-y-1.5">
				<Label>Roster CSV</Label>
				<div class="flex items-center gap-2">
					<Button variant="secondary" onclick={loadCsv} disabled={loading}>
						{#if loading}
							<Spinner size="sm" />
						{:else}
							<FolderOpen />
						{/if}
						Load CSV
					</Button>
					{#if loadedFileName}
						<span class="text-xs text-muted-foreground">{loadedFileName} · {roster.length} players</span>
					{/if}
				</div>
			</div>
			<div class="space-y-1.5">
				<Label for="starters-count">Number of starters</Label>
				<NumericInput id="starters-count" bind:value={starters} min={1} max={roster.length || undefined} />
			</div>
		</Card.Content>
		{#if loadError}
			<Card.Footer>
				<p class="flex items-center gap-1.5 text-xs text-destructive">
					<CircleAlert class="size-3.5" />
					{loadError}
				</p>
			</Card.Footer>
		{/if}
	</Card.Root>

	{#if roster.length === 0}
		<Card.Root>
			<NonIdealState
				icon={ListOrdered}
				title="No roster loaded"
				description="Load a roster CSV to start building your lineup."
			/>
		</Card.Root>
	{:else}
		<div class="grid gap-6 lg:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title>Available players</Card.Title>
					<Card.Description>{available.length} not in the lineup</Card.Description>
				</Card.Header>
				<Card.Content class="overflow-x-auto">
					{#if available.length === 0}
						<NonIdealState title="All players selected" description="Every loaded player is in the lineup." />
					{:else}
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>#</Table.Head>
									<Table.Head>Name</Table.Head>
									<Table.Head>Position</Table.Head>
									<Table.Head class="w-10"></Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each available as player (player.id)}
									<Table.Row>
										<Table.Cell>{player.jerseyNumber ?? "—"}</Table.Cell>
										<Table.Cell class="font-medium">{player.fullName}</Table.Cell>
										<Table.Cell>{player.position ?? "—"}</Table.Cell>
										<Table.Cell>
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label={`Add ${player.fullName} to lineup`}
												onclick={() => addToLineup(player)}
												disabled={lineupFull}
											>
												<Plus />
											</Button>
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					{/if}
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Lineup order</Card.Title>
					<Card.Description>
						{lineup.length}{starters !== undefined ? ` / ${starters}` : ""} starters selected
					</Card.Description>
					<Card.Action>
						<Button variant="outline" onclick={saveLineupCsv} disabled={lineup.length === 0 || savingCsv}>
							{#if savingCsv}
								<Spinner size="sm" />
							{:else}
								<Save />
							{/if}
							Save as CSV
						</Button>
					</Card.Action>
					{#if saveError}
						<p class="flex items-center gap-1.5 text-xs text-destructive">
							<CircleAlert class="size-3.5" />
							{saveError}
						</p>
					{/if}
				</Card.Header>
				<Card.Content class="overflow-x-auto">
					{#if lineup.length === 0}
						<NonIdealState title="No starters yet" description="Add players from the roster on the left." />
					{:else}
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head class="w-8"></Table.Head>
									<Table.Head class="w-10">Order</Table.Head>
									<Table.Head>Name</Table.Head>
									<Table.Head>Position</Table.Head>
									<Table.Head class="w-10"></Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each lineup as player, index (player.id)}
									<Table.Row
										ondragover={(e: DragEvent) => handleDragOver(e, index)}
										ondrop={(e: DragEvent) => handleDrop(e, index)}
										class={cn(
											"transition-colors",
											dragOverIndex === index && draggedIndex !== index && "bg-accent/60",
											draggedIndex === index && "opacity-40",
										)}
									>
										<Table.Cell>
											<button
												type="button"
												aria-label={`Drag to reorder ${player.fullName}`}
												draggable="true"
												ondragstart={(e: DragEvent) => handleDragStart(e, index)}
												ondragend={handleDragEnd}
												class="flex cursor-grab items-center text-muted-foreground hover:text-foreground active:cursor-grabbing"
											>
												<GripVertical class="size-4" />
											</button>
										</Table.Cell>
										<Table.Cell>{index + 1}</Table.Cell>
										<Table.Cell class="font-medium">{player.fullName}</Table.Cell>
										<Table.Cell>{player.position ?? "—"}</Table.Cell>
										<Table.Cell>
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label={`Remove ${player.fullName} from lineup`}
												onclick={() => removeFromLineup(player)}
											>
												<X />
											</Button>
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	{/if}
</div>
