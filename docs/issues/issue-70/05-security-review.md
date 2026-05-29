# Phase 5 — Security Review: `Toast` v0.1.0 DoD

- **Issue:** [#70](https://github.com/guardiatechnology/design-system/issues/70)
- **Plan:** [#71](https://github.com/guardiatechnology/design-system/issues/71)
- **Reviewer:** `warrior-athena` (inline conduct)
- **Date:** 2026-05-29
- **Scope:** diff of `feat/70-toast` vs `main`

## Summary

**Status:** `clean` — no findings.

Toast é uma primitiva visual de UI. Não há autenticação, não há rede, não há leitura/escrita de storage, não há manipulação de PII. A superfície de risco é limitada a XSS via conteúdo dinâmico injetado em `ToastTitle`/`ToastDescription`/`ToastAction`. O componente respeita JSX safe binding em todos os caminhos.

## Checklist

| Critério | Resultado | Nota |
|---|---|---|
| `lex-frontend-security` Regra 1 — sem `dangerouslySetInnerHTML` ou `innerHTML` | ✅ | `ToastTitle`, `ToastDescription`, e `ToastAction` recebem `React.ReactNode` via children; toda renderização é JSX. |
| `lex-frontend-security` Regra 2 — sem segredos no bundle | ✅ | Nenhuma string parecida com API key, token, URL de banco, ou `process.env.*` no diff. |
| `lex-frontend-security` Regra 3 — sem `localStorage` para tokens | ✅ | Toast não persiste nada. Estado vive em React `useState` + `useRef` (memory-only). |
| `lex-frontend-security` Regra 4 — input validation | ✅ | API tipada (`ToastOptions` interface, `ToastTone` literal union) bloqueia inputs inválidos em compile time. Default `tone="info"` fornece fallback seguro. |
| `lex-frontend-security` Regra 5 — CSRF | N/A | Sem requisições HTTP. |
| `lex-frontend-security` Regra 6 — CSP | N/A | Componente client-side; CSP é responsabilidade da aplicação consumidora. |
| `lex-frontend-security` Regra 7 — dependências auditadas | 🟡 | `npm audit` reporta 20 vulnerabilities (16 moderate, 4 high) **herdadas** — não introduzidas por esta migração. O único pacote novo é `@radix-ui/react-toast@^1.2.15`, pacote oficial Radix com 0 vulnerabilities próprias. Auditoria do baseline é Issue independente. |
| `lex-frontend-security` Regra 8 — `target="_blank"` + `rel="noopener"` | N/A | Toast não renderiza links externos. |

## Riscos não-Lex específicos

| Risco | Avaliação | Mitigação |
|---|---|---|
| XSS via `title`/`description` de usuário malicioso | Baixo | React JSX escapa por default. Consumidores que injetam HTML cru (e.g. via `dangerouslySetInnerHTML` no children) carregam a responsabilidade — documentação não estimula esse padrão. |
| DoS por toast flood (limite alto + duration baixa) | Baixo | `limit=5` default + fila FIFO bound o crescimento. Worst case: queue cresce em memória, eventualmente garbage-collected ao desmontar o Provider. |
| Action `onClick` malicioso de consumidor | Fora do escopo | A consumer instala o handler; o componente apenas invoca. |
| Pointer capture stubs em `vitest.setup.ts` | Nulo em produção | Stubs são exclusivamente para test runtime (jsdom). Browser real implementa Pointer Capture API nativamente. |
| Mudança de superfície (novo Provider obrigatório) | Operacional | Documentado em ADR-014. Sonner intocado garante zero-impact em consumidores existentes. |

## Diff de dependências

| Pacote | Versão | Origem | Resultado |
|---|---|---|---|
| `@radix-ui/react-toast` | `^1.2.15` (novo) | npm (Radix oficial) | ✅ pacote oficial, ~3kb gzipped, sem CVEs próprias |

## Conclusão

Não há findings. Phase 6 (Quality Gate) liberado.
