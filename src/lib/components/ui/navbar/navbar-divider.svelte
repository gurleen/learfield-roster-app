<script lang="ts" module>
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type NavbarDividerProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		class: className,
		ref = $bindable(null),
		...restProps
	}: NavbarDividerProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="navbar-divider"
	class={cn('blueprint-navbar-divider mx-2 h-6 w-px shrink-0 border-l', className)}
	{...restProps}
></div>
