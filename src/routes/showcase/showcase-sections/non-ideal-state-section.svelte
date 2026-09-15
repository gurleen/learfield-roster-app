<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { NonIdealState } from "$lib/components/ui/non-ideal-state/index.js";
	import { Inbox } from "@lucide/svelte";
</script>

<section id="non-ideal-state" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Non-Ideal State</h2>
	<div class="max-w-sm border border-border">
		<NonIdealState
			icon={Inbox}
			title="No results"
			description="Try adjusting your filters or search terms."
		>
			{#snippet action()}
				<Button variant="outline" size="sm">Clear filters</Button>
			{/snippet}
		</NonIdealState>
	</div>
</section>
