<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as ContextMenu from "$lib/components/ui/context-menu/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
</script>

<section id="context-popover-alertdialog" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">
		Context Menu, Popover &amp; Alert Dialog
	</h2>
	<div class="flex flex-wrap items-center gap-2">
		<ContextMenu.Root>
			<ContextMenu.Trigger
				class="flex h-16 w-40 items-center justify-center border border-border text-xs text-muted-foreground"
			>
				Right click me
			</ContextMenu.Trigger>
			<ContextMenu.Content>
				<ContextMenu.Item>Profile</ContextMenu.Item>
				<ContextMenu.Item>Settings</ContextMenu.Item>
				<ContextMenu.Separator />
				<ContextMenu.Item>Log out</ContextMenu.Item>
			</ContextMenu.Content>
		</ContextMenu.Root>

		<Popover.Root>
			<Popover.Trigger>
				{#snippet child({ props })}
					<Button variant="outline" {...props}>Open popover</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content>
				<Popover.Title>Popover title</Popover.Title>
				<Popover.Description>Popover body text.</Popover.Description>
			</Popover.Content>
		</Popover.Root>

		<AlertDialog.Root>
			<AlertDialog.Trigger>
				{#snippet child({ props })}
					<Button variant="destructive" {...props}>Delete account</Button>
				{/snippet}
			</AlertDialog.Trigger>
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>Are you sure?</AlertDialog.Title>
					<AlertDialog.Description>This action cannot be undone.</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel>
						{#snippet child({ props })}
							<Button variant="outline" {...props}>Cancel</Button>
						{/snippet}
					</AlertDialog.Cancel>
					<AlertDialog.Action>
						{#snippet child({ props })}
							<Button variant="destructive" {...props}>Confirm</Button>
						{/snippet}
					</AlertDialog.Action>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
	</div>
</section>
