# Phase 5 — Security Review: Plan #87 (Tabs v0.1.0 DoD)

Revisão estática do diff contra OWASP Top 10 e Lexis de segurança frontend
(`lex-frontend-security`, `lex-frontend-typing`, `lex-frontend-accessibility`,
`lex-logging-decorator`).

## Surface do diff

| Categoria | Arquivos | Linhas adicionadas |
|---|---|---|
| Componente | `ui_kit/components/tabs/index.tsx` | ~143 |
| Testes | `ui_kit/components/tabs/tabs.test.tsx` | ~398 (novo) |
| Stories | `ui_kit/components/tabs/Tabs.stories.tsx` | ~266 |
| Docs Astro | `docs/src/pages/componentes/tabs.astro` | ~166 (novo) |
| Previews | `docs/src/previews/tabs.tsx` · `tabs-live.tsx` | ~150 + ~95 (novos) |
| Set MIGRATED | `docs/src/pages/index.astro` | +1 linha |
| Phase docs | `docs/issues/issue-86/0{1,2,3,5,6}-*.md` | docs |

Nenhum endpoint HTTP, consumer de evento, job ou worker — Tabs é primitivo de
UI puro, portanto `lex-observability-required` (que exige span + métrica + log
estruturado) **não se aplica**: não há "runtime surface" no sentido da Lex
(seção 5: "Aplicada a `.ahrena/issues/{n}/03-architecture.md` listed as new
endpoint/consumer/job").

## Checklist OWASP Top 10 (2021) — relevância para o diff

| # | Categoria | Aplicável? | Avaliação |
|---|---|---|---|
| A01 | Broken Access Control | ❌ não | sem auth/authz no escopo |
| A02 | Cryptographic Failures | ❌ não | sem manipulação de segredo |
| A03 | Injection | ⚠️ revisado | nenhum `innerHTML` / `dangerouslySetInnerHTML`; toda renderização via JSX |
| A04 | Insecure Design | ❌ não | composição padrão Radix; sem fluxo de decisão sensível |
| A05 | Security Misconfiguration | ❌ não | sem alteração de config |
| A06 | Vulnerable Components | ⚠️ revisado | depende apenas de Radix Tabs + CVA já presentes em `package.json`; sem `npm install` no diff |
| A07 | Identification/Authn Failures | ❌ não | fora do escopo |
| A08 | Software/Data Integrity | ❌ não | sem código carregado dinamicamente |
| A09 | Logging/Monitoring Failures | ✅ ok | zero `console.log` / `logger.*` em código de aplicação (`lex-logging-decorator`) |
| A10 | SSRF | ❌ não | sem chamada HTTP no componente |

## Verificações específicas Lexis

### `lex-frontend-security`

- **`innerHTML` / `dangerouslySetInnerHTML`:** `grep -n "dangerouslySetInnerHTML\|innerHTML" ui_kit/components/tabs/ docs/src/previews/tabs*.tsx docs/src/pages/componentes/tabs.astro` → **0 ocorrências**. Todo conteúdo renderiza via JSX seguro.
- **Secrets no bundle:** `grep -nE "(api_key|secret|token)" ui_kit/components/tabs/ docs/src/previews/tabs*.tsx` → **0 ocorrências**.
- **`target="_blank"` sem `rel`:** zero `target="_blank"` no diff (a astro page usa links internos do design-system; sem links externos).
- **Auditoria de dependências:** Radix Tabs e CVA já constam em `package.json` antes deste PR; não há `npm install` novo. `npm audit` cobre estas dependências no pipeline.

### `lex-frontend-typing`

- **`tsc --noEmit`:** passa sem erros (saída vazia, exit 0).
- **`any` explícito:** `grep -nE "\bas any\b|: any\b" ui_kit/components/tabs/` → **0 ocorrências**.
- **Tipos explícitos:** todas as `Props` (`TabsListProps`, `TabsTriggerProps`) extendem os types nativos do Radix + `VariantProps<typeof ...>`. `TabsSize` é union literal.

### `lex-frontend-accessibility`

- **ARIA:** Radix Tabs fornece `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-orientation`, foco roving — verificado por `tabs.test.tsx` (AC-3).
- **Teclado:** ←/→ (horizontal), ↑/↓ (vertical), `Home`/`End` — Radix nativo, coberto pelos testes.
- **Foco visível:** `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` em todos os triggers; nunca removido.
- **axe (jest-axe):** 4 cenários `axeInThemes(container)` (default, troca de aba, vertical, disabled) passando com `toHaveNoViolations()` em light **e** dark.

### `lex-logging-decorator`

- `grep -nE "console\.(log|warn|error|debug|info)" ui_kit/components/tabs/ docs/src/previews/tabs*.tsx` → **0 ocorrências**. Cumprido por construção (componente sem efeito colateral de log).

### `lex-design-system-library`

- Import `@radix-ui/react-tabs` permitido neste repositório (este é o `@guardia/design-system` source). Nenhum import bloqueado (`@mui/*`, `@chakra-ui/*`, `shadcn-ui`).
- Zero valor hex hardcoded em CSS/JSX (verificado por busca regex; as únicas ocorrências de hex no diff são em prosa documental: hex de Mono Black/Cinza 900 em docstring de story para referenciar `lex-brand-colors`, e `#208` no nome de um teste referenciando o número do Plan).

## Conclusão

**0 findings críticos. 0 findings altos. 0 findings médios.** O diff é
defensável sob OWASP Top 10 (sem superfície aplicável além de injection, que
está coberto pelo modelo JSX). Todas as Lexis de segurança frontend e
qualidade transversal são satisfeitas. Pode prosseguir para o Gate 2.
