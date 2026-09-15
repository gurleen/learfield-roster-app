<script lang="ts">
	import { DateFormatter, getLocalTimeZone, type DateValue } from "@internationalized/date";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { Calendar } from "$lib/components/ui/calendar/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import { cn } from "$lib/utils.js";

	let {
		value = $bindable<DateValue | undefined>(undefined),
		placeholder = "Pick a date",
		disabled = false,
		locale = "en-US",
		dateFormatOptions = { dateStyle: "long" },
		class: className,
	}: {
		value?: DateValue | undefined;
		placeholder?: string;
		disabled?: boolean;
		locale?: string;
		dateFormatOptions?: Intl.DateTimeFormatOptions;
		class?: string;
	} = $props();

	let open = $state(false);

	const formatter = $derived(new DateFormatter(locale, dateFormatOptions));
	const formatted = $derived(value ? formatter.format(value.toDate(getLocalTimeZone())) : undefined);

	function handleSelect() {
		open = false;
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				{disabled}
				data-slot="date-input-trigger"
				class={cn("w-full justify-start gap-2 font-normal", !formatted && "text-muted-foreground", className)}
			>
				<CalendarIcon class="size-4 shrink-0" />
				{formatted ?? placeholder}
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0" data-slot="date-input-content">
		<Calendar
			type="single"
			bind:value
			{locale}
			onValueChange={handleSelect}
			class="rounded-none border-0 bg-transparent"
		/>
	</Popover.Content>
</Popover.Root>
