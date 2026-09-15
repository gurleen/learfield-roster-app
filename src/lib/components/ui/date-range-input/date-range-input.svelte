<script lang="ts">
	import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
	import type { DateRange } from "bits-ui";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { RangeCalendar } from "$lib/components/ui/range-calendar/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import { cn } from "$lib/utils.js";

	let {
		value = $bindable<DateRange>({ start: undefined, end: undefined }),
		placeholder = "Pick a date range",
		disabled = false,
		locale = "en-US",
		dateFormatOptions = { dateStyle: "medium" },
		class: className,
	}: {
		value?: DateRange;
		placeholder?: string;
		disabled?: boolean;
		locale?: string;
		dateFormatOptions?: Intl.DateTimeFormatOptions;
		class?: string;
	} = $props();

	let open = $state(false);

	const formatter = $derived(new DateFormatter(locale, dateFormatOptions));
	const formatted = $derived.by(() => {
		if (!value.start) return undefined;
		const start = formatter.format(value.start.toDate(getLocalTimeZone()));
		if (!value.end) return start;
		const end = formatter.format(value.end.toDate(getLocalTimeZone()));
		return `${start} – ${end}`;
	});
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				{disabled}
				data-slot="date-range-input-trigger"
				class={cn("w-full justify-start gap-2 font-normal", !formatted && "text-muted-foreground", className)}
			>
				<CalendarIcon class="size-4 shrink-0" />
				{formatted ?? placeholder}
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0" data-slot="date-range-input-content">
		<RangeCalendar bind:value {locale} numberOfMonths={2} class="rounded-none border-0 bg-transparent" />
	</Popover.Content>
</Popover.Root>
