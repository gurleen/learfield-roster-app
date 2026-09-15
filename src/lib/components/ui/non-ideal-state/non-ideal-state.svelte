<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { Icon, type IconSize } from "$lib/components/ui/icon/index.js";
	import type { LucideIcon } from "@lucide/svelte";
	import type { Snippet } from "svelte";

	let {
		icon,
		title,
		description,
		action,
		layout = "vertical",
		class: className,
		...restProps
	}: {
		icon?: LucideIcon;
		title?: string;
		description?: string;
		action?: Snippet;
		layout?: "vertical" | "horizontal";
		class?: string;
	} & Record<string, unknown> = $props();

	const iconSize: IconSize = "large";
</script>

<div
	data-slot="non-ideal-state"
	class={cn(
		"flex items-center justify-center gap-4 p-8 text-center",
		layout === "vertical" ? "flex-col" : "flex-row text-left",
		className,
	)}
	{...restProps}
>
	{#if icon}
		<Icon {icon} intent="muted" size={iconSize} class="size-10 opacity-60" />
	{/if}
	<div class={cn("flex flex-col gap-1", layout === "horizontal" && "items-start")}>
		{#if title}
			<div class="text-sm font-semibold text-foreground">{title}</div>
		{/if}
		{#if description}
			<div class="max-w-xs text-xs text-muted-foreground">{description}</div>
		{/if}
		{#if action}
			<div class="mt-2">
				{@render action()}
			</div>
		{/if}
	</div>
</div>
