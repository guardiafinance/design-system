# Phase 3 — Architecture: Textarea v0.1.0 DoD

## Affected components (scope table)

| Path | Action | Why |
|------|--------|-----|
| `ui_kit/components/textarea/index.tsx` | **Rewrite** | Replace minimalist baseline with CVA-driven implementation (sizes/states/counter/autoSize/resize), Input-parity API, semantic tokens only. AC-1 .. AC-8. |
| `ui_kit/components/textarea/Textarea.test.tsx` | **Create** | New file with ≥ 20 behavioral tests + jest-axe matrix in light + dark. AC-9 .. AC-11. |
| `ui_kit/components/textarea/Textarea.stories.tsx` | **Rewrite** | Replace 3 minimal stories with full set + `DarkTheme` matrix. AC-12 .. AC-13. |
| `docs/src/pages/componentes/textarea.astro` | **Create** | New Astro docs page mirroring Radio/Input pattern. AC-14. |
| `docs/src/previews/textarea.tsx` | **Create** | React preview rows consumed by the Astro page. AC-15. |
| `docs/src/previews/textarea-live.tsx` | **Create** | react-live editor snippet for the Playground section. AC-15. |
| `docs/src/pages/index.astro` | **Edit (1-line insertion)** | Add `"Textarea"` to the `MIGRATED` Set (alphabetically after `"Spinner"`, before `"Toggle"` if present, else at the end). AC-16. |
| `ui_kit/components/index.ts` | **No change** | Line 45 already exports `./textarea`. AC-17 verifies only. |

Out of declared scope (any file outside the table above) — Gate 2 blocks PRs that touch additional paths.

## API design

```typescript
export type TextareaSize = "sm" | "md" | "lg";
export type TextareaState = "default" | "error" | "success";
export type TextareaResize = "none" | "vertical" | "both";

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  size?: TextareaSize;
  state?: TextareaState;
  /** Shortcut for state="error" + aria-invalid="true". */
  invalid?: boolean;
  /** Show character counter anchored bottom-right of the wrapper. */
  showCount?: boolean;
  /** Auto-grow height to fit content (within optional maxRows). */
  autoSize?: boolean;
  /** Cap auto-growing height to this many lines (only with autoSize). */
  maxRows?: number;
  /** Native CSS resize. Default: "vertical" (or "none" when autoSize). */
  resize?: TextareaResize;
  /** Class applied to the wrapper <div>. */
  className?: string;
  /** Alias for className (clarity in form composers). */
  wrapperClassName?: string;
  /** Class extra applied to the inner <textarea> (advanced case). */
  textareaClassName?: string;
}

export const Textarea: React.ForwardRefExoticComponent<
  TextareaProps & React.RefAttributes<HTMLTextAreaElement>
>;
```

Mirrors Input's contract (`size`, `state`, `invalid`, `className`/`wrapperClassName`/`textareaClassName`) — consumers who already know Input get Textarea for free. Drops slot family (icons/prefix/suffix) since multi-line surfaces don't host inline adornments in any platform precedent; this divergence vs Input is intentional and documented in the JSDoc.

## CVA wrapper variants

Three structural pieces:

1. **`wrapperVariants`** (CVA): outer `<div>` providing border + focus ring + disabled state. Mirrors Input's wrapper but with size = min-height instead of fixed height.
2. **`<textarea>` inner** (no CVA, just composed classes): the native control, full-width inside the wrapper, with padding/font-size derived from size, `bg-transparent`, `outline-none`. The wrapper carries border + focus ring (`focus-within:ring-2`).
3. **Counter** (no CVA, conditional): `<span aria-hidden="true">` absolutely positioned bottom-right, hidden when `showCount` is false.

```tsx
const wrapperVariants = cva(
  [
    "relative inline-flex w-full flex-col",
    "rounded-md border bg-background text-fg",
    "transition-[border-color,box-shadow] duration-150",
    "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
    "data-[disabled=true]:bg-muted data-[disabled=true]:opacity-70 data-[disabled=true]:cursor-not-allowed",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "min-h-[60px] px-2.5 py-1.5 text-[13px]",
        md: "min-h-[84px] px-3 py-2 text-sm",
        lg: "min-h-[112px] px-3.5 py-2.5 text-[15px]",
      },
      state: {
        default: "border-primary",
        error: "border-destructive focus-within:ring-destructive",
        success: "border-signal-green focus-within:ring-signal-green",
      },
    },
    defaultVariants: { size: "md", state: "default" },
  },
);
```

Sizes map to legacy reference: sm 60px / 13px font, md 84px / 14px (default), lg 112px / 15px.

## `autoSize` strategy

