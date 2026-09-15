<script lang="ts">
	import * as Menu from "$lib/components/ui/menu/index.js";
	import { Copy, Trash2, Pencil, Share2 } from "@lucide/svelte";

	let active = $state("edit");
</script>

<section id="menu" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Menu</h2>
	<div class="flex flex-wrap items-start gap-6">
		<Menu.Root class="w-56">
			<Menu.Heading>Actions</Menu.Heading>
			<Menu.Item active={active === "edit"} onclick={() => (active = "edit")}>
				<Pencil />
				Edit
				<Menu.Shortcut>⌘E</Menu.Shortcut>
			</Menu.Item>
			<Menu.Item active={active === "copy"} onclick={() => (active = "copy")}>
				<Copy />
				Copy
				<Menu.Shortcut>⌘C</Menu.Shortcut>
			</Menu.Item>
			<Menu.Item active={active === "share"} onclick={() => (active = "share")}>
				<Share2 />
				Share
			</Menu.Item>
			<Menu.Divider />
			<Menu.Item variant="destructive" disabled>
				<Trash2 />
				Delete
			</Menu.Item>
		</Menu.Root>
	</div>
</section>
