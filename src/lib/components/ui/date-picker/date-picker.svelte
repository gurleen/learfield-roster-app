<script lang="ts">
	import { Calendar } from "$lib/components/ui/calendar/index.js";
	import { cn } from "$lib/utils.js";
	import type { ComponentProps } from "svelte";

	type Props = ComponentProps<typeof Calendar>;

	let { class: className, type, ...restProps }: Props = $props();
</script>

<Calendar
	type={(type ?? "single") as never}
	data-slot="date-picker"
	class={cn("rounded-none border border-input bg-popover shadow-elevation-1", className)}
	{...restProps}
/>
