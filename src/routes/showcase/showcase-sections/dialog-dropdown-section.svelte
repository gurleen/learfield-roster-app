<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
</script>

<section id="dialog-dropdown" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Dialog &amp; Dropdown Menu</h2>
	<div class="flex gap-2">
		<Dialog.Root>
			<Dialog.Trigger>
				{#snippet child({ props })}
					<Button variant="outline" {...props}>Open dialog</Button>
				{/snippet}
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Are you sure?</Dialog.Title>
					<Dialog.Description>This action cannot be undone.</Dialog.Description>
				</Dialog.Header>
				<Dialog.Footer>
					<Dialog.Close>
						{#snippet child({ props })}
							<Button variant="outline" {...props}>Cancel</Button>
						{/snippet}
					</Dialog.Close>
					<Button variant="destructive">Delete</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button variant="outline" {...props}>Open menu</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Item>Profile</DropdownMenu.Item>
				<DropdownMenu.Item>Settings</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>Log out</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>

		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button variant="ghost" {...props}>Hover me</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content>Blueprint-styled tooltip</Tooltip.Content>
		</Tooltip.Root>
	</div>
</section>
