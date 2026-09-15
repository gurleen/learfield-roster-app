<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { save } from "@tauri-apps/plugin-dialog";
	import { writeTextFile } from "@tauri-apps/plugin-fs";
	import { CircleAlert, Save, Users } from "@lucide/svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Spinner } from "$lib/components/ui/spinner/index.js";
	import { NonIdealState } from "$lib/components/ui/non-ideal-state/index.js";
	import { ROSTER_CSV_HEADER, toCsv } from "$lib/csv";
	import type { RosterResult, SportInfo } from "$lib/types/roster";

	let website = $state("");
	let sports = $state<SportInfo[]>([]);
	let selectedSportSlug = $state("");
	let roster = $state<RosterResult | null>(null);

	let sportsLoading = $state(false);
	let sportsError = $state<string | null>(null);
	let rosterLoading = $state(false);
	let rosterError = $state<string | null>(null);
	let savingCsv = $state(false);
	let saveError = $state<string | null>(null);

	const selectedSportTitle = $derived(
		sports.find((sport) => sport.slug === selectedSportSlug)?.title ?? "Select a sport",
	);

	async function loadSports() {
		const host = website.trim();
		if (!host) return;

		sportsLoading = true;
		sportsError = null;
		sports = [];
		selectedSportSlug = "";
		roster = null;
		rosterError = null;

		try {
			sports = await invoke<SportInfo[]>("list_sports", { website: host });
		} catch (error) {
			sportsError = String(error);
		} finally {
			sportsLoading = false;
		}
	}

	async function scrapeRoster() {
		const host = website.trim();
		if (!host || !selectedSportSlug) return;

		rosterLoading = true;
		rosterError = null;
		roster = null;

		const url = `https://${host}/sports/${selectedSportSlug}/roster`;

		try {
			roster = await invoke<RosterResult>("fetch_roster", { url });
		} catch (error) {
			rosterError = String(error);
		} finally {
			rosterLoading = false;
		}
	}

	function rosterToCsv(result: RosterResult): string {
		const rows = result.players.map((player) => [
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

	async function saveRosterCsv() {
		if (!roster) return;

		saveError = null;
		const suggestedName = `${roster.schoolHost}-${roster.sportSlug}-roster.csv`;

		try {
			const path = await save({
				defaultPath: suggestedName,
				filters: [{ name: "CSV", extensions: ["csv"] }],
			});
			if (!path) return;

			savingCsv = true;
			await writeTextFile(path, rosterToCsv(roster));
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
			<Card.Title>Roster scraper</Card.Title>
			<Card.Description>Look up a school's athletics site, pick a sport, and pull its roster.</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4 sm:flex-row sm:items-end">
			<div class="flex-1 space-y-1.5">
				<Label for="school-host">School athletics site</Label>
				<Input
					id="school-host"
					placeholder="e.g. gozips.com"
					bind:value={website}
					onkeydown={(e) => e.key === "Enter" && loadSports()}
				/>
			</div>
			<Button variant="secondary" onclick={loadSports} disabled={!website.trim() || sportsLoading}>
				{#if sportsLoading}
					<Spinner size="sm" />
				{/if}
				Find sports
			</Button>
			<div class="w-full space-y-1.5 sm:w-56">
				<Label for="sport-select">Sport</Label>
				<Select.Root type="single" bind:value={selectedSportSlug}>
					<Select.Trigger id="sport-select" class="w-full" disabled={sports.length === 0}>
						{selectedSportTitle}
					</Select.Trigger>
					<Select.Content>
						{#each sports as sport (sport.slug)}
							<Select.Item value={sport.slug}>{sport.title}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<Button onclick={scrapeRoster} disabled={!selectedSportSlug || rosterLoading}>
				{#if rosterLoading}
					<Spinner size="sm" />
				{/if}
				Scrape roster
			</Button>
		</Card.Content>
		{#if sportsError}
			<Card.Footer>
				<p class="flex items-center gap-1.5 text-xs text-destructive">
					<CircleAlert class="size-3.5" />
					{sportsError}
				</p>
			</Card.Footer>
		{/if}
	</Card.Root>

	{#if rosterLoading}
		<Card.Root>
			<NonIdealState icon={Users} title="Scraping roster…" description="This can take a few seconds." />
		</Card.Root>
	{:else if rosterError}
		<Card.Root>
			<NonIdealState icon={CircleAlert} title="Couldn't fetch roster" description={rosterError} />
		</Card.Root>
	{:else if roster}
		<Card.Root>
			<Card.Header>
				<Card.Title>{roster.title ?? "Roster"}</Card.Title>
				<Card.Description>
					{roster.schoolHost} · {selectedSportTitle}{roster.season ? ` · ${roster.season}` : ""} · {roster.players
						.length} players
				</Card.Description>
				<Card.Action>
					<Button
						variant="outline"
						onclick={saveRosterCsv}
						disabled={roster.players.length === 0 || savingCsv}
					>
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
			<Card.Content>
				{#if roster.players.length === 0}
					<NonIdealState icon={Users} title="No players found" description="This roster page had no players listed." />
				{:else}
					<div class="overflow-x-auto">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>#</Table.Head>
									<Table.Head>Name</Table.Head>
									<Table.Head>Position</Table.Head>
									<Table.Head>Year</Table.Head>
									<Table.Head>Height</Table.Head>
									<Table.Head>Hometown</Table.Head>
									<Table.Head>High school</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each roster.players as player (player.fullName + (player.jerseyNumber ?? ""))}
									<Table.Row>
										<Table.Cell>{player.jerseyNumber ?? "—"}</Table.Cell>
										<Table.Cell class="font-medium">{player.fullName}</Table.Cell>
										<Table.Cell>{player.position ?? "—"}</Table.Cell>
										<Table.Cell>{player.academicYear ?? "—"}</Table.Cell>
										<Table.Cell>{player.height ?? "—"}</Table.Cell>
										<Table.Cell>{player.hometown ?? "—"}</Table.Cell>
										<Table.Cell>{player.highSchool ?? "—"}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}
</div>