Pure-CSS `field-sizing: content` is too recent (Chromium 123+, Firefox not yet shipped as of 2025) — we use the JS approach as the stable baseline and let modern browsers benefit from the CSS property as progressive enhancement.

```tsx
React.useLayoutEffect(() => {
  if (!autoSize || !innerRef.current) return;
  const el = innerRef.current;
  el.style.height = "auto";              // reset to measure scrollHeight
  const newHeight = maxRows
    ? Math.min(el.scrollHeight, lineHeightFor(size) * maxRows + paddingFor(size))
    : el.scrollHeight;
  el.style.height = `${newHeight}px`;
}, [value, defaultValue, autoSize, maxRows, size]);
```

Trade-offs:
- **Why `useLayoutEffect`**: avoids one frame of visual jump after content change.
- **Why ref-merge with `forwardRef`**: consumers expect `ref.current?.focus()` to work; we keep external ref while reading our own.
- **`maxRows` cap**: prevents the textarea from growing past the viewport in long content. `lineHeightFor(size)` and `paddingFor(size)` are pure constants derived from the size scale.
- When `autoSize` is on, `resize` defaults to `"none"` (the manual handle conflicts). The consumer can still pass `resize="vertical"` explicitly to override.

## Counter strategy

`showCount` opt-in renders `<span aria-hidden="true">` after the `<textarea>` inside the wrapper, absolutely positioned bottom-right (`absolute bottom-1.5 right-2.5`). When `maxLength` is provided, format is `{current} / {max}`; otherwise just `{current}`.

Decisions:
- **Why `aria-hidden`**: the counter is purely visual feedback; screen readers get the native `maxLength` enforcement plus the consumer's own `aria-describedby` to a sibling status if they want SR notice. Putting it in the a11y tree creates noise.
- **Internal state when uncontrolled**: when the consumer passes `defaultValue` only (uncontrolled), we read the textarea's current `value` from the ref on every change. When controlled, we read from `value` prop directly. Both paths converge in `currentLen = String(displayValue).length`.
- **`maxLength` boundary**: the native attribute is always passed through to the `<textarea>`, so the browser enforces the cap (typing is blocked at the limit). The counter just reflects.

## Disabled state

`data-disabled="true"` on the wrapper + native `disabled` on the `<textarea>`. Wrapper visual: `bg-muted opacity-70 cursor-not-allowed`. Mirrors Input's disabled exactly.

## Accessibility

- Wrapper is `<div>` — not focusable; only the `<textarea>` is.
- `<textarea>` accepts all native props via `...rest`, including `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-required`, `id`. Consumers wire labels via `<label htmlFor>` or `aria-label`.
- `invalid={true}` sets `aria-invalid="true"` on the `<textarea>`.
- `focus-within:ring-2 focus-within:ring-ring` on the wrapper reflects focus state visually (consistent with Input).
- `prefers-reduced-motion`: the `transition-[border-color,box-shadow]` respects the OS preference automatically via Tailwind (no `transition-all`).

## Brand × Notion alignment

