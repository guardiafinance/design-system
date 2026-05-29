# Phase 6 — Quality Report (Gate 2): `Toast` v0.1.0 DoD

- **Issue:** [#70](https://github.com/guardiatechnology/design-system/issues/70)
- **Plan:** [#71](https://github.com/guardiatechnology/design-system/issues/71)
- **Conducted by:** `warrior-athena`
- **Date:** 2026-05-29
- **Result:** ✅ **GO**

## 7 Checks

### Check 1 — AC ↔ test traceability (`lex-issue-driven` Rule 3)

✅ **Pass.** Each `it(...)` in `Toast.test.tsx` declares `AC-N:` in its description. The full mapping:

| AC | Tests |
|---|---|
| AC-1 | `AC-1: exports the canonical 9-symbol public surface plus the CVA accessor`; `AC-1: toastVariants is callable with no args (defaults to tone=info)` |
| AC-3 | `AC-3: applies the semantic tone class chain for tone=info/success/warning/error (declarative)` (4 cases via `it.each`); `AC-3: defaults tone to 'info' when prop is omitted` |
| AC-4 | `AC-4: tone classes do not contain hex literals or oklch() values` |
| AC-5 | 4 tests covering polite for info/success and assertive for warning/error |
| AC-6 | `AC-6: ToastClose is a real <button> with aria-label='Fechar' by default`; `AC-6: ToastClose dismisses the toast on click` |
| AC-7 | `AC-7: ToastProvider accepts position prop and mounts viewport with derived classes` |
| AC-8 | `AC-8: useToast() throws a descriptive error outside <ToastProvider>`; `AC-8: dismiss(id) removes the matching toast`; `AC-8: dismissAll() clears every queued and visible toast`; `AC-8: calling toast() with the same id replaces (not duplicates) the existing toast` |
| AC-9 | `AC-9: declarative composition renders without imperative call (using hideViewport)` |
| AC-10 | `AC-10: persistent duration (Infinity) is mapped to a max-safe duration on the Radix root`; `AC-10: duration=0 is treated as persistent (alias compat)` |
| AC-12 | `AC-12: when limit is reached, additional toasts queue and surface after dismiss` |
| AC-13 | `AC-13: ToastTitle and ToastDescription render with the documented classes` |
| AC-14 | `AC-14: ToastAction renders a button with altText for screen readers` |
| AC-15..18 | jest-axe coverage (see Check 7) |
| AC-19 | `AC-19: the imperative + declarative surfaces support the 8 documented story shapes` (story file structurally verified) |
| AC-26 | ADR-014 file present at `docs/adr/ADR-014-toast-v0.1.0-dod-migration.md` with `status: accepted` |

AC-11 (swipe-to-dismiss) is delegated to Radix and exercised via E2E/manual playground — not in unit tests due to jsdom pointer-event limitations. AC-20, AC-23–25, AC-27–29 are structural ACs verified by build commands below.

### Check 2 — Scope creep (`lex-issue-driven` Rule 6)

✅ **Pass.** Diff matches the scope binding table in `03-architecture.md`:

| Arquivo | Match |
|---|---|
| `ui_kit/components/toast/index.tsx` | ✅ created |
| `ui_kit/components/toast/Toast.test.tsx` | ✅ created |
| `ui_kit/components/toast/Toast.stories.tsx` | ✅ created |
| `ui_kit/components/index.ts` | ✅ modified (+1 line) |
| `docs/src/pages/componentes/toast.astro` | ✅ created |
| `docs/src/previews/toast.tsx` | ✅ created |
| `docs/src/pages/index.astro` | ✅ modified (+1 line) |
| `docs/adr/ADR-014-toast-v0.1.0-dod-migration.md` | ✅ created |
| `package.json` | ✅ modified (+1 dep) |
| `package-lock.json` | ✅ modified (autogen) |
| `vitest.setup.ts` | ✅ modified (+17 lines, Radix Toast jsdom pointer-capture stub — justified in Phase 4c notes) |
| `docs/issues/issue-70/0[1-6]-*.md` | ✅ Phase artifacts |

No file outside this table.

### Check 3 — `lex-observability-required`

✅ **Pass (N/A).** Toast is a client-side UI primitive with no HTTP endpoint, event consumer, or background job. The Lex applies to runtime surfaces emitting traces/metrics/structured logs — Toast does not introduce one.

### Check 4 — Tests pass + coverage

✅ **Pass.** `npm run test` reports:

```
Test Files  34 passed (34)
     Tests  1153 passed (1153)
  Duration  ~28s
```

Toast tests specifically: **33 passing**, including 7 axe-in-themes tests (1 default + 4 tones + 1 with-action + 1 assertive). Each axe test runs in both `light` and `dark` themes via `axeInThemes` — totaling 14 axe invocations.

### Check 5 — `lex-logging-decorator`

✅ **Pass.** No `console.log`, `console.warn`, `console.error`, or `print` in `ui_kit/components/toast/index.tsx`. Lint passes (0 errors).

### Check 6 — Types (`lex-frontend-typing`)

✅ **Pass.** `npm run typecheck` (= `tsc -p tsconfig.test.json --noEmit` strict) reports 0 errors. No unjustified `any` in the new files. The only `as unknown as` patterns are scoped to the jsdom stubs in `vitest.setup.ts` (jsdom doesn't expose typed interfaces for Element prototype patches).

### Check 7 — Performance / a11y

✅ **Pass.**

- **Build:** `npm run build` (rslib ESM): `dist` size 402.7 kB total / 101.6 kB gzipped (+ ~3 kB attributable to `@radix-ui/react-toast` itself).
- **Docs build:** `npm run docs:build` (Astro): 32 pages built in 18.72s, including the new `/componentes/toast/` page (109ms render).
- **A11y:** 7 `axeInThemes` tests × 2 themes = 14 axe invocations, all green (0 violations).
- **Lint:** 0 errors, 28 warnings — **all warnings are pre-existing** in `multi-select`, `navbar`, `theme-toggle` files. The Toast diff introduces 0 lint warnings.

## Lex compliance summary

| Lex | Verdict |
|---|---|
| `lex-issue-driven` | ✅ Phase artifacts at canonical path `docs/issues/issue-70/`, AC↔test traceability, ADR at `docs/adr/`, Gate 1 + Gate 2 honored. |
| `lex-frontend-typing` | ✅ tsc strict clean. |
| `lex-frontend-security` | ✅ JSX safe binding, no secrets, no localStorage, validated input types. |
| `lex-frontend-accessibility` | ✅ WCAG 2.1 AA via axeInThemes light + dark; role mapping per tone; aria-label on close. |
| `lex-frontend-testing` | ✅ Accessible queries (`getByRole`, `findByText`); mocks restricted to fake timers (used only where avoidable, eliminated when not). |
| `lex-design-system-library` | ✅ Component lives in `@guardia/design-system`; no reimplementation of primitives. |
| `lex-brand-colors` | ✅ Semantic tokens only; no hex literals; consumes the `--info|success|warning|danger-*` chain from ADR-011. |
| `lex-brand-typography` | ✅ Inherits `font-sans` from the project Tailwind preset (Poppins → Roboto fallback already wired). |
| `lex-conventional-commits` | Will apply at Phase 7 commit (`feat(toast): ...`). |
| `lex-small-commits` | Single atomic commit at Phase 7. |
| `lex-no-silent-tech-debt` | ✅ No `# TODO`, `# FIXME`, `# follow-up`, or untracked debt markers in the diff. The only `# WHY` comments are explanatory lineage (`generateId` choice, `duration` mapping). |
| `lex-no-plans-under-docs` | ✅ No plan file under `docs/`. |
| `lex-dry` | ✅ Toast reuses tokens from ADR-011 (no duplication); reducer logic is the canonical locus. |

## Decision

✅ **GO** — proceed to Phase 7 (PR).
