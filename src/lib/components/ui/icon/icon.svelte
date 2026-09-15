<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";
	import type { LucideIcon, LucideProps } from "@lucide/svelte";

	export const iconVariants = tv({
		base: "shrink-0",
		variants: {
			intent: {
				default: "text-current",
				primary: "text-primary",
				success: "text-success",
				warning: "text-warning",
				danger: "text-destructive",
				muted: "text-muted-foreground",
			},
			size: {
				standard: "size-4",
				large: "size-5",
			},
		},
		defaultVariants: {
			intent: "default",
			size: "standard",
		},
	});

	export type IconIntent = VariantProps<typeof iconVariants>["intent"];
	export type IconSize = VariantProps<typeof iconVariants>["size"];
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";

	let {
		icon,
		intent = "default",
		size = "standard",
		class: className,
		...restProps
	}: {
		icon: LucideIcon;
		intent?: IconIntent;
		size?: IconSize;
	} & Omit<LucideProps, "size"> = $props();

	const IconComponent = $derived(icon);
</script>

<IconComponent
	data-slot="icon"
	class={cn(iconVariants({ intent, size }), className as string | undefined)}
	{...restProps}
/>
