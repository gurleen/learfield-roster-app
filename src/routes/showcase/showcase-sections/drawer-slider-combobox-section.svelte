<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as Drawer from "$lib/components/ui/drawer/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import { Combobox, MultiSelect, Suggest } from "$lib/components/ui/combobox/index.js";

	const frameworks = [
		{ value: "sveltekit", label: "SvelteKit" },
		{ value: "next", label: "Next.js" },
		{ value: "remix", label: "Remix" },
		{ value: "astro", label: "Astro" },
		{ value: "nuxt", label: "Nuxt" },
	];
	let comboboxValue = $state("");
	let multiSelectValue = $state<string[]>([]);
	let suggestValue = $state("");
	let sliderValue = $state([25]);
</script>

<section id="drawer-slider-combobox" class="space-y-3">
	<h2 class="text-sm font-semibold text-muted-foreground">
		Drawer, Slider &amp; Combobox
	</h2>
	<div class="flex flex-wrap items-start gap-6">
		<Drawer.Root>
			<Drawer.Trigger>
				{#snippet child({ props })}
					<Button variant="outline" {...props}>Open drawer</Button>
				{/snippet}
			</Drawer.Trigger>
			<Drawer.Content>
				<Drawer.Header>
					<Drawer.Title>Edit profile</Drawer.Title>
					<Drawer.Description>Make changes to your profile here.</Drawer.Description>
				</Drawer.Header>
				<div class="grid gap-1.5 px-4">
					<Label for="drawer-name">Name</Label>
					<Input id="drawer-name" placeholder="Your name" />
				</div>
				<Drawer.Footer>
					<Button>Save changes</Button>
					<Drawer.Close>
						{#snippet child({ props })}
							<Button variant="outline" {...props}>Cancel</Button>
						{/snippet}
					</Drawer.Close>
				</Drawer.Footer>
			</Drawer.Content>
		</Drawer.Root>

		<div class="grid w-48 gap-2">
			<Label for="slider">Volume ({sliderValue[0]})</Label>
			<Slider id="slider" type="multiple" bind:value={sliderValue} max={100} step={1} />
		</div>

		<div class="grid w-56 gap-1.5">
			<Label for="combobox">Framework</Label>
			<Combobox
				options={frameworks}
				bind:value={comboboxValue}
				placeholder="Select framework..."
			/>
		</div>

		<div class="grid w-56 gap-1.5">
			<Label for="multi-select">Frameworks</Label>
			<MultiSelect
				options={frameworks}
				bind:value={multiSelectValue}
				placeholder="Select frameworks..."
			/>
		</div>

		<div class="grid w-56 gap-1.5">
			<Label for="suggest">Framework (freeform)</Label>
			<Suggest options={frameworks} bind:value={suggestValue} placeholder="Type or pick..." />
		</div>
	</div>
</section>
