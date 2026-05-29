# Issue #241 — Architecture / Touch Plan

> Phase 3 of the Issue-Driven flow. Docs-only change; mapping of affected files and verification strategy. No ADR — no architectural decision is being made; the consolidation decision lives in ADR-006.

## Affected files (after full audit)

| Path | LoC delta | Reason |
|------|-----------|--------|
| `README.md` (line 105) | ±1 line edited (no net add/remove) | Overlays catalog: replace `DropdownMenu · ContextMenu` with `Menu`. |
| `docs/issues/issue-241/01-brief.md` | +N (new) | Phase 1 artifact (this PR). |
| `docs/issues/issue-241/02-requirements.md` | +N (new) | Phase 2 artifact (this PR). |
| `docs/issues/issue-241/03-architecture.md` | +N (new) | Phase 3 artifact (this PR). |
| `docs/issues/issue-241/05-security-review.md` | +N (new) | Phase 5 artifact (this PR). |
| `docs/issues/issue-241/06-quality-report.md` | +N (new) | Phase 6 artifact (this PR). |

Production source touched: a single line in `README.md`. Issue-driven artifacts are documentation overhead, not feature scope.

## Audit done

```
$ git grep -n "DropdownMenu\|ContextMenu" -- '*.md' '*.astro' '*.mdx' \
    | grep -v "^docs/adr/ADR-005-" \
    | grep -v "^docs/adr/ADR-006-"

README.md:105:**Overlays** — Dialog · AlertDialog · Drawer · Sheet · Popover · Tooltip · DropdownMenu · ContextMenu
```

Single match in the working tree. After the edit the same command MUST return zero.

## Verified clean (no edits needed)

- `docs/src/pages/index.astro` — Overlays group already lists `Menu` (`{ g: "MN", label: "Menu", ... }` at line 629); the only literal occurrences of the substrings `dropdown` / `context` are in a lowercase keyword search index (`key: "menu context dropdown acoes"`) which is not a component reference and does not match the case-sensitive grep pattern. No edit required.
- `docs/adr/ADR-005-popover-api-shape-and-token-alignment.md` and `docs/adr/ADR-006-menu-consolidation-and-api-shape.md` — historical ADRs explicitly allowed by AC-1.
- No `packages/*/README.md` exists.

## Touch decisions

- **README.md:105** — replacement: `**Overlays** — Dialog · AlertDialog · Drawer · Sheet · Popover · Tooltip · Menu`. The existing component list is in pt-BR convention used throughout the file; per `lex-language-ptbr` accents and tone preserved; per `lex-brand-voice` no buzzwords introduced.

## ADR

No new ADR. The architectural decision (consolidation under `Menu`) lives in ADR-006 (`accepted`, merged via PR #239). This PR is a downstream documentation mechanical sync.

## Stacked PR Decomposition

Single PR. Decomposition Checklist signals (high) = 0; anti-signals (low) = 5+ (1-line edit, single category, single repo file, no sequencing dependency, atomic by construction). Stacked PR explicitly inappropriate.

## Risk

Near-zero. Worst case: a typo in the README, caught instantly by the `docs:build` step and by human review. No runtime impact.

## Pipeline expectation

- `docs:build` — must pass. Astro docs site recompiles a single line in the README block embedded in the docs landing (if any) or rebuilds the static site without it. Verified during Phase 6.
- CI baselines — non-applicable; no UI change. The post-PR-243 warn-not-fail logic is moot here.
- No `regenerate-baselines` label needed.
