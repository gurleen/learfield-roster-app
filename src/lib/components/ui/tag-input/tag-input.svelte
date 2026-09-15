<script lang="ts">
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import XIcon from "@lucide/svelte/icons/x";
	import type { HTMLInputAttributes } from "svelte/elements";

	type Props = WithElementRef<Omit<HTMLInputAttributes, "type" | "value">> & {
		values?: string[];
		placeholder?: string;
	};

	let {
		ref = $bindable(null),
		values = $bindable<string[]>([]),
		placeholder = "Add tag...",
		class: className,
		disabled,
		...restProps
	}: Props = $props();

	let draft = $state("");

	function commit() {
		const tag = draft.trim();
		if (tag && !values.includes(tag)) {
			values = [...values, tag];
		}
		draft = "";
	}

	function removeAt(index: number) {
		values = values.filter((_, i) => i !== index);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Enter" || event.key === ",") {
			event.preventDefault();
			commit();
		} else if (event.key === "Backspace" && draft === "" && values.length > 0) {
			removeAt(values.length - 1);
		}
	}
</script>

<div
	data-slot="tag-input"
	class={cn(
		"flex min-h-8 w-full flex-wrap items-center gap-1 rounded-none border border-input bg-transparent px-1.5 py-1 transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50 has-disabled:opacity-50",
		className
	)}
>
	{#each values as tag, index (tag)}
		<Badge variant="secondary" class="gap-1 pr-1">
			{tag}
			<button
				type="button"
				data-slot="tag-input-remove"
				aria-label={`Remove ${tag}`}
				{disabled}
				onclick={() => removeAt(index)}
				class="ml-0.5 flex items-center justify-center rounded-none hover:text-destructive disabled:pointer-events-none"
			>
				<XIcon class="size-3" />
			</button>
		</Badge>
	{/each}
	<input
		bind:this={ref}
		bind:value={draft}
		data-slot="tag-input-field"
		type="text"
		{disabled}
		{placeholder}
		onkeydown={handleKeydown}
		onblur={commit}
		class="h-6 min-w-24 grow border-0 bg-transparent px-1 text-xs text-foreground outline-none placeholder:text-muted-foreground disabled:pointer-events-none"
		{...restProps}
	/>
</div>
