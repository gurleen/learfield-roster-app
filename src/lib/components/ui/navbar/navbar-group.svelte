<script lang="ts" module>
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type NavbarGroupAlign = 'left' | 'right';

	export type NavbarGroupProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		align?: NavbarGroupAlign;
	};
</script>

<script lang="ts">
	let {
		class: className,
		align = 'left',
		ref = $bindable(null),
		children,
		...restProps
	}: NavbarGroupProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="navbar-group"
	class={cn(
		'flex h-full items-center gap-2',
		align === 'right' ? 'ml-auto justify-end' : 'justify-start',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
