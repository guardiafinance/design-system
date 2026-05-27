# Security Review — Issue #211

## Scope

Repo-config change (GitHub labels) + 1 shell script (`scripts/labels.sh`) that wraps `gh label create --force`.

## Threat surface

| Surface | Risk | Mitigation |
|---|---|---|
| `scripts/labels.sh` execution | Arbitrary code | Script is plain bash, `set -euo pipefail`, no `eval`, no user input interpolation beyond `--repo <slug>` flag passed straight to `gh` |
| Label name/description content | Stored XSS in GitHub UI | GitHub sanitizes label names/descriptions; no HTML rendered in label chips |
| GitHub token in CI | Token leakage | Script uses ambient `gh auth` — no token printed; `--force` does not require elevated scope beyond `repo` (already granted) |
| Secret handling | None | No secrets, env vars, or credentials manipulated |
| Dependency surface | None | Pure shell + `gh` CLI; no `npm`/`pip`/`brew` install added |

## OWASP Top 10 check

| Category | Applicable | Notes |
|---|---|---|
| A01 Broken Access Control | No | GitHub-side ACL on `gh label create` |
| A02 Cryptographic Failures | No | No crypto |
| A03 Injection | No | `gh label create` args are quoted; `--repo "$2"` passed as positional arg (no shell interpolation) |
| A04 Insecure Design | No | Idempotent, declarative |
| A05 Security Misconfiguration | No | Labels are repo metadata, not security policy |
| A06 Vulnerable Components | No | No new dependency |
| A07 Auth Failures | No | Relies on existing `gh auth` |
| A08 Software/Data Integrity | No | Script is committed and reviewed; no remote execution |
| A09 Logging Failures | No | No logging path touched |
| A10 SSRF | No | No outbound HTTP except `gh` API to GitHub |

## Verdict

**PASS** — no security impact. Repo-config change with idempotent helper script. No code execution surface in production, no secret handling, no new dependencies.
