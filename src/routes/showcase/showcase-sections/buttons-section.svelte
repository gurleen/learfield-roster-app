<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
</script>

<section id="buttons" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Buttons</h2>
	<div class="flex flex-wrap gap-2">
		<Button variant="default">Default</Button>
		<Button variant="outline">Outline</Button>
		<Button variant="secondary">Secondary</Button>
		<Button variant="ghost">Ghost</Button>
		<Button variant="destructive">Destructive</Button>
		<Button variant="success">Success</Button>
		<Button variant="warning">Warning</Button>
		<Button variant="link">Link</Button>
	</div>
	<div class="flex flex-wrap items-center gap-2">
		<Button size="xs">Extra small</Button>
		<Button size="sm">Small</Button>
		<Button size="default">Default</Button>
		<Button size="lg">Large</Button>
		<Button disabled>Disabled</Button>
	</div>
</section>
