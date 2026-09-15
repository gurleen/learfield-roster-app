<script lang="ts">
	import * as Select from "$lib/components/ui/select/index.js";

	const fruit = ["Apple", "Banana", "Cherry"];
	let selectedFruit = $state("Apple");
</script>

<section id="select" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Select</h2>
	<Select.Root type="single" bind:value={selectedFruit}>
		<Select.Trigger class="w-48">
			{selectedFruit}
		</Select.Trigger>
		<Select.Content>
			{#each fruit as item (item)}
				<Select.Item value={item}>{item}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</section>
