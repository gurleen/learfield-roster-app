<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import { config } from "$lib/config.svelte";

	import ButtonsSection from "./showcase-sections/buttons-section.svelte";
	import BadgesSection from "./showcase-sections/badges-section.svelte";
	import InputsSection from "./showcase-sections/inputs-section.svelte";
	import CheckboxSwitchSection from "./showcase-sections/checkbox-switch-section.svelte";
	import SelectSection from "./showcase-sections/select-section.svelte";
	import TabsSection from "./showcase-sections/tabs-section.svelte";
	import CardSection from "./showcase-sections/card-section.svelte";
	import TableSection from "./showcase-sections/table-section.svelte";
	import DataTableSection from "./showcase-sections/data-table-section.svelte";
	import DialogDropdownSection from "./showcase-sections/dialog-dropdown-section.svelte";
	import AlertSection from "./showcase-sections/alert-section.svelte";
	import BreadcrumbSection from "./showcase-sections/breadcrumb-section.svelte";
	import NavbarSection from "./showcase-sections/navbar-section.svelte";
	import EditableTextSection from "./showcase-sections/editable-text-section.svelte";
	import CollapsibleSection from "./showcase-sections/collapsible-section.svelte";
	import RadioProgressSection from "./showcase-sections/radio-progress-section.svelte";
	import ContextPopoverAlertdialogSection from "./showcase-sections/context-popover-alertdialog-section.svelte";
	import TextareaSection from "./showcase-sections/textarea-section.svelte";
	import IconSection from "./showcase-sections/icon-section.svelte";
	import NonIdealStateSection from "./showcase-sections/non-ideal-state-section.svelte";
	import ControlGroupSection from "./showcase-sections/control-group-section.svelte";
	import ToastSection from "./showcase-sections/toast-section.svelte";
	import DrawerSliderComboboxSection from "./showcase-sections/drawer-slider-combobox-section.svelte";
	import DateNumericTagSection from "./showcase-sections/date-numeric-tag-section.svelte";
	import OmnibarSection from "./showcase-sections/omnibar-section.svelte";
	import MenuSection from "./showcase-sections/menu-section.svelte";
	import TimezoneSelectSection from "./showcase-sections/timezone-select-section.svelte";
	import OverflowListSection from "./showcase-sections/overflow-list-section.svelte";
	import PanelStackSection from "./showcase-sections/panel-stack-section.svelte";
	import TreeSection from "./showcase-sections/tree-section.svelte";
	import SpinnerTextSection from "./showcase-sections/spinner-text-section.svelte";
	import SidebarSection from "./showcase-sections/sidebar-section.svelte";
	import MenubarSection from "./showcase-sections/menubar-section.svelte";

	const sections = [
		{ id: "buttons", label: "Buttons" },
		{ id: "badges", label: "Badges" },
		{ id: "inputs", label: "Inputs" },
		{ id: "checkbox-switch", label: "Checkbox & Switch" },
		{ id: "select", label: "Select" },
		{ id: "tabs", label: "Tabs" },
		{ id: "card", label: "Card" },
		{ id: "table", label: "Table" },
		{ id: "data-table", label: "Data Table" },
		{ id: "dialog-dropdown", label: "Dialog & Dropdown Menu" },
		{ id: "alert", label: "Alert" },
		{ id: "breadcrumb", label: "Breadcrumb" },
		{ id: "navbar", label: "Navbar" },
		{ id: "editable-text", label: "Editable Text" },
		{ id: "collapsible", label: "Collapsible" },
		{ id: "radio-progress", label: "Radio Group & Progress" },
		{ id: "context-popover-alertdialog", label: "Context Menu, Popover & Alert Dialog" },
		{ id: "textarea", label: "Textarea" },
		{ id: "icon", label: "Icon & Icon Button" },
		{ id: "non-ideal-state", label: "Non-Ideal State" },
		{ id: "control-group", label: "Control Group" },
		{ id: "toast", label: "Toast" },
		{ id: "drawer-slider-combobox", label: "Drawer, Slider & Combobox" },
		{ id: "date-numeric-tag", label: "Date, Numeric & Tag Input" },
		{ id: "omnibar", label: "Omnibar" },
		{ id: "sidebar", label: "Sidebar" },
		{ id: "menubar", label: "Menubar" },
		{ id: "panel-stack", label: "Panel & Panel Stack" },
		{ id: "tree", label: "Tree" },
	];
</script>

<Tooltip.Provider>
	<div class="mx-auto flex max-w-6xl gap-8 p-8">
		<nav class="sticky top-8 hidden h-fit w-48 shrink-0 space-y-1 lg:block">
			<h2 class="mb-2 text-xs font-semibold uppercase text-muted-foreground">On this page</h2>
			{#each sections as item (item.id)}
				<a
					href="#{item.id}"
					class="block truncate text-sm text-muted-foreground hover:text-foreground"
				>
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="min-w-0 flex-1 space-y-12">
			<div class="flex items-center justify-between">
				<h1 class="text-lg font-semibold">Blueprint component showcase</h1>
				<Button variant="outline" size="sm" onclick={() => config.toggleColorScheme()}>
					{config.colorScheme === "dark" ? "Switch to light" : "Switch to dark"}
				</Button>
			</div>

			<ButtonsSection />
			<Separator />
			<BadgesSection />
			<Separator />
			<InputsSection />
			<Separator />
			<CheckboxSwitchSection />
			<Separator />
			<SelectSection />
			<Separator />
			<TabsSection />
			<Separator />
			<CardSection />
			<Separator />
			<TableSection />
			<Separator />
			<DataTableSection />
			<Separator />
			<DialogDropdownSection />
			<Separator />
			<AlertSection />
			<Separator />
			<BreadcrumbSection />
			<Separator />
			<NavbarSection />
			<Separator />
			<EditableTextSection />
			<Separator />
			<CollapsibleSection />
			<Separator />
			<RadioProgressSection />
			<Separator />
			<ContextPopoverAlertdialogSection />
			<Separator />
			<TextareaSection />
			<Separator />
			<IconSection />
			<Separator />
			<NonIdealStateSection />
			<Separator />
			<ControlGroupSection />
			<Separator />
			<ToastSection />
			<Separator />
			<DrawerSliderComboboxSection />
			<Separator />
			<DateNumericTagSection />
			<OmnibarSection />
			<Separator />
			<MenuSection />
			<Separator />
			<TimezoneSelectSection />
			<Separator />
			<OverflowListSection />
			<Separator />
			<SpinnerTextSection />
			<Separator />
			<SidebarSection />
			<Separator />
			<MenubarSection />
			<Separator />
			<PanelStackSection />

			<TreeSection />
	</div>
</Tooltip.Provider>
