<script lang="ts">
	import * as Menubar from "$lib/components/ui/menubar/index.js";

	let showBookmarks = $state(true);
	let showFullUrls = $state(false);
	let profile = $state("benoit");
</script>

<section id="menubar" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Menubar</h2>
	<div class="flex flex-wrap items-start gap-6">
		<Menubar.Root>
			<Menubar.Menu>
				<Menubar.Trigger>File</Menubar.Trigger>
				<Menubar.Content>
					<Menubar.Item>
						New Tab
						<Menubar.Shortcut>⌘T</Menubar.Shortcut>
					</Menubar.Item>
					<Menubar.Item>
						New Window
						<Menubar.Shortcut>⌘N</Menubar.Shortcut>
					</Menubar.Item>
					<Menubar.Item disabled>New Incognito Window</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Sub>
						<Menubar.SubTrigger>Share</Menubar.SubTrigger>
						<Menubar.SubContent>
							<Menubar.Item>Email Link</Menubar.Item>
							<Menubar.Item>Messages</Menubar.Item>
							<Menubar.Item>Notes</Menubar.Item>
						</Menubar.SubContent>
					</Menubar.Sub>
					<Menubar.Separator />
					<Menubar.Item>
						Print...
						<Menubar.Shortcut>⌘P</Menubar.Shortcut>
					</Menubar.Item>
				</Menubar.Content>
			</Menubar.Menu>
			<Menubar.Menu>
				<Menubar.Trigger>Edit</Menubar.Trigger>
				<Menubar.Content>
					<Menubar.Item>
						Undo
						<Menubar.Shortcut>⌘Z</Menubar.Shortcut>
					</Menubar.Item>
					<Menubar.Item>
						Redo
						<Menubar.Shortcut>⇧⌘Z</Menubar.Shortcut>
					</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Sub>
						<Menubar.SubTrigger>Find</Menubar.SubTrigger>
						<Menubar.SubContent>
							<Menubar.Item>Search the web...</Menubar.Item>
							<Menubar.Separator />
							<Menubar.Item>Find...</Menubar.Item>
							<Menubar.Item>Find Next</Menubar.Item>
							<Menubar.Item>Find Previous</Menubar.Item>
						</Menubar.SubContent>
					</Menubar.Sub>
				</Menubar.Content>
			</Menubar.Menu>
			<Menubar.Menu>
				<Menubar.Trigger>View</Menubar.Trigger>
				<Menubar.Content>
					<Menubar.CheckboxItem bind:checked={showBookmarks}>
						Always Show Bookmarks Bar
					</Menubar.CheckboxItem>
					<Menubar.CheckboxItem bind:checked={showFullUrls}>Always Show Full URLs</Menubar.CheckboxItem>
					<Menubar.Separator />
					<Menubar.Item disabled>
						Reload
						<Menubar.Shortcut>⌘R</Menubar.Shortcut>
					</Menubar.Item>
				</Menubar.Content>
			</Menubar.Menu>
			<Menubar.Menu>
				<Menubar.Trigger>Profiles</Menubar.Trigger>
				<Menubar.Content>
					<Menubar.RadioGroup bind:value={profile}>
						<Menubar.RadioItem value="benoit">Benoit</Menubar.RadioItem>
						<Menubar.RadioItem value="luis">Luis</Menubar.RadioItem>
						<Menubar.RadioItem value="tim">Tim</Menubar.RadioItem>
					</Menubar.RadioGroup>
					<Menubar.Separator />
					<Menubar.Item>Edit...</Menubar.Item>
					<Menubar.Separator />
					<Menubar.Item>Add Profile...</Menubar.Item>
				</Menubar.Content>
			</Menubar.Menu>
		</Menubar.Root>
	</div>
</section>
