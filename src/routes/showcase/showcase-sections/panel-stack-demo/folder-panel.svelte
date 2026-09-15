<script lang="ts">
	import { getPanelStack, type PanelDefinition } from "$lib/components/ui/panel-stack/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Folder, File } from "@lucide/svelte";
	import FilePanel from "./file-panel.svelte";

	let { folderName, files }: { folderName: string; files: string[] } = $props();

	const { openPanel } = getPanelStack();

	function open(fileName: string) {
		openPanel({
			title: fileName,
			component: FilePanel,
			props: { fileName },
		} satisfies PanelDefinition<{ fileName: string }>);
	}
</script>

<div class="space-y-1">
	<p class="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
		<Folder class="size-3.5" />
		{folderName}
	</p>
	{#each files as fileName (fileName)}
		<Button variant="ghost" class="w-full justify-start gap-2" onclick={() => open(fileName)}>
			<File class="size-4" />
			{fileName}
		</Button>
	{/each}
</div>
