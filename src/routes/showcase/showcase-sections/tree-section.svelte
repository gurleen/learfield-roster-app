<script lang="ts">
	import { Folder, FolderOpen, File } from "@lucide/svelte";
	import { Tree, type TreeNodeData } from "$lib/components/ui/tree/index.js";

	let contents = $state<TreeNodeData[]>([
		{
			id: "src",
			label: "src",
			icon: Folder,
			isExpanded: true,
			childNodes: [
				{
					id: "lib",
					label: "lib",
					icon: Folder,
					isExpanded: true,
					childNodes: [
						{ id: "utils.ts", label: "utils.ts", icon: File, secondaryLabel: "1 KB" },
						{ id: "components", label: "components", icon: Folder, childNodes: [
							{ id: "button.svelte", label: "button.svelte", icon: File },
							{ id: "tree.svelte", label: "tree.svelte", icon: File },
						] },
					],
				},
				{ id: "app.html", label: "app.html", icon: File, secondaryLabel: "512 B" },
			],
		},
		{ id: "readme", label: "README.md", icon: File, secondaryLabel: "2 KB" },
		{ id: "locked", label: "node_modules", icon: Folder, disabled: true, childNodes: [{ id: "x", label: "unreachable" }] },
	]);

	function updateNodeIcon(node: TreeNodeData) {
		if (node.childNodes) {
			node.icon = node.isExpanded ? FolderOpen : Folder;
		}
	}

	function handleExpand(node: TreeNodeData) {
		updateNodeIcon(node);
	}

	function handleCollapse(node: TreeNodeData) {
		updateNodeIcon(node);
	}

	function handleClick(node: TreeNodeData) {
		for (const top of contents) {
			deselectAll(top);
		}
		node.isSelected = true;
		contents = [...contents];
	}

	function deselectAll(node: TreeNodeData) {
		node.isSelected = false;
		node.childNodes?.forEach(deselectAll);
	}
</script>

<section id="tree" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Tree</h2>
	<p class="text-xs text-muted-foreground">
		Click a row to select it, click the caret (or a row's own caret) to expand/collapse.
	</p>
	<div class="w-full max-w-sm rounded-none border border-border bg-card p-2 shadow-elevation-1">
		<Tree bind:contents onNodeExpand={handleExpand} onNodeCollapse={handleCollapse} onNodeClick={handleClick} />
	</div>
</section>
