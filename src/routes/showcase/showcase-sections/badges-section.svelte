<script lang="ts">
	import { Badge } from "$lib/components/ui/badge/index.js";
</script>

<section id="badges" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Badges</h2>
	<div class="flex flex-wrap gap-2">
		<Badge variant="default">Default</Badge>
		<Badge variant="secondary">Secondary</Badge>
		<Badge variant="outline">Outline</Badge>
		<Badge variant="destructive">Destructive</Badge>
		<Badge variant="success">Success</Badge>
		<Badge variant="warning">Warning</Badge>
	</div>
</section>
