<script lang="ts" module>
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type NavbarProps = WithElementRef<HTMLAttributes<HTMLElement>>;
</script>

<script lang="ts">
	let { class: className, ref = $bindable(null), children, ...restProps }: NavbarProps = $props();
</script>

<nav
	bind:this={ref}
	data-slot="navbar"
	class={cn('blueprint-navbar flex h-[50px] w-full items-center px-4', className)}
	{...restProps}
>
	{@render children?.()}
</nav>
