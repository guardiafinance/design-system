# Phase 3 — Architecture: Input v0.1.0 DoD closeout

> Gap analysis of `Input` against the Plan #47 DoD. Input is foundational (composed by DatePicker trigger, Combobox trigger, FormLayout fields, FileUpload file-name display). The component is mature — this Plan closes the remaining checklist items, not a rewrite.

## Scope (components / files touched)

| File | Change | Rationale |
|------|--------|-----------|
| `ui_kit/components/input/Input.stories.tsx` | **Modify** — add `DarkTheme` story matrix at the end of the file | Parity with Avatar / IconButton / ButtonGroup / Button / Checkbox / DatePicker / Combobox patterns (AC-3). |
| `ui_kit/components/input/input.test.tsx` | **Modify** — extend behavioral tests to fill DoD gaps (`defaultValue`, `readOnly`, `required`, `maxLength`/`minLength`/`pattern`, `onBlur`/`onFocus`, `aria-describedby` with description, `tel`/`url`/`search` types, `ref.focus()`, controlled vs uncontrolled, autocomplete). Annotate ALL existing + new tests with `AC-N` traces. Extend `axeInThemes` coverage to: with description, disabled, readOnly, one type variant. | AC-5..AC-8 (≥ 20 tests floor already met; close DoD checklist coverage). |
| `docs/issues/issue-47/01-brief.md`, `02-requirements.md`, `03-architecture.md`, `05-security-review.md`, `06-quality-report.md` | **Create** — flow artifacts per `lex-issue-driven` Rule 5. | Traceability. |

