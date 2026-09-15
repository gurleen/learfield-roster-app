<script lang="ts">
	import * as Tabs from "$lib/components/ui/tabs/index.js";
</script>

<section id="tabs" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Tabs</h2>
	<Tabs.Root value="account" class="max-w-sm">
		<Tabs.List>
			<Tabs.Trigger value="account">Account</Tabs.Trigger>
			<Tabs.Trigger value="password">Password</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="account">Account settings go here.</Tabs.Content>
		<Tabs.Content value="password">Password settings go here.</Tabs.Content>
	</Tabs.Root>
</section>
