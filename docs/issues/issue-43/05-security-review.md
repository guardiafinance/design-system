# Phase 5 — Security Review

## Scope of review

- New code in this PR: `FileUpload.stories.tsx` (+ 1 story) and `file-upload.test.tsx` (+ 2 describe blocks).
- Phase docs in `docs/issues/issue-43/`.
- **No production code change in `index.tsx`.** The component itself is unchanged.

## Status: **clean**

## Findings against OWASP Top 10 (frontend-relevant subset)

| # | Risk | Applies? | Verdict | Note |
|---|------|----------|---------|------|
| A01 | Broken access control | No | n/a | Component is presentational; access control is the consumer's responsibility. |
| A02 | Cryptographic failures | No | n/a | No credentials handled. |
| A03 | Injection (XSS) | Yes | ✅ pinned | New XSS-safety test block (2 tests) confirms user-supplied filename + error message render via JSX text interpolation, never via `dangerouslySetInnerHTML`. Reviewed `index.tsx` lines 595-704 — only `{f.name}`, `{f.error}`, `{formatBytes(f.size)}` interpolations; no `dangerouslySetInnerHTML` anywhere in the file. |
| A04 | Insecure design | No | n/a | No design change. |
| A05 | Security misconfiguration | No | n/a | No config change. |
| A06 | Vulnerable / outdated components | No | n/a | No new dependency. |
| A07 | Identification + auth failures | No | n/a | No auth surface. |
| A08 | Software + data integrity | No | n/a | No integrity surface. |
| A09 | Logging + monitoring | No | n/a | No new runtime surface. |
| A10 | SSRF | No | n/a | The existing `uploadUrl` path uses a consumer-supplied URL with native `XMLHttpRequest` — server-side validation is the consumer's responsibility. No change in this PR. |

## Lex-specific checks

- **`lex-frontend-security` Rule 1** (no `innerHTML` / `dangerouslySetInnerHTML`): grep across `ui_kit/components/file-upload/` confirms 0 matches. New test block enforces this contract.
- **`lex-frontend-security` Rule 2** (no secrets in bundle): no env-var addition; no hardcoded URL/token.
- **`lex-frontend-accessibility`** (WCAG 2.1 AA): preserved — `axeInThemes` already covers 6 visual states in both themes.
- **`lex-frontend-typing`** (strict TS): typecheck passes with 0 errors.
- **`lex-design-system-library`**: only tokens consumed; no hardcoded colors.

## Sensitive data handling

- **Filenames are user input.** Rendered via JSX text-binding only; no eval, no innerHTML. Pinned by the new XSS test.
- **File content is never read** by the component (the picker hands `File` objects to consumers; `XMLHttpRequest` streams bytes to the server without parsing).
- **No logging** of filenames or file content (the component does not call `console.*` or any logger).

## Dependencies audit

- No new dependencies added. `yarn audit` / `npm audit` not re-run because there is no `package.json` delta. The existing audit baseline applies.

## Verdict

**Clean.** No `changes-required`, no `blocked` finding. Phase 6 may proceed.

## Next phase

→ Phase 6 — Gate 2 (Quality Gate).
