<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import { Text } from "$lib/components/ui/text/index.js";
	import { Icon } from "$lib/components/ui/icon/index.js";
	import {
		Users,
		DollarSign,
		Activity,
		ShoppingCart,
		TrendingUp,
		TrendingDown,
	} from "@lucide/svelte";

	const stats = [
		{
			label: "Total Revenue",
			value: "$48,290",
			change: "+12.4%",
			trend: "up" as const,
			icon: DollarSign,
		},
		{
			label: "Active Users",
			value: "2,318",
			change: "+4.1%",
			trend: "up" as const,
			icon: Users,
		},
		{
			label: "Orders",
			value: "1,204",
			change: "-2.3%",
			trend: "down" as const,
			icon: ShoppingCart,
		},
		{
			label: "Conversion Rate",
			value: "3.42%",
			change: "+0.8%",
			trend: "up" as const,
			icon: Activity,
		},
	];

	const goals = [
		{ label: "Monthly revenue goal", value: 72 },
		{ label: "New signups goal", value: 45 },
		{ label: "Support tickets resolved", value: 91 },
	];

	const orders = [
		{ id: "ORD-1042", customer: "Amara Okafor", status: "Fulfilled", amount: "$129.00" },
		{ id: "ORD-1041", customer: "Liam Chen", status: "Pending", amount: "$74.50" },
		{ id: "ORD-1040", customer: "Priya Nair", status: "Fulfilled", amount: "$212.00" },
		{ id: "ORD-1039", customer: "Diego Ramirez", status: "Cancelled", amount: "$58.00" },
		{ id: "ORD-1038", customer: "Sofia Berg", status: "Fulfilled", amount: "$340.25" },
	];

	function statusVariant(status: string) {
		switch (status) {
			case "Fulfilled":
			case "Paid":
				return "success" as const;
			case "Pending":
				return "warning" as const;
			case "Cancelled":
			case "Overdue":
				return "destructive" as const;
			default:
				return "secondary" as const;
		}
	}

	const invoices = [
		{ id: "INV-2041", customer: "Nia Osei", status: "Paid", date: "2026-09-01", amount: "$250.00" },
		{ id: "INV-2042", customer: "Marcus Lee", status: "Pending", date: "2026-09-03", amount: "$150.00" },
		{ id: "INV-2043", customer: "Elena Petrova", status: "Overdue", date: "2026-08-27", amount: "$350.00" },
		{ id: "INV-2044", customer: "Tariq Farouk", status: "Paid", date: "2026-09-05", amount: "$420.00" },
	];
</script>

<div class="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
	<div>
		<Text class="text-xl font-semibold sm:text-2xl">Dashboard</Text>
		<Text class="text-muted-foreground text-sm">Overview of account activity for the current period.</Text>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each stats as stat (stat.label)}
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Description>{stat.label}</Card.Description>
					<Icon icon={stat.icon} intent="muted" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-semibold">{stat.value}</div>
					<div class="mt-1 flex items-center gap-1 text-xs">
						<Icon
							icon={stat.trend === "up" ? TrendingUp : TrendingDown}
							intent={stat.trend === "up" ? "success" : "danger"}
							size="standard"
						/>
						<span class={stat.trend === "up" ? "text-success" : "text-destructive"}>{stat.change}</span>
						<span class="text-muted-foreground">vs last month</span>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
		<Card.Root class="lg:col-span-2">
			<Card.Header>
				<Card.Title>Recent orders</Card.Title>
				<Card.Description>Latest transactions across all channels.</Card.Description>
			</Card.Header>
			<Card.Content class="overflow-x-auto">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Order</Table.Head>
							<Table.Head>Customer</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head class="text-right">Amount</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each orders as order (order.id)}
							<Table.Row>
								<Table.Cell class="font-medium">{order.id}</Table.Cell>
								<Table.Cell>{order.customer}</Table.Cell>
								<Table.Cell><Badge variant={statusVariant(order.status)}>{order.status}</Badge></Table.Cell>
								<Table.Cell class="text-right">{order.amount}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Goals</Card.Title>
				<Card.Description>Progress toward this month's targets.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				{#each goals as goal (goal.label)}
					<div class="space-y-1.5">
						<div class="flex items-center justify-between text-sm">
							<span>{goal.label}</span>
							<span class="text-muted-foreground">{goal.value}%</span>
						</div>
						<Progress value={goal.value} />
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>Invoices</Card.Title>
			<Card.Description>A list of recent invoices.</Card.Description>
		</Card.Header>
		<Card.Content class="overflow-x-auto">
			<Table.Root>
				<Table.Caption>Showing {invoices.length} of {invoices.length} invoices.</Table.Caption>
				<Table.Header>
					<Table.Row>
						<Table.Head>Invoice</Table.Head>
						<Table.Head>Customer</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Date</Table.Head>
						<Table.Head class="text-right">Amount</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each invoices as invoice (invoice.id)}
						<Table.Row>
							<Table.Cell class="font-medium">{invoice.id}</Table.Cell>
							<Table.Cell>{invoice.customer}</Table.Cell>
							<Table.Cell><Badge variant={statusVariant(invoice.status)}>{invoice.status}</Badge></Table.Cell>
							<Table.Cell>{invoice.date}</Table.Cell>
							<Table.Cell class="text-right">{invoice.amount}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
				<Table.Footer>
					<Table.Row>
						<Table.Cell colspan={4}>Total</Table.Cell>
						<Table.Cell class="text-right">$1,170.00</Table.Cell>
					</Table.Row>
				</Table.Footer>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
