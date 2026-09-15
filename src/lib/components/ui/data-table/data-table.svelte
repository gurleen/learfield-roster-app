<script lang="ts" generics="TData extends RowData">
	import { untrack } from 'svelte';
	import {
		createTable,
		FlexRender,
		type PaginationState,
		type RowData,
		type SortingState,
		type Updater
	} from '@tanstack/svelte-table';
	import { dataTableFeatures, type DataTableColumnDef } from './features.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import './data-table.css';

	let {
		columns,
		data,
		pageSize = 10,
		class: className
	}: {
		columns: DataTableColumnDef<TData, any>[];
		data: TData[];
		pageSize?: number;
		class?: string;
	} = $props();

	const features = dataTableFeatures;

	let sorting = $state<SortingState>([]);
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: untrack(() => pageSize) });

	function updateSorting(updater: Updater<SortingState>) {
		sorting = typeof updater === 'function' ? updater(sorting) : updater;
	}

	function updatePagination(updater: Updater<PaginationState>) {
		pagination = typeof updater === 'function' ? updater(pagination) : updater;
	}

	const table = createTable({
		features,
		get columns() {
			return columns;
		},
		get data() {
			return data;
		},
		state: {
			get sorting() {
				return sorting;
			},
			get pagination() {
				return pagination;
			}
		},
		onSortingChange: updateSorting,
		onPaginationChange: updatePagination,
		autoResetPageIndex: false
	});
</script>

<div class={cn('blueprint-data-table space-y-2', className)}>
	<Table.Root>
		<Table.Header>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row>
					{#each headerGroup.headers as header (header.id)}
						<Table.Head
							colspan={header.colSpan}
							aria-sort={header.column.getIsSorted() === 'asc'
								? 'ascending'
								: header.column.getIsSorted() === 'desc'
									? 'descending'
									: 'none'}
						>
							{#if !header.isPlaceholder}
								{#if header.column.getCanSort()}
									<button
										type="button"
										class="data-table-sort"
										onclick={header.column.getToggleSortingHandler()}
									>
										<FlexRender {header} />
										{#if header.column.getIsSorted() === 'asc'}
											<span aria-hidden="true">▲</span>
										{:else if header.column.getIsSorted() === 'desc'}
											<span aria-hidden="true">▼</span>
										{/if}
									</button>
								{:else}
									<div class="data-table-heading"><FlexRender {header} /></div>
								{/if}
							{/if}
						</Table.Head>
					{/each}
				</Table.Row>
			{/each}
		</Table.Header>
		<Table.Body>
			{#each table.getRowModel().rows as row (row.id)}
				<Table.Row>
					{#each row.getAllCells() as cell (cell.id)}
						<Table.Cell>
							<FlexRender {cell} />
						</Table.Cell>
					{/each}
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell
						colspan={columns.length}
						class="data-table-empty text-center text-muted-foreground"
					>
						No results.
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>

	<div class="flex items-center justify-between">
		<p class="text-xs text-muted-foreground">
			Page {pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
		</p>
		<div class="flex gap-2">
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.previousPage()}
				disabled={!table.getCanPreviousPage()}
			>
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.nextPage()}
				disabled={!table.getCanNextPage()}
			>
				Next
			</Button>
		</div>
	</div>
</div>
