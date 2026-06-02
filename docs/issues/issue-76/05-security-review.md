# Phase 5 — Security review: `feat(breadcrumbs): migrate Breadcrumbs to v0.1.0 DoD`

- **Issue:** [#76](https://github.com/guardiatechnology/design-system/issues/76)
- **Plan sub-issue:** [#77](https://github.com/guardiatechnology/design-system/issues/77)
- **ADR:** [ADR-016](../../adr/ADR-016-breadcrumbs-v0.1.0-dod-migration.md)
- **Reviewer:** `warrior-athena` (Issue-Driven orchestrator, Phase 5)
- **Status:** **approved** — no security finding.

## Surface in scope

| Surface | Risk class | Notes |
|---|---|---|
| `ui_kit/components/breadcrumbs/index.tsx` | Frontend (presentational) | Pure rendering; no runtime side effect; no network, no storage, no eval. |
| `ui_kit/components/breadcrumbs/Breadcrumbs.test.tsx` | Test only | Excluded from prod bundle. |
| `ui_kit/components/breadcrumbs/Breadcrumbs.stories.tsx` | Storybook only | Excluded from prod bundle. |
| `docs/src/pages/componentes/breadcrumbs.astro` | Docs (static HTML) | Build-time only; no client-side dynamic input. |
| `docs/src/previews/breadcrumbs.tsx` | Docs (Astro island) | Renders fixed sample data; no user input flows into render. |

## Threat model walk-through

| Threat | Vector | Mitigation |
|---|---|---|
| XSS via `items[].label` (ReactNode) | Consumer passes user-controlled string. | React JSX rendering escapes by default. The wrapper never calls `dangerouslySetInnerHTML` (`lex-frontend-security` Rule 1). Verified by inspection. |
| XSS via `href` (e.g., `javascript:` URLs) | Consumer passes `javascript:alert(1)` as `href`. | The wrapper does not validate href; React itself warns on `javascript:` URLs in `<a href>` since React 16.9 (DOM whitelist). The component sets `href={href ?? "#"}` — no template injection. Defensive sanitization of href is the consumer's responsibility (consistent with other DS link surfaces — `Button asChild`, `BreadcrumbLink` legacy). No regression vs. baseline. |
| Tabnabbing via `target="_blank"` | Consumer passes a link that opens in a new tab without `rel="noopener"`. | The wrapper does not set `target`; consumer who passes `target="_blank"` is responsible for `rel="noopener noreferrer"` (`lex-frontend-security` Rule 8). Documented contract; no new surface introduced. |
| Secrets in client bundle | Hardcoded API keys / tokens in component code. | None — code is pure presentation. Verified by `git diff`. |
| Insecure dynamic content (`innerHTML`) | Wrapper uses `dangerouslySetInnerHTML`. | None — only JSX rendering. Verified. |
| Dependency CVE (new dep introduced) | New package adds vulnerable transitive dep. | **Zero new dependencies.** `@radix-ui/react-slot` and `lucide-react` are already pinned in `package.json`. |
| Storybook leaks production secrets | Stories embed real customer data. | Sample data only ("Itaú · maio/2026", "Squad Theros", etc.) — no PII, no secret. |

## Lexis cross-check

- ✅ `lex-frontend-security` Rule 1 (no `innerHTML`) — wrapper uses only JSX.
- ✅ `lex-frontend-security` Rule 2 (no secrets in bundle) — none present.
- ✅ `lex-frontend-security` Rule 8 (target=\"_blank\" with rel=\"noopener\") — wrapper does not set target; documented as consumer responsibility.
- ✅ `lex-frontend-accessibility` (WCAG 2.1 AA) — semantic HTML + ARIA APG breadcrumb pattern; jest-axe light+dark cobre 5 estados × 2 temas = 10 invocações sem violação.
- ✅ `lex-frontend-typing` — TypeScript strict; no `any` usage.
- ✅ `lex-logging-decorator` — N/A (no logger calls; pure render).
- ✅ `lex-observability-required` — N/A (no runtime endpoint / consumer / job).

## Verdict

**Approved.** No security finding. The migration is presentational, additive in surface (renames a directory, removes the legacy duplicate, adds new symbols + tests + docs), and introduces zero new dependencies. No regression vs. the baseline; the same `href`/`asChild` contract is preserved for the declarative primitives. Advancing to Phase 6 (Gate 2).
