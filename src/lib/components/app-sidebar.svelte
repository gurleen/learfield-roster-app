<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { config } from '$lib/config.svelte.js';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';

	const navItems = [
		{ title: 'Home', href: '/' },
		{ title: 'Showcase', href: '/showcase' }
	];
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each navItems as item (item.href)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={item.href} {...props}>{item.title}</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer>
		<Sidebar.MenuButton onclick={() => config.toggleColorScheme()}>
			{#if config.colorScheme === 'dark'}
				<MoonIcon />
				<span>Dark mode</span>
			{:else}
				<SunIcon />
				<span>Light mode</span>
			{/if}
		</Sidebar.MenuButton>
	</Sidebar.Footer>
</Sidebar.Root>
