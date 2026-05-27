# Security Review — Issue #21

Phase 5 do fluxo Issue-Driven. Revisão de segurança aplicada ao diff
de revisão do Button v0.1.0 contra `lex-frontend-security` e o subset
relevante do OWASP Top 10 para superfícies frontend.

## Escopo do diff revisado

| Arquivo | Tipo de mudança |
|---|---|
| `ui_kit/components/button/button.test.tsx` | Acréscimo de 10 testes (4 comportamentais + 6 jest-axe via `axeInThemes`); zero alteração de runtime. |
| `ui_kit/components/button/Button.stories.tsx` | Acréscimo de uma story `DarkTheme` que renderiza matriz visual em Storybook (artefato de documentação, não shipping). |
| `docs/issues/issue-21/02-requirements.md` | Atualização de AC-5 documentando o roteamento Brand × Notion para Tech Task separada. |
| `docs/issues/issue-21/05-security-review.md` | Este arquivo. |
| `docs/issues/issue-21/06-quality-report.md` | Relatório Gate 2. |

Nenhuma alteração em `ui_kit/components/button/index.tsx`, em CSS, em
config build, em dependências (`package.json`), em hooks, em scripts,
ou em superfícies de runtime. O surface de risco é estritamente
**test code + story de documentação + Markdown**.

## Checklist OWASP / lex-frontend-security

### XSS / `innerHTML` / `dangerouslySetInnerHTML`

- **Resultado:** ✅ não aplicável.
- **Verificação:** o diff não introduz nenhuma chamada a `innerHTML`,
  `dangerouslySetInnerHTML`, `eval`, `Function()`, `setTimeout` com
  string, ou `document.write`. Os novos testes usam JSX padrão
  (Testing Library `render`) e a story `DarkTheme` é JSX puro.

### Vazamento de credenciais no bundle

- **Resultado:** ✅ não aplicável.
- **Verificação:** zero strings parecidas com tokens/API keys/URLs
  sensíveis. Testes e story usam apenas literais semânticos pt-BR
  (`"Salvar"`, `"Enviando…"`, `"Confirmar"`, etc.) e ícones decorativos
  (`★`, `◂`, `▸`, `✎`) com `aria-hidden`. O test runner (`vitest`) e
  o Storybook não embarcam testes/stories no bundle de produção
  (`vitest.config.ts` aponta para `ui_kit/**/*.test.{ts,tsx}` e o
  build de produção via `rslib` ignora `*.stories.tsx` por convenção
  do entrypoint `ui_kit/index.tsx`).

### CSRF / autenticação

- **Resultado:** ✅ não aplicável. O Button é um primitive UI sem
  comportamento de rede; o diff não toca camada de transporte ou
  autenticação.

### Validação de input de usuário

- **Resultado:** ✅ não aplicável. Button não recebe input de
  usuário; nem o diff introduz validação ou parsing de entrada.

### `target="_blank"` / `rel="noopener"`

- **Resultado:** ✅ verificado e aderente.
- **Verificação:** o único `<a href>` no diff é o teste `[AC-4] asChild
  rendered as <a>` com `href="/home"` (relativo, sem `target="_blank"`).
  Nenhuma url externa em testes ou story.

### Audit de dependências

- **Resultado:** ✅ inalterado.
- **Verificação:** `package.json` não foi modificado. `jest-axe`,
  `@testing-library/*` e `vitest` já estão declarados como dev
  dependencies desde antes do worktree e atendem ao baseline atual de
  `npm audit`. O diff não adiciona dependência nova.

### CSP / `unsafe-inline`

- **Resultado:** ✅ não aplicável (a library não emite headers HTTP;
  CSP é responsabilidade do consumer).

### Logs com PII (lex-observability-required rule 3)

- **Resultado:** ✅ não aplicável. Os mocks de `console.warn` em
  `button.test.tsx` (pré-existentes) capturam apenas a string
  internacionalizada do guardrail dev-only de `size="icon"` — não
  contêm PII, tokens, ou dados de cartão. Os novos testes não
  introduzem chamadas a logger.

## Riscos residuais

| Risco | Severidade | Status |
|---|:---:|---|
| Story `DarkTheme` regenerar baseline visual no CI Ubuntu | Baixa (DX, não segurança) | Mitigado: label `regenerate-baselines` aplicada no PR conforme `feedback_visual_regression_ubuntu_sot.md`. |
| Novo teste a11y axe falhar em variantes específicas em dark | Baixa | Mitigado: `axeInThemes` é o padrão canônico do projeto e Badge/Card/Spinner já passam com tokens equivalentes. Falha real bloqueia o gate (intencional). |

## Conclusão

**Veredicto:** ✅ aprovado para Phase 6 (Gate 2).

Diff de Plan #21 é **revisão de testes + documentação + story de
visualização** — superfície de risco efetivamente nula em termos de
segurança runtime. Nenhum vetor OWASP relevante introduzido; nenhum
secret, dependência nova, ou alteração de transporte/auth.

A divergência Brand × Notion (Notion designa violeta como CTA
primário em light; implementação usa shadcn `--primary = orange`)
não é vetor de segurança — é decisão de design, roteada para Tech
Task separada por decisão do Fernando no Gate 1 (opção b).
