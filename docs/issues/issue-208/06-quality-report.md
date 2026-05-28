# Quality Report (Gate 2): Plan #208

## 7-Check matrix

### Check 1 — AC ↔ test traceability

| AC | Verification artifact | Status |
|---|---|---|
| AC-1 — Inventory produced | `03-architecture.md` § Consumer inventory — table with file:line refs; PR body re-summarizes | ✓ |
| AC-2 — Token mapping inverted; dark mode untouched | `git diff origin/main -- ui_kit/styles/index.css` bounded to lines 116-201 (light theme block + comment) | ✓ |
| AC-3 — Brand mirror reflects Notion canonicity | `.claude/rules/design/brand/lex-brand-colors.md` adds § "CTA hierarchy by theme (Notion-canonical)" with per-theme table and Notion source links | ✓ |
| AC-4 — Storybook visual baselines regenerated via CI | PR carries `regenerate-baselines` label; CI workflow `push-baselines` regenerates Ubuntu-rendered `__image_snapshots__/`. **Cannot be verified locally** — verified post-push by inspecting the CI run on the PR (verified by Athena after `gh pr create`). | pending (CI) |
| AC-5 — Rationale documented inline | CSS comment block at lines 109-134 records the override (shadcn-compat → Brand canonicity) with explicit Notion reference | ✓ |
| AC-6 — Pipeline green | `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` — all green locally; CI workflows verified post-push | ✓ (local) |

All numbered tests in jest-axe still reference `AC-N (#issue-id)` for their parent component issues (e.g., `AC-4 (#39)` in Combobox); this Plan adds no new tests because the change is at the token layer and is covered by the existing 739 tests in the suite, including the jest-axe contrast checks in light + dark for every component that consumes `--primary` / `--secondary`.

### Check 2 — Scope creep

`git diff origin/main --stat`:

```
ui_kit/styles/index.css                              | 24 ++++++++++-----
.claude/rules/design/brand/lex-brand-colors.md       | 12 +++++++
docs/issues/issue-208/01-brief.md                    | (new)
docs/issues/issue-208/02-requirements.md             | (new)
docs/issues/issue-208/03-architecture.md             | (new)
docs/issues/issue-208/05-security-review.md          | (new)
docs/issues/issue-208/06-quality-report.md           | (new)
```

Every file in the diff maps to the declared scope in `03-architecture.md` § "Affected files". No unexpected file modified. `__image_snapshots__/` not touched locally (will be regenerated on CI per AC-4). **No scope creep.**

### Check 3 — Best practices

- `lex-brand-colors`: palette respected; new combinations validated (violet-on-white = 7.85:1 AAA; orange-on-white = 3.36:1 within the explicit button/UI band).
- `lex-frontend-accessibility`: WCAG 2.1 AA enforced; the inversion strictly improves the dominant CTA contrast.
- `lex-design-system-library`: change is at the token layer (no per-component reimplementation); the canonical path.
- `lex-conventional-commits` / `lex-commit-language` / `lex-small-commits` / `lex-signed-commits`: respected by all 3 planned commits (subject in English, atomic, GPG-signed).
- `lex-git-branches`: branch is `chore/208-invert-primary-secondary-light-mode` per the format `{type}/{N}-{slug}`.
- `lex-issue-first`: PR body will reference `Closes #208` and `Refs #207`.
- `lex-issue-driven`: artifacts present under `docs/issues/issue-208/` per Rule 5.
- `lex-no-silent-tech-debt`: tangential finding (4 story comments referencing the old "3:1 threshold for bg-primary") surfaced in `03-architecture.md` § Tangential Findings and re-surfaced in the PR body as `Refs #207` follow-up. No silent debt committed.
- `lex-agent-focus-on-active-plan`: stayed strictly within Plan #208 scope; tangential findings declared and deferred.

### Check 4 — Tests pass

```
Test Files  24 passed (24)
     Tests  739 passed (739)
  Duration  15.80s
```

Every jest-axe test in the suite (Button, IconButton, Calendar, Combobox, DatePicker, Checkbox, Input, FileUpload, Switch, Typography, Sonner, Card, etc.) renders the components against light AND dark themes. All passed with the new violet-on-white `--primary`. No assertion hardcoded the old orange hue — confirmed by grep on `#E07400` / `e07400` in `**/*.test.tsx`.

### Check 5 — Coverage / no untested critical path

No new code path; no new component logic; no new test required. The token-layer change is fully covered by the existing 24 test files × 739 assertions.

### Check 6 — Types

`npm run typecheck` → 0 errors. `tsc --strict` clean.

### Check 7 — Performance budget

Bundle size: 359.7 kB total (91.0 kB gzipped) — identical to pre-change (token literal values are byte-for-byte equivalent in length). No new dependency, no new asset. **Within budget.**

## Verdict

**GO** — gate 2 cleared locally.

The one item flagged `pending (CI)` is AC-4 (visual baselines regeneration). Per `feedback_visual_regression_ubuntu_sot.md`, this MUST be performed on Ubuntu CI, not locally on macOS. The PR will carry the `regenerate-baselines` label; CI satisfies AC-4 by pushing the regenerated snapshots back onto the branch. Athena then verifies the workflow ran green before approval is requested from Fernando.

## Out-of-scope debt surfaced (for the PR body)

| File | Line | Comment fragment | Disposition |
|---|---|---|---|
| `ui_kit/components/form/Form.stories.tsx` | 58-60 | "Button (.bg-primary brand at 3:1 threshold)" | `Refs #207` — next Form review (no Plan filed yet) |
| `ui_kit/components/card/Card.stories.tsx` | 20-25 | "Card compõe Button (.bg-primary brand token a 3:1 per lex-brand-colors)" | `Refs #207` — next Card review |
| `ui_kit/components/file-upload/FileUpload.stories.tsx` | 24-29 | "Button (.bg-primary brand) which sits in the lex-brand-colors button range" | `Refs #207` — next FileUpload review (post-#222) |
| `ui_kit/components/sonner/Sonner.stories.tsx` | 18-24 | "Button (.bg-primary = Violet 500)... 3:1–4.5:1 contrast range" | already accurate on the literal value; comment about the range remains valid for `destructive`. No action required. |

Each `meta.a11y` color-contrast disable remains semantically necessary (each story still composes Button.destructive and/or muted-foreground). What becomes outdated is the `bg-primary`-specific sub-clause. Updating the four fragments is cosmetic doc debt, surfaced for the next per-component pass.
