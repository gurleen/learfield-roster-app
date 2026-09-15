<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Icon } from "$lib/components/ui/icon/index.js";
	import { Search, Settings, Trash2 } from "@lucide/svelte";
</script>

<section id="icon" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Icon &amp; Icon Button</h2>
	<div class="flex flex-wrap items-center gap-4">
		<Icon icon={Search} />
		<Icon icon={Settings} intent="primary" />
		<Icon icon={Trash2} intent="danger" size="large" />
		<Button variant="outline" size="icon" aria-label="Search">
			<Icon icon={Search} />
		</Button>
		<Button variant="ghost" size="icon-sm" aria-label="Settings">
			<Icon icon={Settings} />
		</Button>
		<Button variant="destructive" size="icon-lg" aria-label="Delete">
			<Icon icon={Trash2} />
		</Button>
	</div>
</section>