**Not touched** (declared out of scope):
- `ui_kit/components/input/index.tsx` — implementation is mature; no behavior or signature changes.
- `docs/src/pages/componentes/input.astro`, `docs/src/previews/input.tsx`, `docs/src/previews/input-live.tsx` — playground page already complete (BasicRow, WithIconsRow, PrefixSuffixRow, SizesRow, StatesRow, DisabledRow, FormSubmitRow, live editor, Props table, A11y section, source viewer).
- `docs/src/pages/index.astro` — Input already in `MIGRATED` set.
- Tokens (`--primary`, `--ring`) — owned by Plan #208.
- Composer components (DatePicker / Combobox / FormLayout / FileUpload) — own Plans (#43, #45 in parallel).

## Current state assessment

| Plan #47 DoD line | Current state | Action |
|---|---|---|
| `npm run dev:all` boots Storybook + Astro | Both servers boot; `/componentes/input` renders 8 sections + live playground | None — verify at Phase 6. |
| Storybook stories cover Default + main variants in light + dark | 10 stories present (Default, WithLeftIcon, WithRightIcon, WithPrefix, WithSuffix, PrefixAndSuffix, Sizes, States, Currency, SearchInput). Light/dark toggle via PR #119 toolbar works for ALL stories. **No `DarkTheme` matrix story** | **Add `DarkTheme` matrix story** (parity with siblings). |
| Playground side-by-side | `docs/src/pages/componentes/input.astro` complete | None. |
| Behavioral tests ≥ 20 OR ≥ 80% coverage; accessible queries; no internal mocks | **23 tests passing**; uses `getByRole`, `getByPlaceholderText`, `getByText`, `getByTestId` (the last only for icon nodes which have no role) | **Extend coverage** to close remaining DoD lines (see test gap matrix below). |
| jest-axe in light AND dark | 3 jest-axe tests via `axeInThemes`: default with label, error+aria-invalid+described, success | **Extend** to: with description (`aria-describedby` for hint), disabled, readOnly, one type variant. |
| Brand × Notion check | Done via Notion MCP (`Branding > Dark Mode` page). | See "Brand check" section below. |
| Visual/functional gap list | — | See "Gap report" section below. |
| Build pipeline green | Last main check green | Verify at Gate 2. |
| Explicit "está bom" from Fernando | — | Captured at Phase 7. |
| PR `Closes #47` | — | Phase 7. |

### Test gap matrix (vs Plan #47 DoD line on behavioral coverage)

| DoD scenario | Already covered (existing test in `input.test.tsx`) | Gap → new test |
|---|---|---|
| Text typing | "aceita placeholder e valor controlado" | — |
| Controlled value | "aceita placeholder e valor controlado" | **Add explicit controlled (`value` + `onChange`) test** |
| Uncontrolled value (`defaultValue`) | — | **Add** |
| `placeholder` | "aceita placeholder e valor controlado" | — |
| `disabled` | "disabled propaga para o input + marca data-disabled" | — |
| `readOnly` | — | **Add** |
| `required` | — | **Add** |
| `type="text"` (default) | implicit (default `getByRole('textbox')`) | — |
| `type="email"` / `"number"` / `"password"` | "respeita type=email/number/password" | — |
| `type="tel"` / `"url"` / `"search"` | — | **Add** |
| `maxLength` | — | **Add** |
| `minLength` | — | **Add** |
| `pattern` | — | **Add** |
| Form integration via `name` + `FormData` | "name e autocomplete passam para o input" (attr only) | **Add** form submit via `FormData` |
| `onChange` | "onChange dispara nas mudanças" | — |
| `onBlur` | — | **Add** |
| `onFocus` | — | **Add** |
| `aria-invalid` (`invalid` shortcut) | "invalid=true aplica border destructive + aria-invalid" | — |
| `aria-describedby` (external preserved) | "aria-describedby preserva valores externos" | **Add** test wiring `aria-describedby` to a real description element |
| Prefix slot | "prefix renderiza com separator border-right" | — |
| Suffix slot | "suffix renderiza com separator border-left" | — |
| `autocomplete` | "name e autocomplete passam para o input" | — |
| `ref` to inner `<input>` | "ref aponta para o <input> (não pro wrapper)" | **Add** `ref.focus()` → `document.activeElement` check (sharpens AC-7) |

Estimated delta: **~13 new tests** added on top of the 23 existing → final count `~36` tests, well above the ≥ 20 floor.

### a11y matrix extension (AC-8)

| Scenario | Existing | Action |
|---|---|---|
| Default with label | yes | Annotate `AC-8 (default with label)` |
| Default empty + filled | partial | Extend existing default test to also assert axe after typing |
| With description (`aria-describedby` → hint) | no | **Add** |
| Error (aria-invalid + described error) | yes | Annotate |
| Success | yes | Annotate (kept as bonus) |
| Disabled | no | **Add** |
| ReadOnly | no | **Add** |
| Type variant (`type="email"`) | implicit (covered by error test, type=email) | Annotate |

## Architectural decisions

No new architectural decision needed. The delta is mechanical:
- The `DarkTheme` story follows the literal pattern used in 6 other reviewed components.
- The test extensions exercise native `<input>` attributes already passed through by the implementation (`...rest`).
- The jest-axe extension uses the existing `axeInThemes` helper unchanged.

**No new ADR required** — no new technology, no deviation from established pattern, no public-API change. (Reaffirms `lex-issue-driven` Rule 4.)

## Brand check (AC-9) — Notion MCP

Source consulted via Notion MCP:
- [`Branding > Cores > Dark Mode`](https://www.notion.so/Dark-Mode-36736f91ebd2812fa9bdf58d8bbac59b) — pulled 2026-05-22 snapshot.

Relevant directive for form fields:
> **Campo de formulário:** fundo Surface 2 (#28282f), borda Surface 3 (#3a3a44), **borda focada Laranja 500**.

Current Input implementation:
- Wrapper background: `bg-background` token → maps to Surface 2 equivalent via `[data-theme="dark"]`.
- Border: `border-border-strong` token → maps to Surface 3 equivalent in dark.
- Focus ring: `focus-within:ring-ring` (uses `--ring` token) + hover `hover:border-action` (action token resolves to Laranja 500 in dark per Tech Task #125 brand-aware migration, PR #145).
- Error state border: `border-destructive` + ring `ring-destructive`. Success: `border-signal-green` + ring `ring-signal-green`. Both signal colors are kept from light to dark per Notion (Verde Sinal mantém, Vermelho Sinal mantém).

**Verdict: no NEW Brand divergence introduced by Input.**

The pre-existing `--primary` / `--ring` focus discussion (whether focus ring should use `action` rather than the current `ring` token, since Notion explicitly says "borda focada Laranja 500" → action) is already routed to **Plan #208**. This Plan does not touch tokens and inherits whatever #208 lands.

## Gap report (AC-10)

| # | Item | Status | Action |
|---|------|--------|--------|
| G1 | `Input.stories.tsx` lacks a `DarkTheme` matrix story (siblings have it) | Visual parity gap | Closed in this Plan. |
| G2 | DoD scenarios not yet covered behaviorally (`readOnly`, `required`, `maxLength`/`minLength`/`pattern`, `onBlur`/`onFocus`, `tel`/`url`/`search` types, explicit controlled vs uncontrolled, `FormData` submit, `ref.focus()`, full `aria-describedby` wiring) | Test coverage gap | Closed in this Plan. |
| G3 | jest-axe matrix does not yet cover description / disabled / readOnly / type variant explicitly | A11y coverage gap | Closed in this Plan. |
| G4 | `--primary` / `--ring` focus-ring divergence vs Notion ("borda focada Laranja 500") | Token gap | Out of scope here — owned by Plan #208. Not surfaced as new divergence (already tracked). |
| G5 | Input does not auto-inject a `<label>`; consumer is responsible (always wraps in `FormLayout.Field` or external `<label htmlFor>`) | Documented behavior, not a gap | Already in Astro page (A11y section) and existing test docstring. |

No tangential findings outside the Plan scope. No items triggering `lex-no-silent-tech-debt` Tangential Finding Protocol.

## Stacked PR Decomposition

**Not decomposed.** Single PR per `lex-agent-planning` and Plan #47 contract ("1 PR atômico único"). Decision Checklist signals (`codex-stacked-prs`) score 0 high-signal items: scope is review-and-close on a single foundational component; total diff ≈ 1 file changed (stories) + 1 file extended (tests) + 5 doc files; no cross-context refactor; no infra change; no security boundary change.

## Delegations

No specialist delegation. Athena handles directly — the delta is mechanical (story + test extensions), within the design-system frontend stack, and below the threshold that would justify delegating to Hephaestus as a separate Phase 4 round. Athena uses the same conventions Hephaestus would (`lex-frontend-testing`, `lex-frontend-accessibility`, `lex-design-system-library`).
