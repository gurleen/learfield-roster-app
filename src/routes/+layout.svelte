<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/config.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="flex h-svh flex-col">
	<Sidebar.Provider class="min-h-0 flex-1 overflow-hidden">
		<AppSidebar />
		<Sidebar.Inset class="min-h-0">
			<div class="flex items-center gap-2 border-b border-border p-2">
				<Sidebar.Trigger />
			</div>
			<div class="min-h-0 flex-1 overflow-y-auto">
				{@render children()}
			</div>
		</Sidebar.Inset>
	</Sidebar.Provider>
</div>
<Toaster />
