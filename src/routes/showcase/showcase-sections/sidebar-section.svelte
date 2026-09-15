<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import HouseIcon from "@lucide/svelte/icons/house";
	import InboxIcon from "@lucide/svelte/icons/inbox";
	import SearchIcon from "@lucide/svelte/icons/search";
	import SettingsIcon from "@lucide/svelte/icons/settings";

	const items = [
		{ title: "Home", icon: HouseIcon },
		{ title: "Inbox", icon: InboxIcon },
		{ title: "Search", icon: SearchIcon },
		{ title: "Settings", icon: SettingsIcon },
	];
</script>

<section id="sidebar" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Sidebar</h2>
	<p class="text-xs text-muted-foreground">
		Toggle the trigger to collapse the sidebar. Contained here in a bordered box for the
		showcase; in an app it wraps the full page.
	</p>
	<div
		class="h-96 w-full overflow-hidden rounded-none border border-border"
		style="transform: translateZ(0);"
	>
		<Sidebar.Provider class="h-full min-h-0">
			<Sidebar.Root collapsible="icon">
				<Sidebar.Header>
					<Sidebar.MenuButton size="lg" class="text-xs font-semibold">
						Application
					</Sidebar.MenuButton>
				</Sidebar.Header>
				<Sidebar.Content>
					<Sidebar.Group>
						<Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
						<Sidebar.GroupContent>
							<Sidebar.Menu>
								{#each items as { title, icon: Icon } (title)}
									<Sidebar.MenuItem>
										<Sidebar.MenuButton>
											{#snippet child({ props })}
												<a href="##" {...props}>
													<Icon />
													<span>{title}</span>
												</a>
											{/snippet}
										</Sidebar.MenuButton>
									</Sidebar.MenuItem>
								{/each}
							</Sidebar.Menu>
						</Sidebar.GroupContent>
					</Sidebar.Group>
				</Sidebar.Content>
				<Sidebar.Footer>
					<Sidebar.MenuButton>Account</Sidebar.MenuButton>
				</Sidebar.Footer>
				<Sidebar.Rail />
			</Sidebar.Root>
			<Sidebar.Inset>
				<div class="flex items-center gap-2 border-b border-border p-3">
					<Sidebar.Trigger />
					<span class="text-xs text-muted-foreground">Content area</span>
				</div>
				<div class="p-4 text-xs text-muted-foreground">Page content goes here.</div>
			</Sidebar.Inset>
		</Sidebar.Provider>
	</div>
</section>
