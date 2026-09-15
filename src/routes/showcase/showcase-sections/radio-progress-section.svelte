<script lang="ts">
	import { Label } from "$lib/components/ui/label/index.js";
	import { RadioGroup, RadioGroupItem } from "$lib/components/ui/radio-group/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";

	let radioValue = $state("a");
</script>

<section id="radio-progress" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Radio Group &amp; Progress</h2>
	<div class="flex flex-wrap items-start gap-12">
		<RadioGroup bind:value={radioValue}>
			<div class="flex items-center gap-2">
				<RadioGroupItem value="a" id="radio-a" />
				<Label for="radio-a">Option A</Label>
			</div>
			<div class="flex items-center gap-2">
				<RadioGroupItem value="b" id="radio-b" />
				<Label for="radio-b">Option B</Label>
			</div>
		</RadioGroup>
		<Progress value={45} class="w-48" />
	</div>
</section>
