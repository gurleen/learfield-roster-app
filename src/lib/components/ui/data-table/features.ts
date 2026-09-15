import {
	createPaginatedRowModel,
	createSortedRowModel,
	rowPaginationFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_basic,
	sortFn_datetime,
	tableFeatures,
} from "@tanstack/svelte-table";

export const dataTableFeatures = tableFeatures({
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns: {
		alphanumeric: sortFn_alphanumeric,
		basic: sortFn_basic,
		datetime: sortFn_datetime,
	},
	rowPaginationFeature,
	paginatedRowModel: createPaginatedRowModel(),
});

export type DataTableFeatures = typeof dataTableFeatures;
export type DataTableColumnDef<
	TData extends import("@tanstack/svelte-table").RowData,
	TValue = unknown,
> = import("@tanstack/svelte-table").ColumnDef<DataTableFeatures, TData, TValue>;
