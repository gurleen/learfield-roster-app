<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
</script>

<section id="card" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Card</h2>
	<Card.Root class="max-w-sm">
		<Card.Header>
			<Card.Title>Create project</Card.Title>
			<Card.Description>Deploy a new project in one click.</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-1.5">
				<Label for="project-name">Name</Label>
				<Input id="project-name" placeholder="My project" />
			</div>
		</Card.Content>
		<Card.Footer class="justify-end gap-2">
			<Button variant="outline">Cancel</Button>
			<Button>Deploy</Button>
		</Card.Footer>
	</Card.Root>
</section>
