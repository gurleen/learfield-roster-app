<script lang="ts">
	import { Toaster as Sonner, type ToasterProps } from "svelte-sonner";
	import { config } from "$lib/config.svelte";

	let { ...restProps }: ToasterProps = $props();
</script>

<Sonner
	theme={config.colorScheme}
	class="toaster group"
	richColors={false}
	toastOptions={{
		unstyled: true,
		classes: {
			toast:
				"group toast rounded-none border border-border bg-popover text-popover-foreground shadow-elevation-4 flex items-center gap-2.5 px-3 py-2.5 text-xs w-full",
			title: "font-medium",
			description: "text-muted-foreground",
			actionButton:
				"rounded-none bg-primary text-primary-foreground px-2 py-1 text-xs font-medium ml-auto shrink-0",
			cancelButton:
				"rounded-none bg-muted text-muted-foreground px-2 py-1 text-xs font-medium shrink-0",
			closeButton:
				"rounded-none border-border bg-popover text-popover-foreground hover:bg-muted",
			success: "border-l-4 border-l-success",
			error: "border-l-4 border-l-destructive",
			warning: "border-l-4 border-l-warning",
			info: "border-l-4 border-l-primary",
		},
	}}
	{...restProps}
/>
