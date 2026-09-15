<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import ChevronUpIcon from "@lucide/svelte/icons/chevron-up";
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
	import type { HTMLInputAttributes } from "svelte/elements";

	type Props = WithElementRef<Omit<HTMLInputAttributes, "type" | "value">> & {
		value?: number | undefined;
		min?: number;
		max?: number;
		step?: number;
	};

	let {
		ref = $bindable(null),
		value = $bindable(undefined),
		min,
		max,
		step = 1,
		class: className,
		disabled,
		...restProps
	}: Props = $props();

	function clamp(next: number) {
		if (min !== undefined && next < min) next = min;
		if (max !== undefined && next > max) next = max;
		return next;
	}

	function increment() {
		value = clamp((value ?? min ?? 0) + step);
	}

	function decrement() {
		value = clamp((value ?? min ?? 0) - step);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "ArrowUp") {
			event.preventDefault();
			increment();
		} else if (event.key === "ArrowDown") {
			event.preventDefault();
			decrement();
		}
	}

	function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
		const raw = event.currentTarget.value;
		if (raw === "") {
			value = undefined;
			return;
		}
		const parsed = Number(raw);
		if (!Number.isNaN(parsed)) value = parsed;
	}
</script>

<div
	data-slot="numeric-input"
	class={cn(
		"flex h-8 w-fit items-stretch rounded-none border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50 has-disabled:opacity-50",
		className
	)}
>
	<input
		bind:this={ref}
		data-slot="numeric-input-field"
		type="text"
		inputmode="numeric"
		{disabled}
		value={value ?? ""}
		{min}
		{max}
		{step}
		oninput={handleInput}
		onkeydown={handleKeydown}
		class="h-full w-16 min-w-0 grow border-0 bg-transparent px-2.5 py-1 text-xs text-foreground outline-none placeholder:text-muted-foreground disabled:pointer-events-none"
		{...restProps}
	/>
	<div class="flex flex-col border-l border-input">
		<button
			type="button"
			data-slot="numeric-input-increment"
			aria-label="Increment"
			{disabled}
			onclick={increment}
			class="flex flex-1 items-center justify-center px-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
		>
			<ChevronUpIcon class="size-3" />
		</button>
		<button
			type="button"
			data-slot="numeric-input-decrement"
			aria-label="Decrement"
			{disabled}
			onclick={decrement}
			class="flex flex-1 items-center justify-center border-t border-input px-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
		>
			<ChevronDownIcon class="size-3" />
		</button>
	</div>
</div>
