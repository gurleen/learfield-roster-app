<script lang="ts" module>
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type NavbarHeadingProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		class: className,
		ref = $bindable(null),
		children,
		...restProps
	}: NavbarHeadingProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="navbar-heading"
	class={cn('blueprint-navbar-heading mr-4 shrink-0 text-[16px] font-semibold', className)}
	{...restProps}
>
	{@render children?.()}
</div>
