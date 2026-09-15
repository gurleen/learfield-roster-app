<script lang="ts" generics="T = unknown">
	import { ChevronRight } from "@lucide/svelte";
	import { cn } from "$lib/utils.js";
	import { Icon } from "$lib/components/ui/icon/index.js";
	import type { TreeNodeData, TreeNodeEventHandler } from "./tree.svelte";
	import TreeNodeRow from "./tree-node.svelte";

	let {
		node,
		path,
		depth,
		onNodeClick,
		onNodeDoubleClick,
		onNodeExpand,
		onNodeCollapse,
		onNodeContextMenu,
	}: {
		node: TreeNodeData<T>;
		path: number[];
		depth: number;
		onNodeClick?: TreeNodeEventHandler<T>;
		onNodeDoubleClick?: TreeNodeEventHandler<T>;
		onNodeExpand?: TreeNodeEventHandler<T>;
		onNodeCollapse?: TreeNodeEventHandler<T>;
		onNodeContextMenu?: TreeNodeEventHandler<T>;
	} = $props();

	const hasChildren = $derived(!!node.childNodes && node.childNodes.length > 0);
	const showCaret = $derived(node.hasCaret ?? hasChildren);
	const isExpanded = $derived(showCaret && node.isExpanded);

	function toggleCaret(event: MouseEvent) {
		event.stopPropagation();
		if (!showCaret || node.disabled) return;
		if (node.isExpanded) {
			onNodeCollapse?.(node, path);
		} else {
			onNodeExpand?.(node, path);
		}
	}

	function handleClick() {
		if (node.disabled) return;
		onNodeClick?.(node, path);
	}

	function handleDoubleClick() {
		if (node.disabled) return;
		onNodeDoubleClick?.(node, path);
	}

	function handleContextMenu(event: MouseEvent) {
		if (node.disabled) return;
		onNodeContextMenu?.(node, path);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (node.disabled) return;
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onNodeClick?.(node, path);
		} else if (event.key === "ArrowRight" && showCaret && !node.isExpanded) {
			event.preventDefault();
			onNodeExpand?.(node, path);
		} else if (event.key === "ArrowLeft" && showCaret && node.isExpanded) {
			event.preventDefault();
			onNodeCollapse?.(node, path);
		}
	}
</script>

<li data-slot="tree-node" role="treeitem" aria-expanded={showCaret ? isExpanded : undefined} aria-selected={node.isSelected}>
	<div
		data-slot="tree-node-content"
		role="button"
		tabindex={node.disabled ? -1 : 0}
		aria-disabled={node.disabled}
		style={`padding-inline-start: calc(var(--spacing) * ${4 + depth * 5})`}
		class={cn(
			"flex h-6 cursor-pointer select-none items-center gap-1.5 rounded-none pr-2 text-xs transition-colors",
			node.isSelected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted",
			node.disabled && "pointer-events-none cursor-not-allowed opacity-50",
		)}
		onclick={handleClick}
		ondblclick={handleDoubleClick}
		oncontextmenu={handleContextMenu}
		onkeydown={handleKeydown}
	>
		<button
			type="button"
			tabindex={-1}
			aria-hidden={!showCaret}
			data-slot="tree-node-caret"
			class={cn(
				"flex size-4 shrink-0 items-center justify-center text-muted-foreground transition-transform",
				showCaret ? "visible" : "invisible",
				isExpanded && "rotate-90",
			)}
			onclick={toggleCaret}
		>
			<ChevronRight class="size-3.5" />
		</button>

		{#if node.icon}
			<Icon icon={node.icon} intent={node.isSelected ? "primary" : "muted"} class="shrink-0" />
		{/if}

		<span data-slot="tree-node-label" class="min-w-0 flex-1 truncate">{node.label}</span>

		{#if node.secondaryLabel}
			<span data-slot="tree-node-secondary-label" class="shrink-0 text-muted-foreground">{node.secondaryLabel}</span>
		{/if}
	</div>

	{#if hasChildren && isExpanded}
		<ul data-slot="tree-node-children" role="group">
			{#each node.childNodes ?? [] as child, index (child.id)}
				<TreeNodeRow
					node={child}
					path={[...path, index]}
					depth={depth + 1}
					{onNodeClick}
					{onNodeDoubleClick}
					{onNodeExpand}
					{onNodeCollapse}
					{onNodeContextMenu}
				/>
			{/each}
		</ul>
	{/if}
</li>
