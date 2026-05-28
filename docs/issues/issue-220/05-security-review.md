# Issue #220 — Security Review (Phase 5)

Light-touch security review per the Issue-Driven flow Phase 5. Scope: UI primitive added to a presentational design-system library. No server-side surface, no auth/authz, no PII handling, no secrets, no SQL/storage layer.

## Threat surfaces evaluated

| Surface | Applicable? | Finding |
|---------|-------------|---------|
| XSS via dynamic content rendering (`innerHTML`, `dangerouslySetInnerHTML`) | No | All rendering uses safe JSX/template binding. The trigger formats dates via `fmtBR`/`fmtRangeBR` — pure string interpolation of `Date.getDate()`/`getMonth()`/`getFullYear()` results, all numeric, all sanitized by `String.padStart`. No HTML construction, no `dangerouslySetInnerHTML`. |
| Untrusted input flowing to logic | Limited | The component accepts `Date` instances from consumers (typed at the API boundary). No string parsing of untrusted formats inside the component. `react-day-picker`'s own input handling is governed by its library — out of our threat boundary. |
| Secrets / credentials in bundle | No | Component contains no secrets, API keys, tokens, or URLs. Pure UI primitive. |
| `target="_blank"` without `rel="noopener noreferrer"` | No | Component renders no external links. |
| Dependency CVEs introduced by this PR | No | No new dependencies added. `react-day-picker` v9 was already in the bundle prior to this PR. The PR consumes `DateRange` type and the native `mode="range"` API both shipped in the same v9 release. |
| Form submission of sensitive data | Indirect | The optional `name` prop emits hidden inputs (`${name}` in single mode; `${name}_from` + `${name}_to` in range mode) carrying ISO-8601 date strings. ISO dates are not sensitive data. Consumers using range mode for fields containing sensitive contextual data (e.g., a user's transaction history time window in a multi-tenant system) are responsible for authorization on the server — same rule as single-mode dates, no new surface introduced. |
| Hidden input name injection | No | The `name` prop is consumer-controlled (already true in single mode). Range mode produces `${name}_from` and `${name}_to` via string concatenation — if a consumer passes a malicious `name` like `"foo' onload='alert(1)"`, the value lands in the `name` attribute of an `<input>`, which React escapes by default. No injection vector beyond what single-mode already accepts. |
| Component re-render side effects | No | Internal state (`pendingFrom`, `internalSingle`, `internalRange`) is purely local; no global mutation. Effect dependency uses `pivotKey` (numeric ms) — deterministic, no race conditions. |

## OWASP Top 10 (2021) mapping — UI library scope

| Item | Relevant? | Notes |
|------|-----------|-------|
| A01 Broken Access Control | No | Component does no access control. |
| A02 Cryptographic Failures | No | No crypto in scope. |
| A03 Injection | No | No string→HTML/SQL construction. |
| A04 Insecure Design | No | Threat model is "presentational UI primitive"; the design is appropriate. |
| A05 Security Misconfiguration | No | No configuration surface. |
| A06 Vulnerable & Outdated Components | No | No new dependencies; `react-day-picker` v9 already vetted in the project. |
| A07 Auth Failures | No | No auth in scope. |
| A08 Software/Data Integrity Failures | No | No dynamic code loading, no untrusted module imports. |
| A09 Logging Failures | No | Component does no logging (correct per `lex-logging-decorator`). |
| A10 SSRF | No | No outbound HTTP in scope. |

## Frontend-specific Lex compliance

| Lex | Status |
|-----|--------|
| `lex-frontend-security` Rule 1 (no `innerHTML` with untrusted content) | ✅ Pass — no dynamic HTML construction. |
| `lex-frontend-security` Rule 2 (no secrets in bundle) | ✅ Pass — no secrets. |
| `lex-frontend-security` Rule 4 (two-level validation) | N/A — no consumer→server submission inside the component. Consumers using the hidden-input pattern with range mode get two ISO-date strings (`${name}_from`, `${name}_to`); server-side revalidation is the consumer's responsibility, identical to single mode. |
| `lex-frontend-security` Rule 8 (`target="_blank"` rel) | N/A — no external links. |
| `lex-frontend-typing` (strict TS, no implicit `any`) | ✅ Pass — typecheck clean; explicit casts are documented (`as React.ComponentType<DatePickerRangeProps>` in the stories file with comment, `as unknown as DateRange` in the defensive `formatRangeBR` test with comment). |
| `lex-frontend-accessibility` (WCAG AA) | ✅ Pass — 3 `axeInThemes(container)` blocks for range states pass in light + dark; existing 6 single-mode `axeInThemes` blocks still pass; trigger has `aria-label` default per mode; clear button has `aria-label="Limpar intervalo"`. |

## Conclusion

**Outcome: pass (no security findings, no follow-up needed).**

The range mode is an additive presentational capability extending an existing component. It introduces no new threat vectors beyond what the single-mode `DatePicker` already presents. No mitigations required.
