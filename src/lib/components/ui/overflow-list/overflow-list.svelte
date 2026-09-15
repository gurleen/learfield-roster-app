<script lang="ts" module>
	export type CollapseFrom = "start" | "end";

	function observeWidth(node: HTMLElement, onWidth: (width: number) => void) {
		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry) onWidth(entry.contentRect.width);
		});
		observer.observe(node);
		onWidth(node.getBoundingClientRect().width);
		return {
			destroy() {
				observer.disconnect();
			},
		};
	}
</script>

<script lang="ts" generics="T">
	import { cn } from "$lib/utils.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import * as Menu from "$lib/components/ui/menu/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { MoreHorizontal } from "@lucide/svelte";
	import type { Snippet } from "svelte";

	let {
		items,
		item,
		overflow,
		visibleItemRenderer,
		collapseFrom = "start",
		minVisibleItems = 0,
		gap = 8,
		class: className,
	}: {
		items: T[];
		item: Snippet<[T, number]>;
		overflow?: Snippet<[T[]]>;
		visibleItemRenderer?: Snippet<[T, number]>;
		collapseFrom?: CollapseFrom;
		minVisibleItems?: number;
		gap?: number;
		class?: string;
	} = $props();

	let containerWidth = $state(0);
	let itemWidths = $state<number[]>([]);
	let overflowWidth = $state(48);

	$effect(() => {
		if (itemWidths.length !== items.length) {
			itemWidths = items.map((_, index) => itemWidths[index] ?? 0);
		}
	});

	function setItemWidth(index: number, width: number) {
		if (itemWidths[index] === width) return;
		const next = itemWidths.slice();
		next[index] = width;
		itemWidths = next;
	}

	const layout = $derived.by(() => {
		const n = items.length;
		if (n === 0) return { visibleCount: 0, hiddenCount: 0 };

		const totalWidth = itemWidths.reduce((sum, w) => sum + w, 0) + gap * Math.max(n - 1, 0);
		if (containerWidth === 0 || totalWidth <= containerWidth) {
			return { visibleCount: n, hiddenCount: 0 };
		}

		const widths = collapseFrom === "start" ? itemWidths.slice().reverse() : itemWidths.slice();

		for (let visibleCount = n; visibleCount >= 0; visibleCount--) {
			if (visibleCount <= minVisibleItems) {
				return { visibleCount: Math.min(minVisibleItems, n), hiddenCount: n - Math.min(minVisibleItems, n) };
			}
			const visibleWidth = widths.slice(0, visibleCount).reduce((sum, w) => sum + w, 0);
			const gaps = gap * visibleCount; // visible items + overflow indicator
			if (visibleWidth + gaps + overflowWidth <= containerWidth) {
				return { visibleCount, hiddenCount: n - visibleCount };
			}
		}
		return { visibleCount: Math.min(minVisibleItems, n), hiddenCount: Math.max(n - minVisibleItems, 0) };
	});

	const visibleItems = $derived.by(() => {
		const { visibleCount } = layout;
		if (collapseFrom === "start") {
			return items.slice(items.length - visibleCount).map((value, i) => ({
				value,
				index: items.length - visibleCount + i,
			}));
		}
		return items.slice(0, visibleCount).map((value, i) => ({ value, index: i }));
	});

	const hiddenItems = $derived.by(() => {
		const { hiddenCount } = layout;
		if (hiddenCount === 0) return [];
		return collapseFrom === "start" ? items.slice(0, hiddenCount) : items.slice(items.length - hiddenCount);
	});
</script>

<div
	bind:clientWidth={containerWidth}
	data-slot="overflow-list"
	class={cn("flex min-w-0 items-center overflow-hidden", className)}
	style={`gap: ${gap}px;`}
>
	{#if collapseFrom === "start" && hiddenItems.length > 0}
		<div use:observeWidth={(w) => (overflowWidth = w)} class="shrink-0">
			{#if overflow}
				{@render overflow(hiddenItems)}
			{:else}
				<Popover.Root>
					<Popover.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outline" size="icon-sm">
								<MoreHorizontal />
							</Button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0" align="start">
						<Menu.Root>
							{#each hiddenItems as hiddenItem, index (index)}
								<Menu.Item>{@render item(hiddenItem, index)}</Menu.Item>
							{/each}
						</Menu.Root>
					</Popover.Content>
				</Popover.Root>
			{/if}
		</div>
	{/if}

	{#each visibleItems as entry (entry.index)}
		<div class="min-w-0 shrink-0">
			{@render (visibleItemRenderer ?? item)(entry.value, entry.index)}
		</div>
	{/each}

	{#if collapseFrom === "end" && hiddenItems.length > 0}
		<div use:observeWidth={(w) => (overflowWidth = w)} class="shrink-0">
			{#if overflow}
				{@render overflow(hiddenItems)}
			{:else}
				<Popover.Root>
					<Popover.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outline" size="icon-sm">
								<MoreHorizontal />
							</Button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0" align="end">
						<Menu.Root>
							{#each hiddenItems as hiddenItem, index (index)}
								<Menu.Item>{@render item(hiddenItem, index)}</Menu.Item>
							{/each}
						</Menu.Root>
					</Popover.Content>
				</Popover.Root>
			{/if}
		</div>
	{/if}

	<div
		aria-hidden="true"
		class="pointer-events-none absolute -z-10 flex opacity-0"
		style={`gap: ${gap}px;`}
	>
		{#each items as probeItem, index (index)}
			<div use:observeWidth={(w) => setItemWidth(index, w)} class="shrink-0 whitespace-nowrap">
				{@render item(probeItem, index)}
			</div>
		{/each}
	</div>
</div>
