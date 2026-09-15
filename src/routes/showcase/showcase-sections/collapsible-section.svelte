<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
</script>

<section id="collapsible" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Collapsible</h2>
	<Collapsible.Root class="max-w-sm">
		<Collapsible.Trigger>
			{#snippet child({ props })}
				<Button variant="outline" size="sm" {...props}>Toggle details</Button>
			{/snippet}
		</Collapsible.Trigger>
		<Collapsible.Content class="pt-2 text-xs text-muted-foreground">
			Additional detail revealed by the collapsible.
		</Collapsible.Content>
	</Collapsible.Root>
</section>
