<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { ChevronLeft } from "@lucide/svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		title,
		onBack,
		showHeader = true,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		title?: string;
		onBack?: () => void;
		showHeader?: boolean;
		children?: Snippet;
	} = $props();
</script>

<div bind:this={ref} data-slot="panel" class={cn("flex min-h-0 flex-1 flex-col", className)} {...restProps}>
	{#if showHeader}
		<div data-slot="panel-header" class="flex min-h-9 shrink-0 items-center gap-1 border-b border-border px-1">
			{#if onBack}
				<Button variant="ghost" size="icon-sm" onclick={onBack} aria-label="Back">
					<ChevronLeft />
				</Button>
			{/if}
			{#if title}
				<span class="truncate px-1 text-sm font-semibold">{title}</span>
			{/if}
		</div>
	{/if}
	<div data-slot="panel-body" class="min-h-0 flex-1 overflow-auto p-3">
		{@render children?.()}
	</div>
</div>
