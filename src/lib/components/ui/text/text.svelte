<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		as = "div",
		ellipsize = false,
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		as?: "div" | "span" | "p";
		ellipsize?: boolean;
	} = $props();
</script>

<svelte:element
	this={as}
	bind:this={ref}
	data-slot="text"
	class={cn("text-xs/relaxed text-foreground", ellipsize && "overflow-hidden text-ellipsis whitespace-nowrap", className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
