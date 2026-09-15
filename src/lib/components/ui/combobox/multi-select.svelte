<script lang="ts">
	import * as Popover from "$lib/components/ui/popover/index.js";
	import * as Command from "$lib/components/ui/command/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
	import XIcon from "@lucide/svelte/icons/x";
	import { cn } from "$lib/utils.js";
	import type { ComboboxOption } from "./combobox.svelte";

	let {
		options,
		value = $bindable([]),
		placeholder = "Select options...",
		searchPlaceholder = "Search...",
		emptyText = "No results found.",
		disabled = false,
		class: className,
	}: {
		options: ComboboxOption[];
		value?: string[];
		placeholder?: string;
		searchPlaceholder?: string;
		emptyText?: string;
		disabled?: boolean;
		class?: string;
	} = $props();

	let open = $state(false);

	const selectedOptions = $derived(options.filter((option) => value.includes(option.value)));

	function toggle(optionValue: string) {
		value = value.includes(optionValue)
			? value.filter((v) => v !== optionValue)
			: [...value, optionValue];
	}

	function remove(optionValue: string, event: MouseEvent) {
		event.stopPropagation();
		value = value.filter((v) => v !== optionValue);
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
				class={cn("h-auto min-h-8 w-full justify-between font-normal", className)}
			>
				<span class="flex flex-1 flex-wrap items-center gap-1">
					{#if selectedOptions.length === 0}
						<span class="text-muted-foreground">{placeholder}</span>
					{:else}
						{#each selectedOptions as option (option.value)}
							<Badge variant="secondary" class="gap-1">
								{option.label}
								<button
									type="button"
									class="rounded-none opacity-70 hover:opacity-100"
									onclick={(event) => remove(option.value, event)}
								>
									<XIcon class="size-3" />
									<span class="sr-only">Remove {option.label}</span>
								</button>
							</Badge>
						{/each}
					{/if}
				</span>
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
							data-checked={value.includes(option.value)}
							onSelect={() => toggle(option.value)}
						>
							{option.label}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
