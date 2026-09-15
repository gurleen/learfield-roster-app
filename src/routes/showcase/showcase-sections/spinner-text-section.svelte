<script lang="ts">
	import { Spinner } from "$lib/components/ui/spinner/index.js";
	import { Text } from "$lib/components/ui/text/index.js";
</script>

<section id="spinner-text" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Spinner &amp; Text</h2>
	<div class="flex flex-wrap items-center gap-6">
		<Spinner size="sm" />
		<Spinner size="default" />
		<Spinner size="lg" />
	</div>
	<div class="max-w-xs space-y-1">
		<Text as="p">Regular paragraph text using the Text component.</Text>
		<Text as="span" ellipsize class="block w-40 border border-border p-1">
			This is a long line of text that should be truncated with an ellipsis.
		</Text>
	</div>
</section>
