<script lang="ts" module>
	import { getContext, setContext, type Component } from "svelte";

	export type PanelDefinition<P extends Record<string, unknown> = Record<string, unknown>> = {
		title: string;
		component: Component<P>;
		props?: P;
	};

	export type PanelStackApi = {
		openPanel: (panel: PanelDefinition<any>) => void;
		closePanel: () => void;
	};

	const PANEL_STACK_CONTEXT = Symbol("panel-stack");

	/** Call from within a panel's own component to push/pop panels on the enclosing PanelStack. */
	export function getPanelStack(): PanelStackApi {
		const api = getContext<PanelStackApi>(PANEL_STACK_CONTEXT);
		if (!api) {
			throw new Error("getPanelStack() must be called from a component rendered inside <PanelStack>");
		}
		return api;
	}
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";
	import Panel from "./panel.svelte";

	let {
		stack = $bindable([]),
		onOpen,
		onClose,
		showPanelHeader = true,
		renderActivePanelOnly = true,
		class: className,
	}: {
		stack: PanelDefinition<any>[];
		onOpen?: (panel: PanelDefinition<any>) => void;
		onClose?: (panel: PanelDefinition<any>) => void;
		showPanelHeader?: boolean;
		renderActivePanelOnly?: boolean;
		class?: string;
	} = $props();

	function openPanel(panel: PanelDefinition<any>) {
		stack = [...stack, panel];
		onOpen?.(panel);
	}

	function closePanel() {
		if (stack.length <= 1) return;
		const closed = stack[stack.length - 1];
		stack = stack.slice(0, -1);
		if (closed) onClose?.(closed);
	}

	setContext<PanelStackApi>(PANEL_STACK_CONTEXT, { openPanel, closePanel });

	const activePanel = $derived(stack[stack.length - 1]);
	const visiblePanels = $derived(renderActivePanelOnly ? (activePanel ? [activePanel] : []) : stack);
</script>

<div data-slot="panel-stack" class={cn("relative flex min-h-0 flex-1 flex-col overflow-hidden", className)}>
	{#each visiblePanels as panelDef, index (panelDef)}
		{@const isActive = panelDef === activePanel}
		<div
			data-slot="panel-stack-frame"
			class={cn(
				"absolute inset-0 flex flex-col bg-background transition-transform duration-200 ease-out",
				isActive ? "translate-x-0" : "-translate-x-full",
			)}
			style={`z-index: ${index}`}
		>
			<Panel title={panelDef.title} showHeader={showPanelHeader} onBack={stack.length > 1 && isActive ? closePanel : undefined}>
				<panelDef.component {...(panelDef.props ?? {})} />
			</Panel>
		</div>
	{/each}
</div>
