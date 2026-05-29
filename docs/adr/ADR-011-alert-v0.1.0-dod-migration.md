# ADR-011 — Migrate Alert to v0.1.0 DoD (Overlays/Feedback parity)

- **Status:** accepted
- **Date:** 2026-05-29
- **Deciders:** @seguim (CODEOWNER), `warrior-athena` (Issue-Driven flow orchestrator)
- **Precedents:** ADR-005 (Popover), ADR-006 (Menu), ADR-007 (Tooltip)
- **Issue:** [#56](https://github.com/guardiatechnology/design-system/issues/56)
- **Plan:** [#251](https://github.com/guardiatechnology/design-system/issues/251)

## Context

`Alert` is the last legacy holdout in the Overlays/Feedback lane. The current `ui_kit/components/alert/index.tsx` is a 60-line shadcn baseline with only `default | destructive` variants — no tone matrix, no `AlertActions`/`AlertClose`, no docs page, not in the `MIGRATED` set. The reference at `ux_references/ui_kits/components/Alert/` ships **info | success | warning | danger** tones with icon, title, body, action slot, and dismiss button — that is the v0.1.0 DoD contract owed to Overlays parity.

Two architectural decisions surfaced during Phase 3 that justify recording an ADR rather than a silent migration:

1. **Tone token family expansion.** The CSS variables `--success` / `--success-soft` (and `warning` / `info` / `danger` analogues) exist in `ui_kit/styles/index.css` (legacy declaration), but are NOT exposed under `@theme inline`, so utility classes like `bg-success-soft` are not available. Alert must consume these tones via semantic tokens (mandated by `lex-brand-colors`, `lex-design-system-library`), which forces expansion of the `@theme` block.
2. **Dark-theme parity.** The `*-soft` variables are hardcoded light colors (`#D6F5E6`, `#FFF3CE`, etc.) with NO dark-theme override. Rendering `#D6F5E6` over the gray-900 base in dark mode produces an unreadable banner — light tint swamping the surface, mono-white text dropping below 1.5:1. The v0.1.0 DoD requires Default + Tones to pass `axeInThemes` (light AND dark) without violations; that requires per-tone dark overrides.

Both decisions extend the design-system token contract. They are not Alert-local — once landed, every future component that consumes a tone (e.g., `Toast`, `Banner`, future `InlineMessage`) benefits.

## Decision

Migrate Alert to v0.1.0 DoD with the **Popover/Tooltip recipe (ADR-005 / ADR-007)** adapted for an inline non-Radix primitive:

1. **6-export public surface** — `Alert`, `AlertIcon`, `AlertTitle`, `AlertDescription`, `AlertActions`, `AlertClose`. The CVA accessor `alertVariants` and type aliases `AlertTone` / `AlertSize` are also exported for higher-order composition. No Radix base — Alert is inline (not transient), so the cost/value of a Radix Primitive is negative.
2. **CVA `tone` matrix** — literal union `"info" | "success" | "warning" | "error"`. The prop name uses `error` (mirroring form-state vocabulary across the catalog: Combobox, Input, Select all use `error` for invalid state). Internally `error` maps to the existing `--danger` / `--danger-soft` token chain (semantic alias, no token rename).
3. **CVA `size` ladder** — `sm | md | lg` with `p-2 / p-3 / p-4` padding and two-rung typography (`text-xs` for `sm`, `text-sm` for `md` and `lg`), aligned with Popover and Tooltip.
4. **Semantic tokens only** — Alert consumes `bg-{tone}-soft`, `border-{tone}`, `text-{tone}-fg`. No hex, no `oklch(`, no hardcoded color literal in `index.tsx`.
5. **Tone token expansion** — `ui_kit/styles/index.css` `@theme inline` block adds:
   - `--color-success: var(--success)` and `--color-success-soft: var(--success-soft)`
   - `--color-success-fg` (new): foreground color with AAA over `--success-soft`
   - same for `warning`, `info`, `danger`
6. **Dark-theme parity** — `:root[data-theme="dark"]` adds:
   - `--success-soft`, `--warning-soft`, `--info-soft`, `--danger-soft` → tinted dark surfaces using `color-mix(in oklab, <signal> 18%, var(--guardia-gray-800))`. The 18% mix keeps the tone recognizable while preserving readable contrast against mono-white text and against the gray-900 page background.
   - `--success-fg`, `--warning-fg`, `--info-fg`, `--danger-fg` → mono-white (per the dark-surface convention already used by `--card-foreground`, `--popover-foreground`, etc.).
   - Light theme `--*-fg` values are deep tones of the same signal (e.g., `--success-fg: #0B5A2E` over `#D6F5E6` = 6.62:1 AAA). Light values inherit the legacy `index.css` palette without churn — the legacy CSS at `ux_references/ui_kits/components/Alert/index.css` had hardcoded foregrounds (`#0B5A2E`, `#7A0E0E`, `#002E6B`, `--yellow-900`) that we tokenize wholesale.
7. **ARIA semantics** — `role="status"` by default (polite live region), `assertive` prop flips to `role="alert"` (assertive). The dismiss button has `aria-label="Fechar"` (Portuguese, overridable).
8. **Controlled / uncontrolled parity** — `open` + `defaultOpen` + `onOpenChange` mirroring the Popover/Tooltip pattern. When closed, the component returns `null` (no animated unmount — Alert is inline, not transient).
9. **A11y coverage** — `axeInThemes` over Default + 4 tones + WithClose + Assertive across `light` AND `dark` themes (12 jest-axe invocations across the test file).
10. **ADR `accepted` from creation** — the atomic feat commit carries migration code + tokens + ADR + docs together. No `proposed → accepted` flip (avoids the dual-commit pattern flagged 🟡 by Argos on PR #237).

## Consequences

### Positive

- Alert reaches v0.1.0 DoD parity with Popover, Menu, Tooltip — same export style, same token vocabulary, same test rigor.
- The tone token family (`--color-success-*`, `--color-warning-*`, `--color-info-*`, `--color-danger-*`) becomes first-class in `@theme inline`. Future inline-feedback components (Toast, Banner, InlineMessage) consume the same chain without reopening the question.
- Dark-theme parity for soft tones is solved at the token level once, not per component.
- AC ↔ test traceability matrix passes Gate 2 with the same format as Tooltip (24 ACs → ≥ 20 tests with explicit `AC-N:` labels).

### Negative

- Existing consumers of the old `default | destructive` Alert API (if any internal product consumer existed) would need a migration. **Verified scope:** the public catalog (docs/src/pages/index.astro `MIGRATED` Set) does not list Alert yet, so no consumer is contracted to the legacy surface. No migration shim needed.
- The dark-theme `color-mix(in oklab, ...)` requires browser support for `oklab` color space (Chrome 111+, Safari 16.4+, Firefox 113+) — all already required by the Tailwind v4 baseline.

### Neutral

- Two file rewrites (`index.tsx`, `index.css` tone block), 2 new test/story files, 2 new docs files, 1 ADR. No new npm dependencies, no infra changes.

## Alternatives considered

1. **Keep `default | destructive` and only add CVA `size`.** Rejected — half-migrations create more debt; the v0.1.0 DoD is an all-or-nothing contract per Plan #251 and ADR-005/006/007 precedent.
2. **Use `danger` instead of `error` as the prop name.** Rejected — the form-state vocabulary across the catalog (Combobox, Input, Select) is `error`; aligning Alert reduces cognitive load. Internally the token alias still points to `--danger` / `--danger-soft` (semantic alias, no token rename).
3. **Build Alert atop `@radix-ui/react-alert-dialog`.** Rejected — `AlertDialog` is modal, Alert is inline. The Radix primitive does not match the rendering or semantics. Inline live regions (`role="status"` / `role="alert"`) handle accessibility natively.
4. **Hardcode dark-mode tinted soft colors as new hex literals (e.g., `#0E2E1D` for success-soft-dark).** Rejected — duplicates the legacy `--signal-*` palette intent, introduces drift the next time we tune the brand. `color-mix(in oklab, <signal> 18%, gray-800)` derives the dark soft from the same signal anchor, so a future brand update to `--signal-green` propagates automatically.
5. **Defer dark-theme parity to a follow-up Plan.** Rejected — AC-4 / AC-15..18 explicitly require axeInThemes(light + dark) at Gate 2. Deferring would block the migration's quality gate.

## Implementation note (acceptance criteria mapping)

| ADR clause | Plan AC |
|------------|---------|
| 1. 6-export surface | AC-1, AC-7..AC-11 |
| 2. Tone matrix | AC-3, AC-4 |
| 3. Size ladder | AC-6 |
| 4. Semantic tokens only | AC-3, AC-4 (`lex-design-system-library`, `lex-brand-colors`) |
| 5. Token family expansion | AC-4 (tokens), AC-21 (consumed in docs) |
| 6. Dark-theme parity | AC-4, AC-15..AC-18 |
| 7. ARIA semantics | AC-5, AC-11 |
| 8. Controlled / uncontrolled | AC-12, AC-13 |
| 9. axeInThemes coverage | AC-15..AC-18 |
| 10. ADR accepted at creation | AC-24 |
