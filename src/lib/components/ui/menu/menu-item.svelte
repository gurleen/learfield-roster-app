<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		inset,
		variant = "default",
		disabled = false,
		active = false,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLLIElement>> & {
		inset?: boolean;
		variant?: "default" | "destructive";
		disabled?: boolean;
		active?: boolean;
	} = $props();
</script>

<li
	bind:this={ref}
	data-slot="menu-item"
	role="menuitem"
	aria-disabled={disabled}
	data-inset={inset}
	data-variant={variant}
	data-disabled={disabled}
	data-active={active}
	class={cn(
		"group/menu-item relative flex cursor-default items-center gap-2 rounded-none px-2 py-2 text-xs outline-hidden select-none hover:bg-accent hover:text-accent-foreground data-active:bg-accent data-active:text-accent-foreground data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:hover:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</li>
