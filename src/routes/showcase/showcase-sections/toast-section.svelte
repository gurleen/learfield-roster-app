<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { toast } from "$lib/components/ui/sonner/index.js";
</script>

<section id="toast" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Toast</h2>
	<div class="flex flex-wrap gap-2">
		<Button variant="outline" onclick={() => toast("Event has been created")}>Default</Button>
		<Button
			variant="outline"
			onclick={() => toast.success("Changes saved", { description: "Your profile is up to date." })}
			>Success</Button
		>
		<Button
			variant="outline"
			onclick={() => toast.warning("Storage almost full", { description: "You are at 90% of your quota." })}
			>Warning</Button
		>
		<Button
			variant="outline"
			onclick={() => toast.error("Upload failed", { description: "Check your connection and try again." })}
			>Error</Button
		>
		<Button
			variant="outline"
			onclick={() =>
				toast("New message", {
					description: "You have an unread message from support.",
					action: { label: "View", onClick: () => toast("Opened message") },
				})}>With action</Button
		>
	</div>
</section>
