<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { config } from '$lib/config.svelte.js';
	import HomeIcon from '@lucide/svelte/icons/home';
	import ListOrderedIcon from '@lucide/svelte/icons/list-ordered';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';

	const navItems = [
		{ title: 'Home', href: '/', icon: HomeIcon },
		{ title: 'Lineup', href: '/lineup', icon: ListOrderedIcon }
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
							<Sidebar.MenuButton tooltipContent={item.title} isActive={page.url.pathname === item.href}>
								{#snippet child({ props })}
									<a href={item.href} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer>
		<Sidebar.MenuButton
			onclick={() => config.toggleColorScheme()}
			tooltipContent={config.colorScheme === 'dark' ? 'Dark mode' : 'Light mode'}
		>
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
