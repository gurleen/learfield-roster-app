<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	export const buttonVariants = tv({
		base: "blueprint-button group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-[4px] text-[14px] font-normal leading-[1.28581] align-middle outline-none select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		variants: {
			variant: {
				default: 'blueprint-button-primary',
				outline: 'blueprint-button-outline',
				secondary: 'blueprint-button-neutral',
				ghost: 'blueprint-button-minimal',
				destructive: 'blueprint-button-danger',
				success: 'blueprint-button-success',
				warning: 'blueprint-button-warning',
				link: 'blueprint-button-link'
			},
			size: {
				default: 'min-h-[30px] min-w-[30px] px-2 py-1',
				xs: 'min-h-5 min-w-5 px-1.5 py-0 text-xs',
				sm: 'min-h-6 min-w-6 px-2 py-0',
				lg: 'min-h-10 min-w-10 px-4 py-1 text-base',
				icon: 'size-[30px] p-0',
				'icon-xs': 'size-5 p-0',
				'icon-sm': 'size-6 p-0',
				'icon-lg': "size-10 p-0 [&_svg:not([class*='size-'])]:size-5"
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = 'default',
		size = 'default',
		ref = $bindable(null),
		href = undefined,
		type = 'button',
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? 'link' : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
