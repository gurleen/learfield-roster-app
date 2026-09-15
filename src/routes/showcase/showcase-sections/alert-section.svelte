<script lang="ts">
	import * as Alert from "$lib/components/ui/alert/index.js";
</script>

<section id="alert" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Alert</h2>
	<div class="grid max-w-sm gap-3">
		<Alert.Root>
			<Alert.Title>Heads up</Alert.Title>
			<Alert.Description>This is a default callout.</Alert.Description>
		</Alert.Root>
		<Alert.Root variant="destructive">
			<Alert.Title>Something went wrong</Alert.Title>
			<Alert.Description>This is a tinted destructive callout.</Alert.Description>
		</Alert.Root>
	</div>
</section>
