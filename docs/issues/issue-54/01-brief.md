# Phase 1 — Brief: Textarea v0.1.0 DoD migration

## Source

- **Parent Issue:** [#54](https://github.com/guardiatechnology/design-system/issues/54) — `feat(textarea): migrate Textarea to v0.1.0 DoD`
- **Plan sub-issue:** [#55](https://github.com/guardiatechnology/design-system/issues/55) — `Plan: migrate Textarea to v0.1.0 DoD`
- **Author / assignee:** @fernandoseguim
- **Label:** `evolvability ♻️`
- **Category:** Forms (per `@guardia/design-system` v0.1.0 catalog)

## Current state (baseline read on `main`)

- `ui_kit/components/textarea/index.tsx` — exists as a minimalist baseline (`React.forwardRef` wrapping `<textarea>` with a single hardcoded Tailwind class string). No CVA, no sizes, no states, no autoSize, no character counter, no Input-parity API.
- `ui_kit/components/textarea/Textarea.stories.tsx` — exists with only `Default`, `WithValue`, `Disabled` — no light/dark coverage, no states matrix, no `DarkTheme` story.
- `Textarea.test.tsx` — **missing** (no test file at all).
- `docs/src/pages/componentes/textarea.astro` — **missing**.
- `docs/src/previews/textarea.tsx` + `docs/src/previews/textarea-live.tsx` — **missing**.
- `MIGRATED` Set in `docs/src/pages/index.astro` — `Textarea` is **not** in the Set (lines 678-700; absent between `Spinner` and the next entry).
- Export in `ui_kit/components/index.ts` — already present (line 45 — `export * from "./textarea";`). No action.

## Canonical visual reference

Legacy bundle snapshot (`ux_references/ui_kits/components/Textarea/`):
- `Textarea.playground.html` — playground with 4 sections: Tamanhos (sm/md/lg), Estados (default/error/success/disabled), Controlada · com contador (`showCount` + `maxLength`), Observação interna · sem resize (`resize="none"`).
- `index.tsx` — reference API: `size: "sm" | "md" | "lg"`, `state: "default" | "error" | "success"`, `invalid?: boolean`, `showCount?: boolean`, `resize?: "none" | "vertical" | "both"`, plus `rows`, `maxLength`. Wraps `<textarea>` in `<div className="grd-textarea-wrap">` to anchor an absolute-positioned counter.
- `index.css` — sizing: sm 60px min-height + 13px font + 8/11 padding; md 84px + 14px + 10/13; lg 112px + 15px + 12/15. States use `--violet-500` focus ring (default), `--signal-red` (error), `--signal-green` (success). Counter at `position: absolute; right: 10px; bottom: 8px`.

## Parity with Input (sibling component in Forms)

Input (already at v0.1.0 DoD) exposes: `size: "sm" | "md" | "lg"`, `state: "default" | "error" | "success"`, `invalid?: boolean`, `disabled`, plus slots (`leftIcon`/`rightIcon`/`prefix`/`suffix`) that are **not** applicable to Textarea (multi-line surfaces). For Textarea the slot family is dropped and replaced with:

- `showCount?: boolean` — opt-in character counter, anchored bottom-right inside the wrapper.
- `autoSize?: boolean` — grows the textarea height with content (within an optional `maxRows`), preserving min-height per size.
- `resize?: "none" | "vertical" | "both"` — controls the `resize` CSS property; default `vertical` (legacy) or `none` when `autoSize` is on.

`#54` body explicitly calls out: *"Paridade com Input (sizes, states) + autoSize opcional + contador de caracteres."* — so the alignment above is mandatory.

## Notion context

- **Branding (Notion)** — source of truth for colors, typography, focus ring and CTA hierarchy. Already mirrored in `lex-brand-colors`, `lex-brand-typography`, `ui_kit/styles/index.css` (semantic tokens). Tokens already used by Input (`border-primary`, `border-destructive`, `border-signal-green`, `focus-within:ring-ring`, `bg-background`, `text-fg`, `placeholder:text-fg-muted/70`) extend to Textarea with no new token introduced. AC will validate Notion alignment but no divergence is anticipated since #226 (token inversion for dark CTA) is already merged.

## Unknowns / decisions deferred to Phase 3 (architecture)

1. **`autoSize` implementation strategy** — pure CSS (`field-sizing: content`, very recent) vs JS measuring `scrollHeight` and writing `style.height`. Phase 3 will pick JS approach for cross-browser stability while polyfilling `field-sizing` as progressive enhancement.
2. **Counter position when `resize !== "none"`** — the legacy CSS pins the counter to `bottom: 8px`, but with `resize="vertical"` the user's drag handle overlaps. Phase 3 will move the counter to a sibling-after element (outside the resize handle's hit area) when `resize` is "vertical" or "both".
3. **Slot family** — explicitly **dropped** vs Input (multi-line surface does not host inline icons / prefix / suffix in any platform precedent). Phase 3 records this divergence explicitly.

## Out of declared scope (per #54)

- Non-related refactorings.
- Token additions beyond what Textarea strictly needs (none — reuses Input's surface tokens).
- Release / tag / changelog — owned by `warrior-janus`.
- Visual baselines regeneration unless `regenerate-baselines` label is added to the PR.
- Anything outside `ui_kit/components/textarea/**`, `docs/src/pages/componentes/textarea.astro`, `docs/src/previews/textarea*.tsx`, and the minimal touch to `docs/src/pages/index.astro` to add `Textarea` to `MIGRATED`.

## Pre-conditions for the flow

- ✅ Parent Issue #54 has approved template (`feature-request` per body shape), labels (`evolvability ♻️`), Issue Type (Feature — inherited from template), assignee (@fernandoseguim), and answers Why/What/How (per `lex-issue-quality`).
- ✅ Plan #55 carries the DoD (executable spec), labels (`evolvability ♻️` + `status: todo`), assignee (@fernandoseguim), and references parent #54.
- ✅ Worktree `.worktrees/54-textarea/` created from `origin/main`, branch `feat/54-textarea` per `lex-git-branches` and `lex-git-worktrees`.
- ✅ Switch parallel work in `.worktrees/52-switch/` is on a separate branch — no cross-contamination.
- ✅ Visual reference present in `ux_references/ui_kits/components/Textarea/`.

Advancing to Phase 2 — Requirements.
