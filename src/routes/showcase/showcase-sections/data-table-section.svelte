<script lang="ts">
	import { DataTable } from "$lib/components/ui/data-table/index.js";
	import type { DataTableColumnDef } from "$lib/components/ui/data-table/features.js";

	type Invoice = {
		id: string;
		status: "Paid" | "Pending" | "Overdue";
		amount: number;
		customer: string;
	};

	const invoices: Invoice[] = [
		{ id: "INV001", status: "Paid", amount: 250, customer: "Acme Corp" },
		{ id: "INV002", status: "Pending", amount: 150, customer: "Globex" },
		{ id: "INV003", status: "Overdue", amount: 350, customer: "Initech" },
		{ id: "INV004", status: "Paid", amount: 450, customer: "Umbrella" },
		{ id: "INV005", status: "Pending", amount: 550, customer: "Soylent" },
		{ id: "INV006", status: "Paid", amount: 200, customer: "Stark Industries" },
		{ id: "INV007", status: "Overdue", amount: 300, customer: "Wayne Enterprises" },
		{ id: "INV008", status: "Paid", amount: 175, customer: "Wonka Industries" },
		{ id: "INV009", status: "Pending", amount: 620, customer: "Hooli" },
		{ id: "INV010", status: "Paid", amount: 95, customer: "Cyberdyne" },
		{ id: "INV011", status: "Overdue", amount: 410, customer: "Aperture Science" },
		{ id: "INV012", status: "Paid", amount: 280, customer: "Massive Dynamic" },
	];

	const columns: DataTableColumnDef<Invoice, any>[] = [
		{ accessorKey: "id", header: "Invoice" },
		{ accessorKey: "customer", header: "Customer" },
		{ accessorKey: "status", header: "Status" },
		{
			accessorKey: "amount",
			header: "Amount",
			cell: (context) => `$${context.getValue<number>().toFixed(2)}`,
		},
	];
</script>

<section id="data-table" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Data Table</h2>
	<p class="text-xs text-muted-foreground">
		Built on TanStack Table. Click a column header to sort; paginate with the controls below.
	</p>
	<DataTable {columns} data={invoices} pageSize={5} />
</section>
