<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLUListElement>> = $props();
</script>

<ul
	bind:this={ref}
	data-slot="menu"
	role="menu"
	class={cn(
		"min-w-32 overflow-x-hidden overflow-y-auto rounded-none bg-popover text-popover-foreground shadow-elevation-3",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</ul>
