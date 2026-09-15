<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		vertical = false,
		fill = false,
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		vertical?: boolean;
		fill?: boolean;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="control-group"
	data-vertical={vertical ? "" : undefined}
	class={cn(
		"blueprint-control-group inline-flex",
		vertical ? "flex-col" : "flex-row",
		fill && "flex w-full",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</div>

<style>
	.blueprint-control-group > :global(*) {
		border-radius: 0;
		position: relative;
		border-color: color-mix(in oklch, var(--border) 55%, transparent) !important;
	}

	.blueprint-control-group > :global(*:focus),
	.blueprint-control-group > :global(*:focus-within) {
		z-index: 1;
	}

	.blueprint-control-group:not([data-vertical]) > :global(* + *) {
		margin-left: -1px;
	}

	.blueprint-control-group:not([data-vertical]) > :global(*:first-child) {
		border-top-left-radius: 4px;
		border-bottom-left-radius: 4px;
	}

	.blueprint-control-group:not([data-vertical]) > :global(*:last-child) {
		border-top-right-radius: 4px;
		border-bottom-right-radius: 4px;
	}

	.blueprint-control-group[data-vertical] > :global(* + *) {
		margin-top: -1px;
	}

	.blueprint-control-group[data-vertical] > :global(*:first-child) {
		border-top-left-radius: 4px;
		border-top-right-radius: 4px;
	}

	.blueprint-control-group[data-vertical] > :global(*:last-child) {
		border-bottom-left-radius: 4px;
		border-bottom-right-radius: 4px;
	}

	.blueprint-control-group.flex.w-full > :global(*) {
		flex: 1 1 auto;
	}
</style>
