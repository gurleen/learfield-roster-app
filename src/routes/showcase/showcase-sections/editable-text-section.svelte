<script lang="ts">
	import { EditableText } from "$lib/components/ui/editable-text/index.js";

	let editableTextValue = $state("Untitled document");
	let editableMultilineValue = $state("");
</script>

<section id="editable-text" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Editable Text</h2>
	<div class="flex flex-col gap-2">
		<EditableText bind:value={editableTextValue} selectAllOnFocus />
		<EditableText
			bind:value={editableMultilineValue}
			multiline
			placeholder="Click to add a description..."
		/>
	</div>
</section>
