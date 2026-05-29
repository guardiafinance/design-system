# ADR-014 — Migrate Toast to v0.1.0 DoD (Overlays/Feedback transient)

- **Status:** accepted
- **Date:** 2026-05-29
- **Deciders:** @fernandoseguim (CODEOWNER), `warrior-athena` (Issue-Driven flow orchestrator)
- **Precedents:** ADR-005 (Popover), ADR-006 (Menu), ADR-007 (Tooltip), ADR-010 (Dialog), **ADR-011 (Alert) — anchor for tone tokens**
- **Issue:** [#70](https://github.com/guardiatechnology/design-system/issues/70)
- **Plan:** [#71](https://github.com/guardiatechnology/design-system/issues/71)

## Context

`Toast` é o canal canônico de **feedback transiente** no catálogo Overlays. O baseline atual no monorepo é a wrapper `Sonner` (`ui_kit/components/sonner/index.tsx`) — um wrapper minimalista sobre o pacote `sonner` (~ 25 linhas) que satisfaz casos comuns mas falha o DoD do v0.1.0 em três frentes objetivas:

1. **API canônica divergente.** A referência em `ux_references/ui_kits/components/Toast/` documenta uma API `<ToastProvider>` + `useToast()` com `toast.show({ type, title, description, duration, action })`. Os consumidores já viram essa API no playground legacy; introduzir Toast novo com formato Sonner-only (`toast.success(...)`) cria divergência cognitiva.
2. **Token contract incompatível.** Sonner usa tokens próprios (`--normal-bg`, `--normal-text`, `--success-bg`, ...) que não conversam com o token chain de ADR-011 (`--info-soft`, `--success-soft`, ...). Isso bloqueia paridade visual com Alert no mesmo flow (e.g. "Importação concluída" como Alert persistente vs Toast transiente — tons precisam ser idênticos para o usuário entender que é o mesmo conceito).
3. **DoD itens não atendidos.** Falta página em `docs/src/pages/componentes/`, falta entrada no Set `MIGRATED`, faltam testes behavioral com queries acessíveis, falta cobertura jest-axe light+dark.

O Plan #71 declara o escopo: migrar Toast para v0.1.0 DoD usando o recipe canônico de Overlays (Radix wrapper + CVA + tokens semânticos + axeInThemes + Astro page).

Decisões arquiteturais que precisam ser cravadas em ADR (e não diluídas no commit):

- **Escolha do base primitive.** Radix `@radix-ui/react-toast` vs continuar com Sonner.
- **Modelo de API.** Imperativo (`useToast`) vs declarativo (composição), e como coexistem.
- **Mapeamento ARIA.** `role="status"` (polite) vs `role="alert"` (assertive) por tom.
- **Defaults.** `duration`, `limit`, `position`, `swipeDirection`.
- **Coexistência com Sonner.** Manter ou remover o export legado.

## Decision

Migrar Toast ao v0.1.0 DoD seguindo o recipe **Dialog/Popover (ADR-010 / ADR-005)** adaptado para componente transiente:

1. **Base primitive — `@radix-ui/react-toast`.** Adoção do pacote Radix oficial como base. O wrapper traduz a primitive para a superfície imperativa documentada na referência (mantém familiaridade) e re-exporta as primitivas para composição avançada (paridade com Dialog/Popover).

2. **API imperativa canônica + primitivas declarativas coexistindo:**
   - **Imperativa (default):** `<ToastProvider>` + `useToast()` retornando `{ toast, dismiss, dismissAll }`. `toast({ tone, title, description, duration, action, id })` retorna um id.
   - **Declarativa (poder):** `<Toast.Root>`, `<ToastTitle>`, `<ToastDescription>`, `<ToastAction>`, `<ToastClose>`, `<ToastViewport>` para composição customizada (markup com avatar, barra de progresso, etc.).
   - Os dois modos compartilham o mesmo estado interno (reducer dentro do Provider). Misturar ambos no mesmo Provider é suportado.

3. **9 símbolos públicos** (mais 5 tipos): `Toast` (alias do Radix Root), `ToastProvider`, `ToastViewport`, `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose`, `useToast`, `toastVariants`. Tipos: `ToastTone`, `ToastVariant`, `ToastPosition`, `ToastOptions`, `ToastInstance`.

4. **CVA `tone` matrix idêntica ao Alert (ADR-011):** `"info" | "success" | "warning" | "error"`. Default `info`. Mapeamento `tone → bg-{token}-soft border-{token} text-{token}-fg` usando o mesmo chain de tokens cravado em ADR-011. **Sem expansão de token nova** — esta é a economia direta de ADR-011 cláusula "Tone token expansion" ter sido feita prevendo Toast.

5. **Mapeamento ARIA explícito por tom:**
   - `tone="info"` e `tone="success"` → Radix `type="foreground"` (polite live region, `role="status"`).
   - `tone="warning"` e `tone="error"` → Radix `type="foreground"` mantido para consistência de comportamento, mas com `role="alert"` (assertive) sobrescrevendo o default polite via prop `role` no Radix `Toast.Root`.
   - Justificativa: feedback de erro/aviso interrompe o fluxo do usuário sem ser modal — `role="alert"` é o canal certo. Feedback informativo/positivo enfileira sem interromper — `role="status"`. Casamento com `lex-frontend-accessibility` Rule 6.2 e ADR-011 cláusula 7.

6. **Defaults:**
   - `duration = 5000` ms. Hover pausa o timer (Radix nativo). Foco pausa o timer.
   - `duration = Infinity` ou `0` torna persistente (alias compat com a referência legacy).
   - `limit = 5` toasts simultâneos. Excedentes vão para fila FIFO; entram em slot quando um existente é dispensado.
   - `position = "bottom-right"`. Alternativas suportadas: `bottom-left`, `top-right`, `top-left`, `bottom-center`, `top-center`.
   - `swipeDirection` derivado de `position` (`right` em `bottom-right`/`top-right`, `left` em `bottom-left`/`top-left`, `down` em `bottom-center`, `up` em `top-center`).

7. **Coexistência com Sonner.** `ui_kit/components/sonner/index.tsx` **permanece** no barrel exportado. Sonner segue como utility drop-in para casos onde o consumidor quer um notifier app-wide sem montar `<ToastProvider>`. Toast é a primitiva DoD-completa. Depreciação ou migração de Sonner é decisão futura via Issue separada — não está no escopo desta migração.

8. **A11y coverage (`axeInThemes`)** sobre 4 estados × 2 temas = 8 invocações garantidas + 2 invocações para Default e Assertive = **mínimo de 10 invocações jest-axe** explícitas em `Toast.test.tsx`. Todos os tons em ambos os temas validados.

9. **ADR `accepted` desde o primeiro commit.** Commit atômico carrega código + ADR + docs juntos. Sem pattern `proposed → accepted` (Argos sinalizou 🟡 em PR #237 quando esse pattern foi seguido).

## Consequences

### Positive

- Toast alcança paridade DoD com Alert / Dialog / Popover / Menu / Tooltip (mesmo recipe Radix-wrapper, mesmo token contract, mesmo rigor de teste).
- A reutilização de tokens de ADR-011 demonstra o **retorno do investimento** dessa expansão — Toast cai pronto no chassis, sem reabrir token contract.
- API imperativa preserva a familiaridade do playground legacy; primitivas declarativas dão poder de composição para casos avançados (e.g. AI-First chat com Toast de "Isac processando…" mostrando barra de progresso real).
- Sonner intocado — zero risco de quebrar consumidores existentes.
- Catálogo Overlays avança 1 componente em direção ao 52 do v0.1.0.

### Negative

- **+1 dependência:** `@radix-ui/react-toast`. Custo mínimo — já consumimos 14 packages do mesmo monorepo Radix; o pin segue `^1.x.x` consistente com `@radix-ui/react-tooltip` `^1.2.8`.
- **Coexistência Sonner + Toast** cria duas APIs para o mesmo conceito no catálogo. Documentação na página Astro (`toast.astro`) explica quando usar qual.
- O consumidor precisa montar `<ToastProvider>` na raiz da app para usar a API imperativa — Sonner não exige isso. Mitigado por exemplo na docs.

### Neutral

- Adições no `package.json` (`@radix-ui/react-toast` + transitiva nenhuma significativa) e `package-lock.json`.
- 1 novo diretório (`ui_kit/components/toast/`) + 1 nova página docs + 1 ADR. Total: ~8 arquivos novos + 2 modificados.

## Alternatives considered

1. **Continuar com Sonner como primitiva v0.1.0.** Rejeitado — Sonner usa token chain próprio incompatível com ADR-011, não expõe a API canônica documentada na referência, e a customização de `position`/`limit`/`role` por toast é limitada pelas opções que o pacote `sonner` aceita.

2. **Construir Toast do zero (sem Radix), apenas com state + portal manual.** Rejeitado — replicar swipe-to-dismiss, pause-on-hover/focus, focus management cross-toast, e cross-browser live region semantics manualmente é overhead alto e propenso a bugs sutis. Radix Toast já resolveu tudo isso com ~3kb gzipped.

3. **Adotar `@radix-ui/react-toast` com API só declarativa (sem `useToast`).** Rejeitado — quebra a familiaridade do playground legacy e exige que cada consumidor implemente seu próprio reducer de fila. A API imperativa é o que torna Toast plug-and-play.

4. **Adotar Toast e remover Sonner no mesmo PR.** Rejeitado — escopo creep. Sonner pode ter consumidores externos (apps Guardia) que dependem da API atual; migração deve ser feita em PR dedicado com janela de deprecation e changelog claro.

5. **Mapear todos os tons para `role="status"` (polite uniforme).** Rejeitado — `lex-frontend-accessibility` Rule 6.2 exige assertive para erro/aviso quando o feedback é crítico. Polite uniforme deixa erros silenciosos para usuários de tecnologia assistiva. Decisão por `role` dinâmico em função de `tone` é mais conservadora.

6. **Usar `aria-live="polite"` / `aria-live="assertive"` em vez de `role="status"` / `role="alert"`.** Rejeitado — `role` é semanticamente mais explícito e melhor suportado por screen readers atuais (NVDA, JAWS, VoiceOver). `aria-live` é a primitiva sob o role; usar diretamente exigiria também marcar `aria-atomic` e `aria-relevant`, redobrando complexidade.

## Implementation note (acceptance criteria mapping)

| ADR clause | Plan AC |
|------------|---------|
| 1. `@radix-ui/react-toast` base | AC-1 (surface), AC-3..AC-14 (Radix-derived behavior) |
| 2. Imperative + declarative coexistence | AC-7, AC-8, AC-9 |
| 3. 9-symbol surface | AC-1 |
| 4. Tone matrix reusing ADR-011 tokens | AC-3, AC-4 |
| 5. ARIA mapping `tone → role` | AC-5, AC-6, AC-18 |
| 6. Defaults (duration/limit/position/swipe) | AC-7, AC-10, AC-11, AC-12 |
| 7. Sonner coexistence | AC-2 (out of scope of removal); explicit in `01-brief.md` |
| 8. axeInThemes coverage ≥ 10 invocations | AC-15..AC-18 |
| 9. Accepted at first commit | AC-26 |
