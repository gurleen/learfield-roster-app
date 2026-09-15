# Blueprint style guide

This project's shadcn-svelte components (`src/lib/components/ui/`) are restyled to follow
[Blueprint](https://github.com/palantir/blueprint), Palantir's design system. This document
records the mapping so new components can be styled consistently without re-deriving it.

## Button fidelity

Buttons now follow the deployed Blueprint 6 documentation: 4px corners, 14px normal text, 30px default / 24px small / 40px large minimum heights,
8px icon gaps, inset borders, and Blueprint's hover, active, disabled, and dark states.
`default` retains shadcn's primary intent mapping; `secondary` is Blueprint's neutral
button, `ghost` is minimal, and `outline` is outlined. Danger and success use solid
fills; warning uses Blueprint's lighter orange with dark text. `xs` and `link` remain
project extensions. Button state colors live in `button.css` because the global dark
semantic tokens are not the colors Blueprint uses for filled buttons.

IBM Plex Sans is the intentional font difference from Blueprint, including on buttons.
Other components have not been audited in this button correction.

## Color tokens

Values converted from Blueprint's core palette (`packages/colors/src/colors.ts` in
palantir/blueprint) to OKLCH for consistency with the existing `color-mix(in oklch, ...)` usage
in `button.svelte`.

### Light (`:root`)

| shadcn token | Blueprint source | oklch |
|---|---|---|
| `--background` | white | `oklch(1 0 0)` |
| `--foreground` | Blueprint text `#182026` | `oklch(0.238 0.016 240.779)` |
| `--primary` | Blue3 `#2D72D2` | `oklch(0.56 0.163 257.63)` |
| `--secondary` / `--accent` | Light Gray3 `#E5E8EB` | `oklch(0.93 0.005 247.88)` |
| `--muted` | Light Gray4 `#EDEFF2` | `oklch(0.951 0.005 258.325)` |
| `--muted-foreground` | Gray1 `#5F6B7C` | `oklch(0.524 0.031 257.074)` |
| `--destructive` | Red3 `#CD4246` | `oklch(0.579 0.175 22.938)` |
| `--success` | Green3 `#238551` | `oklch(0.548 0.12 155.194)` |
| `--warning` | Orange3 `#C87619` | `oklch(0.642 0.14 61.839)` |
| `--border` / `--input` | Light Gray1 `#D3D8DE` | `oklch(0.88 0.01 252.819)` |
| `--ring` | Blue4 `#4C90F0` | `oklch(0.655 0.159 257.399)` |
| `--chart-1..5` | Blue3 / Green3 / Orange3 / Red3 / Gray3 | see `layout.css` |

### Dark (`.dark`)

| shadcn token | Blueprint source | oklch |
|---|---|---|
| `--background` | Dark Gray1 `#1C2127` | `oklch(0.245 0.014 253.08)` |
| `--foreground` | Light Gray5 `#F6F7F9` | `oklch(0.976 0.003 264.542)` |
| `--card` / `--popover` | Dark Gray2 `#252A31` | `oklch(0.283 0.015 256.792)` |
| `--primary` | Blue4 `#4C90F0` | `oklch(0.655 0.159 257.399)` |
| `--secondary` / `--accent` / `--muted` | Dark Gray3 `#2F343C` | `oklch(0.323 0.016 259.802)` |
| `--muted-foreground` | Gray4 `#ABB3BF` | `oklch(0.764 0.019 258.361)` |
| `--destructive` | Red4 `#E76A6E` | `oklch(0.676 0.156 20.217)` |
| `--success` | Green4 `#32A467` | `oklch(0.64 0.137 155.446)` |
| `--warning` | Orange4 `#EC9A3C` | `oklch(0.753 0.144 65.588)` |
| `--border` / `--input` | Dark Gray4 `#383E47` | `oklch(0.362 0.018 258.372)` |
| `--ring` | Blue5 `#8ABBFF` | `oklch(0.784 0.111 256.703)` |

`--success`/`--warning` are new tokens (shadcn's default set only ships `--destructive`); they
follow the exact same naming pattern (`--success-foreground`, `--warning-foreground`) and are
registered in `@theme inline` next to `--color-destructive`.

## Spacing

Blueprint's base unit is 4px (`$pt-spacing`), which is identical to Tailwind v4's default
spacing scale — use standard Tailwind spacing utilities, no custom config needed.

## Border radius

Global radius remains `0`; buttons explicitly use Blueprint’s 4px radius.

## Elevation / shadows

Blueprint uses layered box-shadows instead of Tailwind's default shadow scale. Four levels are
defined as CSS custom properties in `layout.css` (`--shadow-elevation-1` .. `-4`, registered in
`@theme inline` so `shadow-elevation-N` utility classes are available), with heavier alpha
values in `.dark`:

| Level | Usage |
|---|---|
| `shadow-elevation-1` | Buttons (default/outline variants), Card |
| `shadow-elevation-2` | Tooltip |
| `shadow-elevation-3` | Select content, Dropdown menu content |
| `shadow-elevation-4` | Dialog content |

## Typography

Base font size is 14px, which matches Tailwind's `text-sm` — components default to `text-xs`/
`text-sm` rather than `text-base`. Font family is IBM Plex Sans Variable (`--font-sans`,
`--font-heading`).

## Component conventions

**Tinted intent colors.** Rather than Blueprint's solid-fill intent buttons, this codebase's
own established pattern (set by the original `destructive` button variant) is a *tinted*
background: `bg-<intent>/10 text-<intent> hover:bg-<intent>/20`, doubling opacity in `.dark`
(`dark:bg-<intent>/20 dark:hover:bg-<intent>/30`). Apply this same ramp to any new intent
variant (see `success`/`warning` on `Button` and `Badge`) instead of switching to solid fills.

**Structural pattern.** Every UI primitive follows:

```svelte
<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const xVariants = tv({
		base: "...",
		variants: { variant: { ... }, size: { ... } },
		defaultVariants: { variant: "default", size: "default" },
	});
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	let { ref = $bindable(null), class: className, variant, size, ...restProps } = $props();
</script>

<element bind:this={ref} data-slot="x" class={cn(xVariants({ variant, size }), className)} {...restProps} />
```

Use `data-slot` on every root element, keep variant/size keys aligned with the shadcn-svelte
CLI scaffold, and route every color through a semantic token (`bg-primary`, `text-foreground`,
etc.) — never a hardcoded hex or Tailwind palette color — so future retheming stays a
`layout.css`-only change.

## Known, accepted deviation

Button heights (`h-6`/`h-8`/`h-9` = 24/32/36px) are close to but not identical to Blueprint's
own scale (small 24px / standard 30px / large 40px). Left as-is — the payoff of pixel-matching
didn't justify touching spacing assumptions already baked into scaffolded components. Revisit
if a future component surfaces a real visual mismatch.
