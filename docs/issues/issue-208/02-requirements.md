# Requirements: Plan #208 — Invert `--primary` / `--secondary` in Light Mode

## Acceptance Criteria

The 6 ACs below mirror the Definition of Done from Plan #208 (Issue body), themselves derived from Tech Task #207. Test/verification mapping noted per AC.

- **AC-1 — Consumer inventory produced.** An audit of every `--primary` / `--secondary` (and aliases `--accent`, `--ring`, `--*-foreground`) consumer in light mode is produced and recorded in `docs/issues/issue-208/03-architecture.md`, and summarized in the PR body. **Verification:** inventory section present in `03-architecture.md` with file:line references; PR body links it.

- **AC-2 — Token mapping inverted; dark mode untouched.** `ui_kit/styles/index.css` lines 115-121 (and the corresponding HSL triples around lines 186-200) are edited so that, in light mode, `--primary` resolves to Violeta 500 (`281 64% 26%`) and `--secondary` resolves to Laranja 500 (`31 100% 44%`). The `--accent` alias (line 194) follows `--primary`. The `--ring` token (line 200) is updated to track the new `--primary` value. Dark mode override at lines 290-318 remains byte-identical. **Verification:** `git diff main -- ui_kit/styles/index.css` shows changes only between lines 115-201; lines 290+ untouched.

- **AC-3 — Local Brand mirror reflects Notion canonicity.** `.claude/rules/design/brand/lex-brand-colors.md` is updated so the Lex declares Violeta 500 as the canonical primary CTA in light mode, aligning with Notion as the source of truth. The forbidden combinations (Yellow 500 + White) and palette enumeration remain intact. **Verification:** diff inspection; no `codex-brand-*` exists locally (only reference docs in `.claude/docs/`).

- **AC-4 — Storybook visual baselines regenerated via CI.** The PR carries the `regenerate-baselines` label; Ubuntu CI rebuilds `__image_snapshots__/` for every affected story and pushes the regenerated artifacts back onto the branch. No baseline is committed from macOS. **Verification:** PR labels include `regenerate-baselines`; CI workflow `push-baselines` runs successfully; final commits on the branch include CI-generated snapshot updates.

- **AC-5 — Rationale documented inline.** The `ui_kit/styles/index.css:115-121` inline comment is revised: the previous `shadcn`-compat rationale is recorded as superseded by Brand canonicity per `lex-brand-colors` / Notion. Decision recorded inline (not in a dedicated ADR), since the only downstream dependency was the legacy `shadcn` convention itself — no per-component implicit assumption was found in the audit (AC-1). **Verification:** the inline comment block on lines 115-125 references the override explicitly.

- **AC-6 — Pipeline green; no unintended regressions.** `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` all pass locally before push. Visual diff is reviewed (each regenerated snapshot) before merge approval; no unintended regression on non-CTA primary-tinted surfaces. **Verification:** local pipeline output captured in `06-quality-report.md`; CI workflows green on PR.

## Definition of Done

A box satisfied = AC verified locally + the corresponding CI workflow green on the PR. Visual baselines regenerated on CI count as the satisfying artifact for AC-4.

## Out of Scope (Tech Task #207)

- Plans #21, #23, #27 — pure DoD reviews, do not bundle.
- Any new component, feature, or behavior change.
- Updating story-level a11y comments referencing "3:1 threshold" (Form/Card/FileUpload/Sonner) — see `03-architecture.md` § Tangential Findings; deferred as `Refs #207` documentation follow-up.

## Open Questions

None — all resolved during Plan #21 Brand audit.
