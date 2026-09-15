<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Navbar from "$lib/components/ui/navbar/index.js";
	import { Search, Settings } from "@lucide/svelte";
</script>

<section id="navbar" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Navbar</h2>
	<Navbar.Root>
		<Navbar.Group>
			<Navbar.Heading>Acme Co.</Navbar.Heading>
			<Navbar.Divider />
			<Button variant="ghost" size="sm">Home</Button>
			<Button variant="ghost" size="sm">Docs</Button>
		</Navbar.Group>
		<Navbar.Group align="right">
			<Button variant="outline" size="icon-sm"><Search /></Button>
			<Button variant="outline" size="icon-sm"><Settings /></Button>
		</Navbar.Group>
	</Navbar.Root>
</section>
