# Phase 1 — Brief · Issue #58

- **Repo:** `guardiatechnology/design-system`
- **Issue:** [#58 — feat(confidence-indicator): migrate ConfidenceIndicator to v0.1.0 DoD](https://github.com/guardiatechnology/design-system/issues/58)
- **Type:** Tech Task (`evolvability ♻️`)
- **Epic:** #13 — v0.1.0 catalog migration
- **Author / Assignee:** @seguim
- **Surface:** AI-first specific component (Guardia agentic accounting)
- **Category:** Overlays (per issue body) — practical placement is **Feedback / AI** (no overlay portal involved)
- **Visual reference:** `ux_references/ui_kits/components/ConfidenceIndicator/` (`index.tsx` 84 lines · `index.css` 60 lines · `ConfidenceIndicator.playground.html`)

## What the Issue asks

Bring `ConfidenceIndicator` to the v0.1.0 Definition of Done — first-class component of `@guardia/design-system`. Communicates AI agent decision confidence to humans on the Guardia platform. Aligned to the Lighthouse semantic system from the legacy bundle:

- **high** — ≥ 95% — auto-applied
- **medium** — 80–94% — review
- **low** — < 80% — requires human decision

Three visual variants in the legacy reference: `chip` (default, badge-like), `bar` (progress bar with label + percentage), `dot` (small bullet inline).

## Notion context

Source of truth for brand: [Branding](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6) — subpages [Colors](https://www.notion.so/34536f91ebd28142a3f1e0e58fd62c4b), [Typography](https://www.notion.so/34536f91ebd281b9b76ccc6159bfae69), [Logo](https://www.notion.so/34536f91ebd2816f891ce73a5d47a789), [Voice](https://www.notion.so/34536f91ebd2817f8cc5ca29e657c828). In divergence with `lex-brand-*` / `codex-brand-*` mirrors, Notion prevails.

Signal-color tokens (Signal Green `#00BF63`, Signal Yellow `#FFDE59`, Signal Red `#FF3131`) are codified in `lex-brand-colors` as **reserved for data viz and critical system states** — ConfidenceIndicator qualifies as **data viz** (it is a quantitative summary of model output), so signal colors are the correct semantic vehicle. The component will reuse existing `--signal-green`, `--signal-yellow`, `--signal-red` and their `-100`/`-200`/`-700` mixes plus `--success-soft` / `--warning-soft` ≈ `--guardia-yellow-100` / `--danger-soft` already present in `ui_kit/styles/`. No new design tokens will be coined.

## Precedents on `main`

- **Tooltip** (PR #237, ADR-007) — atomic-commit-with-accepted-ADR pattern. Compound exports. CVA size ladder.
- **Badge** (ADR-003) — WCAG fg recompute pattern over signal-color tints. Closest sibling for the `chip` variant since both render small colored pills with semantic surface tokens.
- **FileUpload** — local precedent for ARIA quantitative value: `role="progressbar" aria-valuenow/min/max`. ConfidenceIndicator differs semantically: it is a **steady-state quantitative summary**, not a temporal progress, so `role="meter"` is the correct ARIA role per WAI-ARIA 1.2 §5.3.18 (a "meter" represents a scalar measurement within a known range).
- **AgentCard** (PR #204, in flight) — AI-first sibling. Uses `lex-ai-first-experience` framing and substitutes `--violet-*` / `--orange-*` legacy variables with project `--guardia-purple-*` / `--guardia-orange-*` semantic equivalents. Same substitution discipline applies here.
- **ChatMessage** (PR #221, in flight) — AI-first sibling. Compound API with context cascade for role/status. Confirms that AI-first components on the design-system live as composable primitives, never as opinionated layouts.

## Stack on `main` snapshot

`ui_kit/components/` currently lists 40+ migrated primitives. No `confidence-indicator/` directory exists yet — this is **net-new component**, not a rewrite. ADR catalog: ADR-001…007 merged; ADR-008 proposed via PR #247; ADR-009 reserved; ADR-010 reserved for Dialog #60; ADR-011 reserved for Alert #56; ADR-012 reserved for EmptyState #64. **ADR-013 is pre-allocated to this issue** and will be authored in Phase 3 if real architectural decisions surface (tier threshold contract, color mapping ergonomics, meter-vs-progressbar role choice, AI-first composition strategy).

## Open questions (carried to Phase 2)

1. Should `value` be `0–100` (legacy) or `0–1` (newer ML convention)? — Legacy reference uses 0–100; Lighthouse thresholds documented in 0–100. Decision proposal: keep **0–100** for API parity with the legacy bundle and human-readable defaults (the percentage is the most common consumer-facing label).
2. Should the consumer be able to override tier thresholds? — Legacy reference fixes them. Proposal: keep fixed in v0.1.0 (95 / 80 cut-offs); a future Issue can introduce `thresholds` prop if a real use case appears.
3. Compound API or single component with `variant` prop? — Legacy is single-component-with-variant. Proposal: keep single-component-with-variant — `chip` / `bar` / `dot` are distinct visual treatments of the same semantic value, not separate building blocks the consumer composes. No need to leak internal structure.
4. Tooltip linkage for explanation? — Not in the legacy. Proposal: out of scope for v0.1.0 DoD; if a consumer wants to attach an explanation, they wrap with `<Tooltip>` themselves (composition over expansion).
5. Brand voice for level labels — Legacy reference uses pt-BR labels ("Alta confiança", "Revisar", "Atenção"). These are user-facing strings. Decision: expose `levelLabels?: Record<ConfidenceLevel, string>` with the legacy pt-BR defaults so consumers can localize without forking.

## Next phase

Phase 2 — formalize ACs and DoD, then Phase 3 architecture brief + ADR-013 decision.
