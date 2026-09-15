<script lang="ts" module>
	import type { Snippet } from "svelte";

	export type OmnibarItem<T = unknown> = {
		value: string;
		label: string;
		group?: string;
		keywords?: string[];
		shortcut?: string;
		disabled?: boolean;
		icon?: Snippet;
		item?: T;
	};
</script>

<script lang="ts" generics="T = unknown">
	import * as Command from "$lib/components/ui/command/index.js";
	import { cn } from "$lib/utils.js";

	let {
		open = $bindable(false),
		items,
		query = $bindable(""),
		placeholder = "Search…",
		emptyMessage = "No results found.",
		shortcut = "k",
		title = "Command Palette",
		description = "Search for a command to run…",
		class: className,
		onSelect,
	}: {
		open?: boolean;
		items: OmnibarItem<T>[];
		query?: string;
		placeholder?: string;
		emptyMessage?: string;
		/** Key (combined with Cmd/Ctrl) that toggles the Omnibar. Pass `null` to disable the global shortcut. */
		shortcut?: string | null;
		title?: string;
		description?: string;
		class?: string;
		onSelect: (item: OmnibarItem<T>) => void;
	} = $props();

	const groups = $derived.by(() => {
		const byGroup = new Map<string | undefined, OmnibarItem<T>[]>();
		for (const item of items) {
			const list = byGroup.get(item.group) ?? [];
			list.push(item);
			byGroup.set(item.group, list);
		}
		return [...byGroup.entries()];
	});

	function selectItem(item: OmnibarItem<T>) {
		open = false;
		query = "";
		onSelect(item);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!shortcut) return;
		if (event.key.toLowerCase() === shortcut.toLowerCase() && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			open = !open;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<Command.Dialog bind:open bind:value={query} {title} {description} class={cn(className)}>
	<Command.Input {placeholder} />
	<Command.List>
		<Command.Empty>{emptyMessage}</Command.Empty>
		{#each groups as [group, groupItems] (group ?? "_")}
			<Command.Group heading={group}>
				{#each groupItems as item (item.value)}
					<Command.Item
						value={item.value}
						disabled={item.disabled}
						keywords={item.keywords}
						onSelect={() => selectItem(item)}
					>
						{#if item.icon}
							{@render item.icon()}
						{/if}
						{item.label}
						{#if item.shortcut}
							<Command.Shortcut>{item.shortcut}</Command.Shortcut>
						{/if}
					</Command.Item>
				{/each}
			</Command.Group>
		{/each}
	</Command.List>
</Command.Dialog>
