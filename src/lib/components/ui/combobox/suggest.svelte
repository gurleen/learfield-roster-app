<script lang="ts">
	import * as Popover from "$lib/components/ui/popover/index.js";
	import * as Command from "$lib/components/ui/command/index.js";
	import { cn } from "$lib/utils.js";
	import type { ComboboxOption } from "./combobox.svelte";

	let {
		options,
		value = $bindable(""),
		placeholder = "Type to search...",
		emptyText = "No matches.",
		disabled = false,
		class: className,
	}: {
		options: ComboboxOption[];
		value?: string;
		placeholder?: string;
		emptyText?: string;
		disabled?: boolean;
		class?: string;
	} = $props();

	let open = $state(false);

	function handleSelect(label: string) {
		value = label;
		open = false;
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger class={cn("block w-full", className)}>
		{#snippet child({ props })}
			<Command.Root class="overflow-visible bg-transparent" shouldFilter={false}>
				<Command.Input
					{...props}
					{placeholder}
					{disabled}
					bind:value
					onfocus={() => (open = true)}
				/>
			</Command.Root>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content
		class="w-(--bits-popover-anchor-width) p-0"
		data-slot="combobox-content"
		onOpenAutoFocus={(event) => event.preventDefault()}
	>
		<Command.Root value={value.toLowerCase()}>
			<Command.List>
				<Command.Empty>{emptyText}</Command.Empty>
				<Command.Group>
					{#each options.filter((option) => option.label
							.toLowerCase()
							.includes(value.toLowerCase())) as option (option.value)}
						<Command.Item
							value={option.label}
							disabled={option.disabled}
							data-checked={option.label === value}
							onSelect={() => handleSelect(option.label)}
						>
							{option.label}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
