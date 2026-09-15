# Blueprint component inventory

Companion to [`blueprint-style-guide.md`](./blueprint-style-guide.md), which records *how*
components are restyled to match Blueprint. This document tracks *which* components have made
the trip, and what's left in Blueprint's own component set.

## Converted (`src/lib/components/ui/`)

| Component | Blueprint counterpart | Style-guide audited? |
|---|---|---|
| `badge` | Tag | No — token colors only, not button-fidelity audited |
| `button` | Button | Yes — full fidelity pass, see style guide |
| `card` | Card | No |
| `checkbox` | Checkbox | No |
| `dialog` | Dialog | No |
| `dropdown-menu` | Menu + Popover | No |
| `input` | InputGroup | No |
| `label` | FormGroup (label portion) | No |
| `select` | HTMLSelect | No |
| `separator` | Divider | No |
| `switch` | Switch | No |
| `table` | HTMLTable | No |
| `tabs` | Tabs | No |
| `tooltip` | Tooltip | No |
| `alert-dialog` | Alert | No |
| `alert` | Callout | No |
| `breadcrumb` | Breadcrumbs | No |
| `collapsible` | Collapse | No |
| `radio-group` | RadioGroup | No |
| `progress` | ProgressBar | No |
| `context-menu` | ContextMenu | No |
| `popover` | Popover | No |
| `textarea` | Textarea | No |
| `icon` | Icon | No |
| `non-ideal-state` | NonIdealState | No |
| `control-group` | ControlGroup | No |
| `sonner` | Toast / OverlayToaster | No |
| `spinner` | Spinner | No |
| `text` | Text | No |
| `drawer` | Drawer | No |
| `slider` | Slider | No |
| `command` | Menu / Omnibar (primitive) | No |
| `combobox` (`Combobox`) | Select (searchable) | No |
| `combobox` (`MultiSelect`) | MultiSelect | No |
| `combobox` (`Suggest`) | Suggest | No |
| `calendar` | DatePicker (primitive) | No |
| `range-calendar` | DateRangeInput (primitive) | No |
| `date-picker` | DatePicker | No |
| `date-input` | DateInput | No |
| `date-range-input` | DateRangeInput | No |
| `numeric-input` | NumericInput | No |
| `tag-input` | TagInput (input variant) | No |
| `navbar` | Navbar | No |
| `editable-text` | EditableText | No |
| `omnibar` | Omnibar | No |
| `menu` | Menu / MenuItem | No |
| `timezone-select` | TimezoneSelect | No |
| `overflow-list` | OverflowList | No |
| `panel-stack` (`Panel`, `PanelStack`) | Panel / PanelStack | No |
| `tree` | Tree | No |

"Style-guide audited" means the component has been checked against Blueprint's own docs
dimension-by-dimension (sizing, spacing, states) the way `button.svelte` was. Everything else
so far only inherits the shared color/spacing/radius/elevation/typography tokens from
`layout.css` — same system, not yet individually verified against Blueprint's spec.

## In Blueprint, not yet in this project

| Blueprint component | shadcn-svelte equivalent | How to add |
|---|---|---|
| HTMLTable (data-grid variant) | Table (already converted) | Already covered — `table` handles this |
| **From `@blueprintjs/table`** | | |
| Table (virtualized data grid) | — | Additional dependency (this is a distinct, heavier component from HTMLTable — e.g. TanStack Table for logic + custom virtualized rendering) |

## Notes

- "Use existing shadcn component, restyle" means: run the shadcn-svelte CLI to scaffold it into
  `src/lib/components/ui/`, then apply the same token/spacing/radius/elevation treatment
  documented in `blueprint-style-guide.md` — no new architectural work.
- "Combine" means composing already-converted primitives; once done, add the result as its own
  entry in `src/lib/components/ui/` and move it to the "Converted" table above.
- "Build from scratch" means no shadcn-svelte or Radix/bits-ui primitive exists for it — it's a
  bespoke Svelte component following the structural pattern in the style guide.
- Blueprint's `Overlay2`, `Portal`, `ResizeSensor`, `KeyCombo`/`Hotkeys` are internal/utility
  building blocks rather than end-user UI components and are intentionally omitted here.
