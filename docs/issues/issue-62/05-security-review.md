# Phase 5 — Security Review: Migrate Drawer to v0.1.0 DoD

- **Parent Tech Task:** [#62](https://github.com/guardiatechnology/design-system/issues/62)
- **Plan sub-issue:** [#63](https://github.com/guardiatechnology/design-system/issues/63)
- **Brief:** [01-brief.md](01-brief.md)
- **Requirements:** [02-requirements.md](02-requirements.md)
- **Architecture + ADR-012:** [03-architecture.md](03-architecture.md), [../../adr/ADR-012-drawer-v0.1.0-dod-migration.md](../../adr/ADR-012-drawer-v0.1.0-dod-migration.md)
- **Reviewer:** `warrior-athena` (Issue-Driven flow orchestrator) — desk review against the design-system security baseline (`lex-frontend-security` + OWASP Top 10 cheat for UI primitives)
- **Result:** **Approved** — no `blocked` or `changes-required` findings

## Scope of review

The PR adds 1 component primitive (Drawer), 1 test file, 1 stories file, 1 Astro docs page, 2 React previews, 1 ADR, 4 Issue-Driven phase artifacts, deletes 1 component folder (Sheet), updates 1 barrel, updates 1 product component (Sidebar) to consume Drawer instead of Sheet, and removes 1 dependency (`vaul`). No runtime services, no HTTP routes, no event handlers, no auth, no data persistence, no network calls.

| Diff target | Security-relevant? |
|---|---|
| `ui_kit/components/drawer/index.tsx` | UI primitive — review for XSS / `dangerouslySetInnerHTML` / unsafe ref usage |
| `ui_kit/components/drawer/Drawer.test.tsx` | Test-only; runs under Vitest jsdom — no production reach |
| `ui_kit/components/drawer/Drawer.stories.tsx` | Storybook stories — sandbox only; review for hardcoded credentials |
| `docs/src/pages/componentes/drawer.astro` | Docs page (Astro SSG, no runtime) — review for safe rendering |
| `docs/src/previews/drawer.tsx`, `drawer-live.tsx` | Docs previews (react-live) — review for arbitrary code surface |
| `ui_kit/components/sheet/` (delete) | Removes prior surface — review consumer migration coverage |
| `ui_kit/components/sidebar/index.tsx` | Product component consuming Drawer in place of Sheet — review parity |
| `ui_kit/components/index.ts` | Barrel export update |
| `package.json` + `package-lock.json` | Removes `vaul` — review for residual import or transitive risk |
| `docs/adr/ADR-012-*.md` + `docs/issues/issue-62/*.md` | Markdown — no executable surface |

## Findings per OWASP-for-UI checklist

### A01:2021 — Broken Access Control

**Not applicable.** Drawer is a presentational primitive with no notion of user identity or permission. It only renders DOM elements supplied by the consumer; access control is the consumer's concern.

### A02:2021 — Cryptographic Failures

**Not applicable.** No cryptographic operations.

### A03:2021 — Injection (XSS in particular)

- ✅ **No `dangerouslySetInnerHTML`** in `index.tsx` — grep verified (`grep -n "dangerouslySetInnerHTML" ui_kit/components/drawer/index.tsx` returns nothing).
- ✅ **No `innerHTML` assignments.**
- ✅ **All children render via React JSX** — Title, Description, Header, Footer, Close, Content all pass children/className/style through props and React's safe binding.
- ✅ **No `eval` / `new Function`.**
- ✅ **`react-live` in `drawer-live.tsx` is sandboxed to the playground page only** — the same pattern that ships in Dialog, Popover, Tooltip lives in Astro static docs. `LiveProvider` evaluates the provided code string against an explicit `scope` containing only the 9 Drawer + Button names — no `window`, no `document`, no `fetch`. Same risk envelope as the merged Dialog precedent (#257).

### A04:2021 — Insecure Design

- ✅ **Modal contract by default** — `Drawer` re-exports `@radix-ui/react-dialog` `Root` with `modal: true` default. Focus-trap + scroll-lock + `aria-hidden` on outside content prevent the underlying UI from receiving stray interactions while the drawer is open. Mirrors Dialog ADR-010 Decision 1 — accessibility AND security default.
- ✅ **Close button affixed with explicit `aria-label="Close"` + visually-hidden text** — no obscure close affordance that would force a user to click outside or press Escape blindly.
- ✅ **No clickjacking exposure** — the overlay (`fixed inset-0 z-50 bg-guardia-purple-900/60 dark:bg-guardia-gray-900/80 backdrop-blur-sm`) covers the entire viewport at z-50, AND Radix's portal mounts the content above. No transparent surface, no `pointer-events: none` on the overlay that would let a hidden malicious surface receive clicks.

### A05:2021 — Security Misconfiguration

- ✅ **No environment-variable leakage** — the component reads no `process.env`, no `import.meta.env`. The stories and previews ship hard-coded sample strings (e.g., "Bia · Conciliação Bancária"), no secrets.
- ✅ **No CSP-violating inline styles** — the only inline `style` consumed is the `width` / `height` escape-hatch driven by the consumer's props; no runtime injection of arbitrary CSS.

### A06:2021 — Vulnerable and Outdated Components

- ✅ **`vaul` removed from `package.json`** — Drawer was the sole consumer (verified via repo grep). `npm install` regenerated `package-lock.json` and pruned 0 production transitive deps (`vaul` had only React + Radix as peer/transitive — already declared elsewhere).
- ✅ **`@radix-ui/react-dialog ^1.1.15`** — already at the same version Dialog (ADR-010) and AlertDialog use. No new dependency surface.
- ✅ **`class-variance-authority`**, **`lucide-react`**, **`clsx`** — same versions used by Dialog and the rest of the Overlays family. No new dependency surface.
- ⚠️ **`npm install` reported `20 vulnerabilities (16 moderate, 4 high)`** in the existing project tree. None were introduced by this PR — they are pre-existing on `main`. `npm audit` was not run as part of this PR (out of scope for `lex-frontend-security` Rule 7 baseline check; the project's CI handles the audit on `main`).

### A07:2021 — Identification and Authentication Failures

**Not applicable.** No authentication surface.

### A08:2021 — Software and Data Integrity Failures

- ✅ **No dynamic `import()` of remote modules** in the new files.
- ✅ **Vite/Rsbuild static asset import** for the source code displayed in the Astro page (`@ds/components/drawer/index.tsx?raw`) is build-time only — same pattern Dialog uses (ADR-010 reference) and identical to Popover, Tooltip, AlertDialog.

### A09:2021 — Security Logging and Monitoring Failures

**Not applicable.** Frontend primitive — observability is the consuming app's concern. `lex-observability-required` does not bind UI primitives (see Phase 3 architecture: zero new runtime surfaces).

### A10:2021 — Server-Side Request Forgery (SSRF)

**Not applicable.** No outbound network calls from the primitive, stories, or docs page.

## Sheet → Drawer migration security review (Sidebar)

The Sidebar mobile branch previously composed `<Sheet>` + `<SheetContent>` + `<SheetHeader>` + `<SheetTitle>` + `<SheetDescription>`. After migration it composes the canonical Drawer counterparts (`<Drawer>`, `<DrawerContent>`, `<DrawerHeader>`, `<DrawerTitle>`, `<DrawerDescription>`). The migration is **1:1**:

| Aspect | Sheet (before) | Drawer (after) |
|---|---|---|
| Base library | `@radix-ui/react-dialog` | `@radix-ui/react-dialog` (identical) |
| ARIA contract | `role="dialog"` + `aria-modal="true"` | identical |
| Focus-trap, scroll-lock | provided by Radix | provided by Radix |
| `side` prop | `"top" | "right" | "bottom" | "left"` | `"top" | "right" | "bottom" | "left"` (identical) |
| Overlay token | `bg-black/50` (legacy violation of `lex-brand-colors`) | `bg-guardia-purple-900/60 dark:bg-guardia-gray-900/80 backdrop-blur-sm` (compliant) |

The migration **fixes** the prior `lex-brand-colors` violation on the Sidebar mobile drawer overlay (was the same `bg-black/50` Sheet shipped). Net security posture: **improved** — one fewer place in the codebase using a non-tokenized overlay color that could be confused with a malicious overlay impersonation.

## Secrets check

- ✅ `git diff main...HEAD -- '*.json' '*.tsx' '*.ts' '*.astro' '*.md' | rg -i "ghp_|sk-|api[_-]?key|secret|token"` returns no matches in production code.
- ✅ The only `secret`/`token`-shaped strings appear in this very review document and in ADR-012's prose, all describing the migration itself.

## Verdict

**Approved.** All checks pass; the migration retires one legacy token violation (`bg-black/50` in Sheet, transitively in Sidebar mobile) and introduces no new attack surface. Advancing to Phase 6 (Gate 2 quality report).
