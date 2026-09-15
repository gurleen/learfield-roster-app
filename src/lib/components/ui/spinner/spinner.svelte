<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const spinnerVariants = tv({
		base: "animate-spin text-primary",
		variants: {
			size: {
				sm: "size-4",
				default: "size-8",
				lg: "size-12",
			},
		},
		defaultVariants: {
			size: "default",
		},
	});

	export type SpinnerSize = VariantProps<typeof spinnerVariants>["size"];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		size = "default",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & { size?: SpinnerSize } = $props();
</script>

<div
	bind:this={ref}
	data-slot="spinner"
	role="status"
	aria-label="Loading"
	class={cn("inline-flex items-center justify-center", className)}
	{...restProps}
>
	<svg class={spinnerVariants({ size })} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
		<path
			class="opacity-90"
			fill="currentColor"
			d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2Z"
		/>
	</svg>
</div>
