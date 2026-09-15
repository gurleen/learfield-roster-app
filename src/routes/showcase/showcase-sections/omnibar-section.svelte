<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Omnibar, type OmnibarItem } from "$lib/components/ui/omnibar/index.js";
	import * as Command from "$lib/components/ui/command/index.js";
	import { Search } from "@lucide/svelte";

	let omnibarOpen = $state(false);
	let omnibarSelection = $state<string | undefined>(undefined);
	const omnibarItems: OmnibarItem[] = [
		{ value: "new-file", label: "New File", group: "Actions", shortcut: "⌘N" },
		{ value: "search", label: "Search Everywhere", group: "Actions", shortcut: "⌘⇧F" },
		{ value: "settings", label: "Open Settings", group: "Actions", shortcut: "⌘," },
		{ value: "jane-doe", label: "Jane Doe", group: "People", keywords: ["engineering"] },
		{ value: "john-smith", label: "John Smith", group: "People", keywords: ["design"] },
	];
</script>

<section id="omnibar" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Omnibar</h2>
	<div class="flex flex-wrap items-center gap-3">
		<Button variant="outline" onclick={() => (omnibarOpen = true)}>
			<Search />
			Open Omnibar
			<Command.Shortcut>⌘K</Command.Shortcut>
		</Button>
		{#if omnibarSelection}
			<span class="text-xs text-muted-foreground">Selected: {omnibarSelection}</span>
		{/if}
	</div>
	<Omnibar
		bind:open={omnibarOpen}
		items={omnibarItems}
		placeholder="Type a command or search…"
		onSelect={(item) => (omnibarSelection = item.label)}
	/>
</section>