Tokens consumed (all already in `ui_kit/styles/index.css` and aligned with Notion via #226):

| Token | Light | Dark | Notion role |
|-------|-------|------|-------------|
| `bg-background` | `#FFFFFF` | Surface 2 `#28282F` | Surface |
| `border-primary` | Violet 500 `#4F186D` | Orange 500 `#E07400` | Default border (CTA-aware) |
| `border-destructive` | Signal Red `#FF3131` | Signal Red `#FF3131` | Error |
| `border-signal-green` | Signal Green `#00BF63` | Signal Green `#00BF63` | Success |
| `text-fg` | Violet 500 | Mono White | Primary text |
| `placeholder:text-fg-muted/70` | Gray 500 @ 70% | Gray 100 @ 70% | Placeholder |
| `focus-within:ring-ring` | Violet 500 | Orange 500 | Focus indicator (CTA-aware) |

No new token introduced. No divergence anticipated. Notion MCP query at Gate 1 confirms (recorded in this section once executed).

## Implementation order (Phase 4 steps)

1. Rewrite `ui_kit/components/textarea/index.tsx` (CVA + autoSize + counter + Input parity).
2. Create `ui_kit/components/textarea/Textarea.test.tsx` with ≥ 20 behavioral tests + jest-axe matrix.
3. Rewrite `ui_kit/components/textarea/Textarea.stories.tsx` (Default, Sizes, States, WithCounter, AutoSize, ResizeOptions, Disabled, InsideForm, DarkTheme).
4. Create `docs/src/previews/textarea.tsx` (preview rows).
5. Create `docs/src/previews/textarea-live.tsx` (react-live snippet).
6. Create `docs/src/pages/componentes/textarea.astro`.
7. Edit `docs/src/pages/index.astro` — add `"Textarea"` to `MIGRATED` Set (alphabetical).
8. Run `npm run typecheck && npm run lint && npm run test -- textarea && npm run build && npm run docs:build` (each step green before advancing).
9. Run full `npm run test` once locally before Phase 7.

## ADRs

None. The implementation reuses existing tokens, existing CVA pattern, existing test/stories/docs scaffolding from Input/Radio. No architectural decision worth recording — every choice is dictated by existing project precedent.

## Stacked PR Decomposition

Not applicable. Single atomic PR per Plan #55 DoD ("PRs Estimados: 1 — PR atômico único conforme `lex-agent-planning`"). Decision Checklist of `codex-stacked-prs` returns 0 high signals — all work is intra-component, single Forms category, no external API surface to phase, no infra-first ordering.

## Known parity divergences vs Input (documented, not violations)

1. **Slot family dropped** — Textarea does not expose `leftIcon`, `rightIcon`, `prefix`, `suffix`. Multi-line surfaces don't host inline adornments. Documented in JSDoc + Architecture.
2. **Inner class prop renamed** — Input uses `inputClassName`, Textarea uses `textareaClassName` (semantic match to the element being targeted). The wrapper's `className`/`wrapperClassName` alias pair is identical to Input.
3. **`size="md"` height differs** — Input is `h-[38px]` (fixed), Textarea is `min-h-[84px]` (grows). Semantically equivalent: both communicate the default Forms density.
4. **`resize` and `autoSize`** — Textarea-only props. Input is intrinsically single-line; the props have no Input parallel.

## Gap report

None at design time. Phase 4 implementation may surface visual gaps during the side-by-side playground comparison; if so, those become tangential findings per `lex-no-silent-tech-debt` with 3 explicit options surfaced to Fernando.

## Argos round 1 fixes — addendum 2026-05-28

After Fernando's playground approval, Argos's first review on PR #231 surfaced 4 WARNINGs that the `gemini-code-assist[bot]` had flagged inline (no axis blocked). Fernando chose option **(a) Expand the current Plan scope and fix in this PR** per `lex-no-silent-tech-debt` (Tangential Finding Protocol). The design itself is unchanged; the fixes are corrections discovered in review and amended into the single commit. The 4 fixes:

- **Fix 1 (perf — `ui_kit/components/textarea/index.tsx:161-164`)** — `mergeRefs(innerRef, ref)` is now wrapped in `useMemo([ref])` and stored in `composedRef`. The inline call created a new ref callback every render, causing React to detach/reattach the ref on every commit. The memoization preserves the callback across renders when `ref` is stable.
- **Fix 2 (runtime defect — `ui_kit/components/textarea/index.tsx:214-219`)** — the `autoSize` cap math no longer adds `VERTICAL_PADDING_BY_SIZE[size]`. `scrollHeight` is measured on the inner `<textarea>` (which has `p-0`); the wrapper padding lives on the outer `<div>` and must not be added on top. Without the fix the textarea over-counts by 12–20px in real browsers (AC-5 passed in jsdom only because `scrollHeight` returns 0 there). The `VERTICAL_PADDING_BY_SIZE` constant was removed entirely — no other consumer. New behavioral test `autoSize com maxRows usa cap = scrollHeight quando dentro do limite (sem padding)` mocks `scrollHeight` to a known value and asserts `style.height` equals that value, not value + padding.
- **Fix 3 (edge case — `ui_kit/components/textarea/index.tsx:201-211`)** — the `useLayoutEffect` now handles the `autoSize: false` branch by zeroing `style.height` and `style.overflowY`. Without it, toggling `autoSize` from `true` to `false` leaves stale dimensions on subsequent renders. New behavioral test `autoSize ao desligar limpa style.height/overflowY inline` exercises the toggle.
- **Fix 4 (visual — `ui_kit/components/textarea/index.tsx:251`)** — the inner `<textarea>` receives `pb-5` when `showCount` is true. The counter chip is absolutely positioned at `bottom-1.5 right-2.5` over the wrapper; without bottom padding on the textarea, the chip overlaps the last line of typed content. Visual regression is gated by the Ubuntu/CI-rendered baselines (project rule); the behavioral coverage that `showCount` does not break a11y or character counting is unchanged.

Each fix is exercised by tests in `Textarea.test.tsx` (Fix 2 + Fix 3 add 2 new tests; Fix 1 + Fix 4 are guarded by the unchanged existing suite + jest-axe + visual baselines). All 5 local gates run green after the fixes.
