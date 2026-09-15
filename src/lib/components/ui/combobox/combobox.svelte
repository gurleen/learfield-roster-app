<script lang="ts" module>
	export type ComboboxOption = {
		value: string;
		label: string;
		disabled?: boolean;
	};
</script>

<script lang="ts">
	import * as Popover from "$lib/components/ui/popover/index.js";
	import * as Command from "$lib/components/ui/command/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
	import { cn } from "$lib/utils.js";

	let {
		options,
		value = $bindable(""),
		placeholder = "Select an option...",
		searchPlaceholder = "Search...",
		emptyText = "No results found.",
		disabled = false,
		class: className,
	}: {
		options: ComboboxOption[];
		value?: string;
		placeholder?: string;
		searchPlaceholder?: string;
		emptyText?: string;
		disabled?: boolean;
		class?: string;
	} = $props();

	let open = $state(false);

	const selectedLabel = $derived(options.find((option) => option.value === value)?.label);

	function handleSelect(currentValue: string) {
		value = currentValue === value ? "" : currentValue;
		open = false;
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				role="combobox"
				aria-expanded={open}
				{disabled}
				class={cn("h-8 w-full justify-between font-normal", !selectedLabel && "text-muted-foreground", className)}
			>
				{selectedLabel ?? placeholder}
				<ChevronsUpDownIcon class="ml-2 size-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-(--bits-popover-anchor-width) p-0" data-slot="combobox-content">
		<Command.Root>
			<Command.Input placeholder={searchPlaceholder} />
			<Command.List>
				<Command.Empty>{emptyText}</Command.Empty>
				<Command.Group>
					{#each options as option (option.value)}
						<Command.Item
							value={option.label}
							disabled={option.disabled}
							data-checked={option.value === value}
							onSelect={() => handleSelect(option.value)}
						>
							{option.label}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
