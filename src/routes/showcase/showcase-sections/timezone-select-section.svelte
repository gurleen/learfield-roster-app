<script lang="ts">
	import { TimezoneSelect } from "$lib/components/ui/timezone-select/index.js";

	let timezone = $state("America/New_York");
</script>

<section id="timezone-select" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Timezone Select</h2>
	<div class="flex flex-wrap items-center gap-3">
		<TimezoneSelect bind:value={timezone} class="w-64" />
		<span class="text-xs text-muted-foreground">Selected: {timezone || "(none)"}</span>
	</div>
</section>
