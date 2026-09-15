<script lang="ts">
	import * as Table from "$lib/components/ui/table/index.js";

	const invoices = [
		{ id: "INV001", status: "Paid", amount: "$250.00" },
		{ id: "INV002", status: "Pending", amount: "$150.00" },
		{ id: "INV003", status: "Overdue", amount: "$350.00" },
	];
</script>

<section id="table" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Table</h2>
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Invoice</Table.Head>
				<Table.Head>Status</Table.Head>
				<Table.Head class="text-right">Amount</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each invoices as invoice (invoice.id)}
				<Table.Row>
					<Table.Cell>{invoice.id}</Table.Cell>
					<Table.Cell>{invoice.status}</Table.Cell>
					<Table.Cell class="text-right">{invoice.amount}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</section>
