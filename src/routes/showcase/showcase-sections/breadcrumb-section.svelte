<script lang="ts">
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
</script>

<section id="breadcrumb" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">Breadcrumb</h2>
	<Breadcrumb.Root>
		<Breadcrumb.List>
			<Breadcrumb.Item><Breadcrumb.Link href="#">Home</Breadcrumb.Link></Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item><Breadcrumb.Link href="#">Components</Breadcrumb.Link></Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item><Breadcrumb.Page>Current</Breadcrumb.Page></Breadcrumb.Item>
		</Breadcrumb.List>
	</Breadcrumb.Root>
</section>
