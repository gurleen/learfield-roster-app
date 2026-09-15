<script lang="ts">
	import { OverflowList } from "$lib/components/ui/overflow-list/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";

	const tags = [
		"engineering",
		"design",
		"product",
		"marketing",
		"sales",
		"support",
		"finance",
		"legal",
		"operations",
		"security",
	];
</script>

<section id="overflow-list" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Overflow List</h2>
	<p class="text-xs text-muted-foreground">
		Drag the bottom-right corner of the box to resize it and watch tags collapse into the
		overflow menu.
	</p>
	<div class="flex flex-col gap-4">
		<div>
			<p class="mb-1 text-xs text-muted-foreground">collapseFrom="end" (resizable)</p>
			<div class="w-full max-w-full resize-x overflow-hidden rounded-none border border-border p-2" style="width: 420px;">
				<OverflowList items={tags} collapseFrom="end" minVisibleItems={1}>
					{#snippet item(tag)}
						<Badge variant="secondary">{tag}</Badge>
					{/snippet}
				</OverflowList>
			</div>
		</div>
		<div>
			<p class="mb-1 text-xs text-muted-foreground">collapseFrom="start" (resizable)</p>
			<div class="w-full max-w-full resize-x overflow-hidden rounded-none border border-border p-2" style="width: 420px;">
				<OverflowList items={tags} collapseFrom="start" minVisibleItems={1}>
					{#snippet item(tag)}
						<Badge variant="secondary">{tag}</Badge>
					{/snippet}
				</OverflowList>
			</div>
		</div>
	</div>
</section>
