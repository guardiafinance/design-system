# Phase 3 — Architecture: Migrate Drawer to v0.1.0 DoD

- **Parent Tech Task:** [#62](https://github.com/guardiatechnology/design-system/issues/62)
- **Plan sub-issue:** [#63](https://github.com/guardiatechnology/design-system/issues/63)
- **Brief:** [01-brief.md](01-brief.md)
- **Requirements:** [02-requirements.md](02-requirements.md)
- **ADR (canonical record):** [docs/adr/ADR-012-drawer-v0.1.0-dod-migration.md](../../adr/ADR-012-drawer-v0.1.0-dod-migration.md)

## Scope summary

Drawer migrates to v0.1.0 DoD by:

1. Switching base from `vaul` to `@radix-ui/react-dialog` — matches Dialog ADR-010 base; retires the bottom-sheet-only `vaul` semantic.
2. **Absorbing the Sheet baseline** (consolidation precedent: ADR-006 Menu absorbing DropdownMenu + ContextMenu). The current `Sheet` exposes a `side` × Radix Dialog model with no Astro docs/tests/consumers. Drawer becomes the **single canonical side-panel modal** with `side: top | right | bottom | left`.
3. Adopting the canonical 10-export shadcn composition (mirrors Dialog).
4. Driving sizing via a CVA `size` ladder (`sm | md | lg | xl`) that maps to `max-w-*` on `left`/`right` sides and `max-h-*` on `top`/`bottom` sides. Plus a `width` / `height` escape-hatch.
5. Replacing the legacy `bg-black/80` overlay with the Notion-canonical `bg-guardia-purple-900/60 dark:bg-guardia-gray-900/80 backdrop-blur-sm` — same migration Dialog #257 shipped.
6. Removing `vaul` from `package.json` (Drawer was the sole consumer).
7. Producing the full DoD package (tests + stories + Astro page + previews + barrel + MIGRATED + ADR-012).

## Components touched

| File                                                       | Change                                                                      | New runtime surface? |
|------------------------------------------------------------|-----------------------------------------------------------------------------|----------------------|
| `ui_kit/components/drawer/index.tsx`                       | Full rewrite — Radix Dialog base, CVA side × size, semantic tokens          | No (UI primitive)    |
| `ui_kit/components/drawer/Drawer.test.tsx`                 | NEW — ≥ 25 behavioral tests + jest-axe matrix                                | No                   |
| `ui_kit/components/drawer/Drawer.stories.tsx`              | Full rewrite — Default + Sides + Sizes + States + UseCases                  | No                   |
| `ui_kit/components/sheet/`                                 | **DELETE** — consolidated under Drawer (ADR-012 Decision 1)                 | No                   |
| `ui_kit/components/index.ts`                               | Remove `export * from "./sheet"`; keep `export * from "./drawer"`           | No                   |
| `docs/src/pages/componentes/drawer.astro`                  | NEW — canonical 7-section Astro page                                        | No                   |
| `docs/src/previews/drawer.tsx`                             | NEW — BasicRow, SidesRow, SizesRow, StatesRow, UseCasesRow                  | No                   |
| `docs/src/previews/drawer-live.tsx`                        | NEW — LiveDrawerSnippet (react-live)                                        | No                   |
| `docs/src/pages/index.astro`                               | Verify `"Drawer"` is in MIGRATED Set (already at line 691 in Dialog merge)  | No                   |
| `docs/adr/ADR-012-drawer-v0.1.0-dod-migration.md`          | NEW — `status: accepted` inline                                             | No                   |
| `docs/issues/issue-62/01-brief.md`                         | NEW — Phase 1 artifact                                                      | No                   |
| `docs/issues/issue-62/02-requirements.md`                  | NEW — Phase 2 artifact                                                      | No                   |
| `docs/issues/issue-62/03-architecture.md`                  | NEW — this file                                                             | No                   |
| `docs/issues/issue-62/05-security-review.md`               | NEW — Phase 5 artifact                                                      | No                   |
| `docs/issues/issue-62/06-quality-report.md`                | NEW — Phase 6 artifact                                                      | No                   |
| `package.json` + `package-lock.json`                       | Remove `vaul` dependency                                                    | No                   |

**New runtime surfaces:** zero — Drawer is a pure UI primitive (no HTTP endpoint, no event consumer, no background job). `lex-observability-required` does not apply (frontend route-level instrumentation is the app's responsibility, not the design-system primitive's).

## Stacked PR evaluation (per `codex-stacked-prs`)

Decision Checklist signals:

- ❌ Multi-layer architecture — Drawer is a single Radix wrapper + tests + docs + barrel + Sheet retirement, all in the same bounded context
- ❌ Different reviewers per layer — design-system, single reviewer pool (Fernando + Argos)
- ❌ Independent value per layer — the component is useless without its docs/tests, and the Sheet retirement is meaningless without Drawer replacing it
- ❌ Decoupled regression footprints — one feature touched, one ADR

Anti-signals (strong):

- ✅ Single bounded context
- ✅ Single reviewer
- ✅ Same regression footprint (all changes in `ui_kit/components/{drawer,sheet}` + docs + ADR + barrel + package.json)
- ✅ Precedent — every v0.1.0 DoD migration lands as a single PR (Popover #237, Tooltip merged, Dialog #257, Alert merged, ConfidenceIndicator merged, EmptyState merged)

**Result:** single PR — same shape as Dialog #257.

## Stacked PR Decomposition

Not applicable. Decision Checklist returned 0 high signals, 4 strong anti-signals → single PR confirmed.

## ADR-012 inline summary

The full ADR is in `docs/adr/ADR-012-drawer-v0.1.0-dod-migration.md`. Decision summary:

1. **Consolidate Drawer + Sheet under canonical Drawer.** Same pattern as ADR-006 (Menu absorbing DropdownMenu + ContextMenu). Both share `role="dialog" aria-modal="true"` semantics; only the slide-direction differs, which is exactly what the `side` CVA prop expresses. Sheet has zero consumers (verified) — retirement is safe.
2. **Base switch: `vaul` → `@radix-ui/react-dialog`.** Matches Dialog ADR-010 base. `vaul`'s value-add (drag-to-dismiss bottom-sheet) is mobile-specific UX not required by v0.1.0; the v0.1.0 product surface is desktop/tablet-first; if drag UX is later needed, register a new Tech Task.
3. **Side variants: `top | right | bottom | left`.** Mirrors Sheet baseline; extends legacy reference's `right | left` (a forward-looking decision because the consolidation absorbs Sheet's top/bottom semantics). Default `side="right"` matches the legacy reference's default.
4. **Size ladder: `sm | md | lg | xl` (CVA `size`).** Identical width budget to Dialog ADR-010 Decision 2 (24 / 32 / 42 / 56 rem). For `left`/`right`, the rung drives `max-w-*`; for `top`/`bottom`, it drives `max-h-*` (mirrored semantic). Documented in JSDoc + this ADR.
5. **`width` / `height` escape-hatch on `DrawerContent`.** `width` overrides the CVA size's `max-w-*` for horizontal sides; `height` overrides the `max-h-*` for vertical sides. Same `style.maxWidth` / `style.maxHeight` forwarding as Dialog ADR-010 Decision 3.
6. **Overlay token: `bg-guardia-purple-900/60 dark:bg-guardia-gray-900/80 backdrop-blur-sm`.** Notion-canonical brand-palette ramp tokens (Dialog ADR-010 Decision 4). Retires the legacy `bg-black/80`.
7. **ADR-012 status `accepted` from creation (single atomic commit).** Precedent: ADR-007, ADR-010, ADR-011, ADR-013. No `proposed → accepted` flip.
8. **Stacked PRs evaluation: SINGLE PR.** Same Decision Checklist outcome as Dialog #257.

## Delegations

| Phase | Warrior         | Kata                          | Inputs                                                          |
|-------|-----------------|-------------------------------|-----------------------------------------------------------------|
| 4     | warrior-hephaestus | kata-frontend-implement     | brief + requirements + architecture (this doc) + ADR-012        |

Hephaestus produces:

- `ui_kit/components/drawer/index.tsx` (rewrite — `@radix-ui/react-dialog` + CVA + semantic tokens, 10 exports, ≈ 350 lines following the Dialog ADR-010 recipe).
- `ui_kit/components/drawer/Drawer.test.tsx` (NEW — ≥ 25 behavioral tests + jest-axe matrix on Default + each of the 4 sides, light + dark).
- `ui_kit/components/drawer/Drawer.stories.tsx` (rewrite — Default, Sides, Sizes, States, UseCases, Destructive, LongContent, Controlled, WidthOverride).
- Deletes `ui_kit/components/sheet/` directory.
- `docs/src/pages/componentes/drawer.astro` (NEW — 7 sections).
- `docs/src/previews/drawer.tsx` (NEW — BasicRow, SidesRow, SizesRow, StatesRow, UseCasesRow).
- `docs/src/previews/drawer-live.tsx` (NEW — LiveDrawerSnippet, react-live + CodeEditor).
- Updates `ui_kit/components/index.ts` (remove Sheet export; Drawer export already exists).
- Verifies `docs/src/pages/index.astro` MIGRATED Set has `"Drawer"`.
- Updates `package.json` + `package-lock.json` (remove `vaul`).
- Runs the full pipeline (`npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build`) and confirms green.

## Lexis applied

- `lex-design-system-library` — Drawer + Sheet consolidation is the canonical resolution of the "two primitives, one semantic" gap. Single import path.
- `lex-brand-colors` — overlay token migrated to Notion-canonical brand palette; no hex.
- `lex-brand-typography` — Poppins for all text (default semantic class tokens already inherit this).
- `lex-frontend-typing` — strict TS; CVA `VariantProps` types exported; no `any`.
- `lex-frontend-accessibility` — `role="dialog"` LANDMARK preserved (region rule NOT disabled); focus-trap + scroll-lock via Radix; keyboard activation; visible focus ring.
- `lex-frontend-testing` — accessible queries; mocks only at boundaries (none needed); behavioral tests; jest-axe.
- `lex-frontend-security` — no `dangerouslySetInnerHTML`; no client secrets; trigger labels via `aria-label` or rendered text (no string-injected HTML).
- `lex-no-silent-tech-debt` — tangential findings (AlertDialog still on `bg-black/80`) flagged in brief, ADR, and PR body; no silent TODO/FIXME markers; no `## Out of scope (to revisit)` without trackable Issue.
- `lex-conventional-commits` + `lex-small-commits` + `lex-signed-commits` — single atomic signed commit.
- `lex-issue-driven` Rule 3 — `AC-N` traceability in every test name.
- `lex-issue-driven` Rule 4 — ADR-012 produced for the relevant architectural decision (consolidation + base switch + overlay migration).
- `lex-issue-driven` Rule 5 — all artifacts under `docs/issues/issue-62/` per ADR-009 canonical path.

## Risks + mitigations

| Risk                                                                                       | Mitigation                                                                                                                                                                                          |
|--------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Sheet retirement breaks an undetected external consumer                                    | Repo grep confirmed zero consumers (only barrel re-export). If a downstream surface needs the bottom-sheet UX, ADR-012 explicitly documents the migration path (`<Drawer side="bottom">` is parity). |
| Switching from `vaul` to Radix Dialog removes drag-to-dismiss UX                            | `vaul` drag UX is mobile-specific and not currently used by v0.1.0 surfaces. If needed later, open a new Tech Task to compose a drag-aware wrapper on top of Drawer. Recorded in ADR-012.            |
| Visual baselines for Drawer's old vaul-based render differ wildly from the new Radix render | Per `feedback_visual_regression_ubuntu_sot.md` — baselines are Ubuntu/CI source of truth; Fernando applies `regenerate-baselines` post-visual-approval. AC-38 documents this; author does not auto-apply. |
| Radix Dialog's scroll-lock conflicts with focus-trap on long-content drawers                | Radix wires this natively; the LongContent story exercises the path; AC-15 + tests assert behavior.                                                                                                  |
| Removing `vaul` from `package.json` accidentally breaks an unrelated import                | Repo grep + `npm run typecheck` catches any residual `import "vaul"` outside `ui_kit/components/drawer/`. Pre-commit pipeline (`AC-37`) acts as the safety net.                                       |

## Delegation handoff to Hephaestus

Hephaestus receives:
- This architecture doc + the brief + requirements
- ADR-012 (full text in `docs/adr/ADR-012-drawer-v0.1.0-dod-migration.md`)
- Reference precedent: `ui_kit/components/dialog/index.tsx` + `Dialog.test.tsx` + `Dialog.stories.tsx` + `docs/src/pages/componentes/dialog.astro` + `docs/src/previews/dialog.tsx` + `docs/src/previews/dialog-live.tsx`
- Legacy reference: `ux_references/ui_kits/components/Drawer/`
- Current Sheet baseline: `ui_kit/components/sheet/index.tsx` (for the `side` × Radix Dialog shape)
- Current Drawer baseline: `ui_kit/components/drawer/index.tsx` (being replaced)

Hephaestus's exit criteria:
- All 39 ACs implementable from the produced artifacts
- Pipeline green
- Commit ready (atomic, signed)
- ADR-012 visible at `docs/adr/ADR-012-drawer-v0.1.0-dod-migration.md` with `status: accepted`
- Sheet retirement complete (folder deleted, barrel updated, package.json updated)
