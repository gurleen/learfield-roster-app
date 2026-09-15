<script lang="ts" module>
	import type { ComboboxOption } from "$lib/components/ui/combobox/combobox.svelte";

	function offsetMinutes(timeZone: string, at: Date): number {
		const parts = new Intl.DateTimeFormat("en-US", {
			timeZone,
			hourCycle: "h23",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		}).formatToParts(at);
		const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
		const asUtc = Date.UTC(
			Number(lookup.year),
			Number(lookup.month) - 1,
			Number(lookup.day),
			Number(lookup.hour),
			Number(lookup.minute),
			Number(lookup.second)
		);
		return Math.round((asUtc - at.getTime()) / 60_000);
	}

	function formatOffset(minutes: number): string {
		const sign = minutes < 0 ? "-" : "+";
		const abs = Math.abs(minutes);
		const hours = String(Math.floor(abs / 60)).padStart(2, "0");
		const mins = String(abs % 60).padStart(2, "0");
		return `UTC${sign}${hours}:${mins}`;
	}

	function buildTimezoneOptions(at: Date = new Date()): ComboboxOption[] {
		const zones =
			typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
		return zones
			.map((zone) => {
				const minutes = offsetMinutes(zone, at);
				return {
					value: zone,
					label: `(${formatOffset(minutes)}) ${zone.replace(/_/g, " ")}`,
					minutes,
				};
			})
			.sort((a, b) => a.minutes - b.minutes || a.value.localeCompare(b.value))
			.map(({ value, label }) => ({ value, label }));
	}

	const timezoneOptions = buildTimezoneOptions();
</script>

<script lang="ts">
	import Combobox from "$lib/components/ui/combobox/combobox.svelte";

	let {
		value = $bindable(""),
		placeholder = "Select timezone...",
		searchPlaceholder = "Search timezones...",
		emptyText = "No matching timezone.",
		disabled = false,
		class: className,
	}: {
		value?: string;
		placeholder?: string;
		searchPlaceholder?: string;
		emptyText?: string;
		disabled?: boolean;
		class?: string;
	} = $props();
</script>

<Combobox
	options={timezoneOptions}
	bind:value
	{placeholder}
	{searchPlaceholder}
	{emptyText}
	{disabled}
	class={className}
/>
