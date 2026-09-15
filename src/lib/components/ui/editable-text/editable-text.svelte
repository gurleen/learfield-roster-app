<script lang="ts" module>
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type EditableTextProps = Omit<WithElementRef<HTMLAttributes<HTMLDivElement>>, 'onchange'> & {
		value?: string;
		placeholder?: string;
		multiline?: boolean;
		disabled?: boolean;
		maxLength?: number;
		selectAllOnFocus?: boolean;
		confirmOnEnterKey?: boolean;
		onConfirm?: (value: string) => void;
		onCancel?: (value: string) => void;
		onEdit?: (value: string) => void;
	};
</script>

<script lang="ts">
	let {
		class: className,
		ref = $bindable(null),
		value = $bindable(''),
		placeholder = 'Click to edit',
		multiline = false,
		disabled = false,
		maxLength,
		selectAllOnFocus = false,
		confirmOnEnterKey = false,
		onConfirm,
		onCancel,
		onEdit,
		...restProps
	}: EditableTextProps = $props();

	let isEditing = $state(false);
	let lastConfirmedValue = value;
	let inputEl = $state<HTMLInputElement | HTMLTextAreaElement | null>(null);

	function startEditing() {
		if (disabled) return;
		lastConfirmedValue = value;
		isEditing = true;
	}

	function confirm() {
		isEditing = false;
		lastConfirmedValue = value;
		onConfirm?.(value);
	}

	function cancel() {
		isEditing = false;
		value = lastConfirmedValue;
		onCancel?.(value);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			cancel();
		} else if (event.key === 'Enter' && (!multiline || confirmOnEnterKey) && !event.shiftKey) {
			event.preventDefault();
			confirm();
		}
	}

	function handleInput() {
		onEdit?.(value);
	}

	$effect(() => {
		if (isEditing && inputEl) {
			inputEl.focus();
			if (selectAllOnFocus) inputEl.select();
		}
	});
</script>

<div
	bind:this={ref}
	data-slot="editable-text"
	class={cn('inline-block max-w-full', className)}
	{...restProps}
>
	{#if isEditing}
		{#if multiline}
			<textarea
				bind:this={inputEl}
				data-slot="editable-text-input"
				class="blueprint-editable-text blueprint-editable-text-editing field-sizing-content min-h-[1.5em] w-full resize-none rounded-none px-1 py-0.5 text-[14px] leading-[1.28581] outline-none"
				bind:value
				maxlength={maxLength}
				onblur={confirm}
				onkeydown={handleKeydown}
				oninput={handleInput}
			></textarea>
		{:else}
			<input
				bind:this={inputEl}
				data-slot="editable-text-input"
				type="text"
				class="blueprint-editable-text blueprint-editable-text-editing field-sizing-content max-w-full rounded-none px-1 py-0.5 text-[14px] leading-[1.28581] outline-none"
				bind:value
				maxlength={maxLength}
				onblur={confirm}
				onkeydown={handleKeydown}
				oninput={handleInput}
			/>
		{/if}
	{:else}
		<span
			data-slot="editable-text-content"
			data-placeholder={value.length === 0}
			role="textbox"
			tabindex={disabled ? -1 : 0}
			aria-disabled={disabled}
			aria-multiline={multiline}
			class={cn(
				'blueprint-editable-text inline-block max-w-full cursor-text overflow-hidden rounded-none px-1 py-0.5 text-[14px] leading-[1.28581] break-words whitespace-pre-wrap',
				disabled && 'blueprint-editable-text-disabled cursor-not-allowed'
			)}
			onclick={startEditing}
			onkeydown={(event) => {
				if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
					event.preventDefault();
					startEditing();
				}
			}}
		>
			{value.length > 0 ? value : placeholder}
		</span>
	{/if}
</div>
