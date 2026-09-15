<script lang="ts">
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
</script>

<section id="checkbox-switch" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Checkbox &amp; Switch</h2>
	<div class="flex items-center gap-6">
		<div class="flex items-center gap-2">
			<Checkbox id="terms" />
			<Label for="terms">Accept terms</Label>
		</div>
		<div class="flex items-center gap-2">
			<Switch id="notifications" />
			<Label for="notifications">Notifications</Label>
		</div>
	</div>
</section>
