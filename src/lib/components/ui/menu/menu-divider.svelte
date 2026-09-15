<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLLIElement>> = $props();
</script>

<li
	bind:this={ref}
	data-slot="menu-divider"
	role="separator"
	aria-orientation="horizontal"
	class={cn("-mx-1 my-1 h-px bg-border", className)}
	{...restProps}
></li>
