<script lang="ts">
	let { fileName }: { fileName: string } = $props();
</script>

<p class="text-sm text-muted-foreground">
	Contents of <span class="font-medium text-foreground">{fileName}</span> would render here.
</p>
