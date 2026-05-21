---
paths:
  - ["docs/**"]
---

# Lexis: Mandatory Structure for Feature Design Documents

> **Prefix:** `lex-` | **Type:** Unbreakable Law | **Scope:** Guardia platform — documents produced during the feature design cycle orchestrated by warrior-prometheus

## Law

> **Every document produced in the feature design phases (domain modeling, API design, event documentation, agents and metrics) MUST be persisted under `docs/{context}/{category}/`, where `{context}` is the Bounded Context in kebab-case and `{category}` is one of the canonical categories: `entities`, `oas`, `events`, `agents`, `metrics`. Each category MUST follow the template defined in `codex-feature-design-docs`. Saving design documents outside this structure, in configurable paths (`paths.oas`, `paths.events`, `paths.domain`) or any other location OUTSIDE `docs/{context}/{category}/` is FORBIDDEN.**

## Coverage

- **Applies to:** every document produced by the design warriors (`warrior-prometheus`, `warrior-theseus`, `warrior-daedalus`, `warrior-kronos`) and any agent that creates or updates feature design artifacts on the Guardia platform.
- **Bound agents:** `warrior-prometheus`, `warrior-theseus`, `warrior-daedalus`, `warrior-kronos`, `warrior-athena` when orchestrating design, and any Kata invoked by them (`kata-domain-model`, `kata-api-design-oas`, `kata-api-design-doc`, `kata-event-storm`, `kata-events-doc`, `kata-feature-design-docs`).
- **Exceptions:** None. Lexis admit no exceptions. Transient orchestration documents (checkpoints, phase scratchpads) are not in scope and remain under `.ahrena/workflow/`.

## Canonical Structure

```
docs/
└── {context}/                  # Bounded Context in kebab-case (e.g. scheduled-payments)
    ├── entities/
    │   └── {entity-name}.md    # 1 file per entity (kebab-case)
    ├── oas/
    │   └── openapi.yaml        # OpenAPI 3.x for the context API
    ├── events/
    │   └── events.md           # Context events, organized by entity
    ├── agents/                 # (reserved — to be defined later)
    └── metrics/                # (reserved — to be defined later)
```

### Naming rules

| Item | Rule |
|------|------|
| `{context}` | Bounded Context in kebab-case. e.g. `ScheduledPayments` → `scheduled-payments` |
| Files in `entities/` | `{entity-name}.md` in kebab-case from the PascalCase name. e.g. `ScheduledTransfer` → `scheduled-transfer.md` |
| File in `oas/` | `openapi.yaml`. When more than one API per context, suffix: `openapi-{slug}.yaml` |
| File in `events/` | `events.md` |
| Reserved categories | `entities`, `oas`, `events`, `agents`, `metrics`. Creating another category without an approved ADR is FORBIDDEN |

### Content conformance

Each category MUST follow the template defined in `codex-feature-design-docs`:

- `entities/{entity}.md` — header with **DDD Classification** (Entity, Aggregate Root or Value Object), **Why it exists** section, **Fields** table (Field, Type, Size, Required, Description), and **Business Rules**, **Invariants**, **Relationships**, **Errors** and **References** sections.
- `oas/openapi.yaml` — OpenAPI 3.x in readable YAML, per `codex-oas-structure`.
- `events/events.md` — grouped by entity, with Mermaid `stateDiagram-v2` for the lifecycle, and for each event the CloudEvents payload per `codex-cloudevents`.

## Violation Consequences

1. **Automatic block:** PRs with design documents outside `docs/{context}/{category}/` are rejected.
2. **Cross-inconsistency:** Prometheus does not finalize the design package when any artifact is outside the structure.
3. **Remediation:** move the document to the canonical path, update references, and refresh the warrior-prometheus final summary.

## Examples

### Correct

```
docs/
└── scheduled-payments/
    ├── entities/
    │   ├── scheduled-transfer.md
    │   └── transfer-approval.md
    ├── oas/
    │   └── openapi.yaml
    └── events/
        └── events.md
```

### Incorrect

```
docs/
├── domain/platform-domain-model.md     # ❌ paths.domain no longer exists
├── oas/scheduled-transfers-api.yaml    # ❌ outside docs/{context}/oas/
└── events/scheduled-transfers.md       # ❌ outside docs/{context}/events/
```

```
docs/
└── scheduled-payments/
    └── domain-model.md                 # ❌ no "domain-model" category; the domain model is split across entities/, events/ and oas/
```

## Automated Validation

- **Tool:** agent verification on persistence; PR lint validating regex `^docs/[a-z][a-z0-9-]*/(entities|oas|events|agents|metrics)/[^/]+$` for every new file under `docs/`.
- **Timing:** at the end of every design phase, on Gate 1 of the Issue-Driven flow (scope) and on the PR.
- **Metric:** 0 design documents outside the canonical structure on `main`; 100% of features with identified Bounded Contexts produce coherent subdirectories under `docs/`.
