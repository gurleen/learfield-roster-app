<script lang="ts">
	import { Label } from "$lib/components/ui/label/index.js";
	import { DatePicker } from "$lib/components/ui/date-picker/index.js";
	import { DateInput } from "$lib/components/ui/date-input/index.js";
	import { DateRangeInput } from "$lib/components/ui/date-range-input/index.js";
	import { NumericInput } from "$lib/components/ui/numeric-input/index.js";
	import { TagInput } from "$lib/components/ui/tag-input/index.js";

	let dateInputValue = $state<import("@internationalized/date").DateValue | undefined>(undefined);
	let dateRangeValue = $state<import("bits-ui").DateRange>({ start: undefined, end: undefined });
	let numericValue = $state<number | undefined>(5);
	let tagValues = $state<string[]>(["svelte", "bun"]);
</script>

<section id="date-numeric-tag" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Date, Numeric &amp; Tag Input</h2>
	<div class="flex flex-wrap items-start gap-6">
		<div class="grid w-56 gap-1.5">
			<Label for="date-input">Date input</Label>
			<DateInput bind:value={dateInputValue} />
		</div>

		<div class="grid w-72 gap-1.5">
			<Label for="date-range-input">Date range input</Label>
			<DateRangeInput bind:value={dateRangeValue} />
		</div>

		<div class="grid gap-1.5">
			<Label for="numeric-input">Numeric input</Label>
			<NumericInput id="numeric-input" bind:value={numericValue} min={0} max={10} />
		</div>

		<div class="grid w-64 gap-1.5">
			<Label for="tag-input">Tag input</Label>
			<TagInput id="tag-input" bind:values={tagValues} />
		</div>
	</div>

	<div class="grid w-fit gap-1.5">
		<Label>Date picker</Label>
		<DatePicker type="single" />
	</div>
</section>
