<script lang="ts">
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
</script>

<section id="inputs" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Inputs</h2>
	<div class="grid max-w-sm gap-3">
		<div class="grid gap-1.5">
			<Label for="email">Email</Label>
			<Input id="email" type="email" placeholder="you@example.com" />
		</div>
		<div class="grid gap-1.5">
			<Label for="disabled-input">Disabled</Label>
			<Input id="disabled-input" placeholder="Disabled" disabled />
		</div>
		<div class="grid gap-1.5">
			<Label for="invalid-input">Invalid</Label>
			<Input id="invalid-input" aria-invalid="true" value="bad value" />
		</div>
	</div>
</section>
