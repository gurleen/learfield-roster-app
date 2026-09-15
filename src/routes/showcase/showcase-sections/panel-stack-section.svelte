<script lang="ts">
	import { PanelStack, type PanelDefinition } from "$lib/components/ui/panel-stack/index.js";
	import FolderPanel from "./panel-stack-demo/folder-panel.svelte";

	let stack = $state<PanelDefinition<any>[]>([
		{
			title: "Documents",
			component: FolderPanel,
			props: { folderName: "Documents", files: ["resume.pdf", "cover-letter.docx"] },
		},
	]);
</script>

<section id="panel-stack" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Panel & Panel Stack</h2>
	<p class="text-xs text-muted-foreground">
		Click a file to push a new panel; the back button pops it off the stack.
	</p>
	<div class="flex h-72 w-full max-w-sm flex-col overflow-hidden rounded-none border border-border">
		<PanelStack bind:stack />
	</div>
</section>
