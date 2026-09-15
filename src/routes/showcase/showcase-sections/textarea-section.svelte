<script lang="ts">
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
</script>

<section id="textarea" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Textarea</h2>
	<div class="grid max-w-sm gap-1.5">
		<Label for="message">Message</Label>
		<Textarea id="message" placeholder="Type your message here" />
	</div>
</section>
