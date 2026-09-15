<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Icon } from "$lib/components/ui/icon/index.js";
	import { ControlGroup } from "$lib/components/ui/control-group/index.js";
	import { Search } from "@lucide/svelte";
</script>

<section id="control-group" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Control Group</h2>
	<div class="flex flex-wrap items-start gap-6">
		<ControlGroup>
			<Button variant="outline">Left</Button>
			<Button variant="outline">Middle</Button>
			<Button variant="outline">Right</Button>
		</ControlGroup>

		<ControlGroup>
			<Button variant="outline" size="icon" aria-label="Search">
				<Icon icon={Search} />
			</Button>
			<Input placeholder="Search…" class="w-48" />
		</ControlGroup>

		<ControlGroup vertical>
			<Button variant="outline">Top</Button>
			<Button variant="outline">Bottom</Button>
		</ControlGroup>
	</div>
</section>
