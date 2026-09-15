<script lang="ts" module>
	import type { LucideIcon } from "@lucide/svelte";

	export type TreeNodeData<T = unknown> = {
		id: string;
		label: string;
		icon?: LucideIcon;
		secondaryLabel?: string;
		disabled?: boolean;
		hasCaret?: boolean;
		isExpanded?: boolean;
		isSelected?: boolean;
		childNodes?: TreeNodeData<T>[];
		data?: T;
	};

	export type TreeNodeEventHandler<T = unknown> = (
		node: TreeNodeData<T>,
		path: number[],
	) => void;
</script>

<script lang="ts" generics="T = unknown">
	import { cn } from "$lib/utils.js";
	import TreeNodeRow from "./tree-node.svelte";

	let {
		contents = $bindable([]),
		class: className,
		onNodeClick,
		onNodeDoubleClick,
		onNodeExpand,
		onNodeCollapse,
		onNodeContextMenu,
		...restProps
	}: {
		contents: TreeNodeData<T>[];
		class?: string;
		onNodeClick?: TreeNodeEventHandler<T>;
		onNodeDoubleClick?: TreeNodeEventHandler<T>;
		onNodeExpand?: TreeNodeEventHandler<T>;
		onNodeCollapse?: TreeNodeEventHandler<T>;
		onNodeContextMenu?: TreeNodeEventHandler<T>;
	} = $props();

	function handleExpand(node: TreeNodeData<T>, path: number[]) {
		node.isExpanded = true;
		onNodeExpand?.(node, path);
	}

	function handleCollapse(node: TreeNodeData<T>, path: number[]) {
		node.isExpanded = false;
		onNodeCollapse?.(node, path);
	}
</script>

<ul data-slot="tree" role="tree" class={cn("min-w-0 text-xs/relaxed text-foreground", className)} {...restProps}>
	{#each contents as node, index (node.id)}
		<TreeNodeRow
			{node}
			path={[index]}
			depth={0}
			{onNodeClick}
			{onNodeDoubleClick}
			{onNodeContextMenu}
			onNodeExpand={handleExpand}
			onNodeCollapse={handleCollapse}
		/>
	{/each}
</ul>
