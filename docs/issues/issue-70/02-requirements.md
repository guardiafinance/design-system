# Phase 2 — Requirements: `Toast` v0.1.0 DoD

- **Issue:** [#70](https://github.com/guardiatechnology/design-system/issues/70)
- **Plan sub-issue:** [#71](https://github.com/guardiatechnology/design-system/issues/71)
- **Phase 1 brief:** [`01-brief.md`](./01-brief.md)
- **Drafted at:** 2026-05-29

Os ACs abaixo são vinculantes em Gate 1 (escopo) e Gate 2 (qualidade). Cada teste em `Toast.test.tsx` declara `AC-N:` na descrição (`it("AC-N: ...", ...)`) para satisfazer `lex-issue-driven` Regra 3 (rastreabilidade bidirecional AC ↔ teste).

## Acceptance Criteria

### Superfície pública (AC-1, AC-2)

- **AC-1.** O barrel `ui_kit/components/toast/index.tsx` exporta exatamente 9 símbolos públicos: `Toast`, `ToastProvider`, `ToastViewport`, `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose`, `useToast` (hook), e `toastVariants` (acessor CVA). Tipos auxiliares exportados: `ToastTone`, `ToastVariant`, `ToastPosition`, `ToastOptions`, `ToastInstance`.

- **AC-2.** `ui_kit/components/index.ts` adiciona `export * from "./toast";` mantendo a ordem alfabética próxima às outras Overlays. O export `./sonner` permanece intocado (Sonner não está no escopo desta migração).

### Matriz de tons (AC-3, AC-4)

- **AC-3.** CVA `toastVariants` declara `tone: "info" | "success" | "warning" | "error"`. O default é `info`. O mapeamento de tom para classe é semantico:
  - `info → bg-info-soft border-info text-info-fg`
  - `success → bg-success-soft border-success text-success-fg`
  - `warning → bg-warning-soft border-warning text-warning-fg`
  - `error → bg-danger-soft border-danger text-danger-fg`
  Idêntico ao Alert (ADR-011) — sem expansão de token nova.

- **AC-4.** O componente consome **apenas** tokens semânticos. Nenhum literal hex, nenhum `oklch(`, nenhuma classe `text-red-500` ou similar. Valida `lex-design-system-library` e `lex-brand-colors`. Em ambos os temas (`light` e `dark`), os tokens `bg-*-soft`/`border-*`/`text-*-fg` resolvem via `@theme inline` (já em `ui_kit/styles/index.css` após Alert #255).

### ARIA + Live Region (AC-5, AC-6)

- **AC-5.** `Toast.Root` (Radix `@radix-ui/react-toast` `Root`) recebe `type` derivado do `tone`:
  - `tone="info"` e `tone="success"` → `type="foreground"` (polite, `role="status"`)
  - `tone="warning"` e `tone="error"` → `type="background"` é insuficiente; força `type="background"` apenas para auto-dismiss tunning e adiciona `role="alert"` explícito (assertive)
  - **Default ARIA:** segue `lex-frontend-accessibility` Regra 6.2 — polite para feedback informativo, assertive para erro/aviso.

- **AC-6.** `ToastClose` é um `<button>` real (`Radix.Close`), com `aria-label="Fechar"` (sobrescritível). Reachable via `Tab` e activates com `Enter` ou `Space` (Radix nativo). `Esc` dispensa o toast em foco (Radix nativo).

### API imperativa + declarativa (AC-7, AC-8, AC-9)

- **AC-7.** `<ToastProvider>` envolve a app. Renderiza `<ToastViewport>` automaticamente (configurável via `viewportProps` se o consumidor precisa de override). `<ToastProvider>` aceita props:
  - `position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "bottom-center" | "top-center"` (default `"bottom-right"`)
  - `duration?: number` (default `5000` ms; `Infinity` ou `0` para persistente)
  - `limit?: number` (default `5`, número máximo de toasts simultâneos)
  - `swipeDirection?: "right" | "left" | "up" | "down"` (default segue `position`)

- **AC-8.** `useToast()` retorna `{ toast, dismiss, dismissAll }` onde:
  - `toast({ tone, title, description, duration, action, id })` retorna um id; ações pendentes são fila FIFO se já há `limit` toasts ativos
  - `dismiss(id)` remove o toast por id
  - `dismissAll()` esvazia o viewport
  Tipo `ToastOptions` documenta cada campo. Lançar `useToast` fora de `<ToastProvider>` produz erro descritivo (paridade com Alert context error).

- **AC-9.** A composição declarativa também é exposta. Um consumidor avançado pode renderizar `<Toast.Root>` + filhos manualmente quando precisa de markup customizado (e.g. avatar + barra de progresso). Recipe canônica idêntica à de Dialog/Popover (Radix wrapper sem reinventar layer state).

### Timing + comportamento (AC-10, AC-11, AC-12)

- **AC-10.** `duration` default é `5000` ms. Hover sobre o toast pausa o timer (Radix nativo). Foco no toast também pausa. `duration: Infinity` (ou `duration: 0`, alias compat com referência legada) torna persistente até `ToastClose` ser acionado ou `dismiss(id)` ser chamado.

- **AC-11.** Swipe horizontal dispensa o toast em dispositivos touch (Radix nativo, configurável via `swipeDirection`).

- **AC-12.** Ordem de empilhamento é FIFO. Quando `limit` é atingido, novos toasts entram em fila e ganham slot conforme o mais antigo é dispensado.

### Slots de composição (AC-13, AC-14)

- **AC-13.** `<ToastTitle>` renderiza linha principal em `font-medium` `leading-tight`. `<ToastDescription>` renderiza apoio em `leading-relaxed` com `text-sm`. Selectors internos `[&_p]:m-0 [&_p]:leading-relaxed` para múltiplos parágrafos (paridade com Alert).

- **AC-14.** `<ToastAction>` renderiza um `<button>` (Radix `Action`) à direita do conteúdo. Aceita `altText` (Radix exige, para screen readers em modo `aria-live="assertive"`). Estilo: ghost-like com `text-current opacity-80 hover:opacity-100` para se misturar ao tom da superfície.

### Acessibilidade jest-axe (AC-15, AC-16, AC-17, AC-18)

- **AC-15.** `axeInThemes` (helper `ui_kit/test-utils/a11y.ts`) executa em `light` E `dark` sobre o estado **Default** (`tone="info"` sem actions, sem close). 0 violações.

- **AC-16.** `axeInThemes` executa em `light` E `dark` sobre cada tom (`info`, `success`, `warning`, `error`) com `ToastTitle` + `ToastDescription` renderizados. 0 violações por tema/tom (8 invocações).

- **AC-17.** `axeInThemes` executa em `light` E `dark` sobre o estado **com ação** (`<ToastAction>` + `<ToastClose>`). 0 violações.

- **AC-18.** `axeInThemes` executa em `light` E `dark` sobre o estado **assertivo** (`tone="error"`, `role="alert"` verificado). 0 violações.

### Storybook (AC-19, AC-20)

- **AC-19.** `Toast.stories.tsx` exporta no mínimo 8 stories: `Default`, `Tones`, `WithAction`, `WithTitleOnly`, `WithDescription`, `Persistent`, `Positions`, `Stacked`. Cada story renderiza corretamente em `light` e `dark` via toggle global do Storybook.

- **AC-20.** `meta.parameters.layout = "padded"` e `meta.parameters.docs.description.component` documenta a relação Toast / Alert / Dialog. Story `Stacked` dispara 4 toasts em sequência com `setTimeout` para demonstrar o limite e a fila.

### Cobertura behavioral (AC-21, AC-22)

- **AC-21.** `Toast.test.tsx` contém **≥ 20 testes** OU atinge **≥ 80% de cobertura** no arquivo `ui_kit/components/toast/index.tsx`. Cada `it(...)` declara `AC-N:` na descrição.

- **AC-22.** Os testes usam queries acessíveis (`getByRole`, `getByLabelText`, `findByText`) conforme `lex-frontend-testing`. **Não** mocam colaboradores internos (context, hook, Radix). Mockam apenas timers (`vi.useFakeTimers()`) para validar `duration`.

### Docs + catálogo (AC-23, AC-24, AC-25)

- **AC-23.** `docs/src/pages/componentes/toast.astro` existe seguindo o template `ComponentPreview.astro` (kicker `COMPONENTES · OVERLAYS`, group `Overlays`, storybookId `components-toast--default`, sourcePath `ui_kit/components/toast`) com lede descrevendo Toast como feedback transiente e linkando Alert / Dialog para feedback persistente / modal.

- **AC-24.** `docs/src/previews/toast.tsx` exporta funções de preview consumidas pela página Astro: `BasicRow`, `TonesRow`, `ActionsRow`, `PositionsRow`, `PersistentRow`, `StackedRow`. Cada preview usa a mesma API pública. Conteúdo dos previews usa a prop `tone` do Toast (não `<span text-destructive>` externo — `feedback_story_no_external_destructive_helper`).

- **AC-25.** O Set `MIGRATED` em `docs/src/pages/index.astro` adiciona `"Toast"` (ordem alfabética).

### Decisão arquitetural (AC-26)

- **AC-26.** **ADR-014** `docs/adr/ADR-014-toast-v0.1.0-dod-migration.md` registra com `status: accepted` desde o commit:
  - Adoção de `@radix-ui/react-toast` como base (alternativa Sonner rejeitada com justificativa)
  - API imperativa `useToast()` + primitivas declarativas Radix coexistindo
  - Mapeamento `tone → role/type` ARIA
  - Defaults: `duration=5000`, `limit=5`, `position="bottom-right"`, `swipeDirection` derivado
  - Reutilização integral dos tokens de tom de ADR-011 — sem expansão nova
  - Coexistência com `Sonner` legado (Sonner permanece exportado; depreciação fica fora do escopo)

### Build & lint (AC-27, AC-28, AC-29)

- **AC-27.** `npm run typecheck` (tsc strict per `lex-frontend-typing`) passa com 0 erros, incluindo o `Toast.stories.tsx` (que é checado por `tsconfig.test.json`).

- **AC-28.** `npm run lint` (ESLint, regras `jsx-a11y`, `no-restricted-imports`, `no-console`) passa com 0 erros e 0 warnings nos arquivos novos.

- **AC-29.** `npm run build` (rslib) e `npm run docs:build` (Astro) ambos passam. O bundle expõe `Toast`, `ToastProvider`, etc. em `dist/index.d.ts`.

## Out of scope (não revisitar nesta migração)

- Remoção ou depreciação do `Sonner`. Sonner continua exportado em `ui_kit/components/sonner/`. Decisão futura via Issue separada.
- Adição de novos tons além de `info | success | warning | error`. A paleta é fechada (ADR-011).
- Expansão dos tokens em `ui_kit/styles/index.css`. Toast reutiliza integralmente o que ADR-011 já cravou.
- Visual regression baselines (`__image_snapshots__/`). Não auto-aplicar `regenerate-baselines` — o baseline de `Default` se houver será revisado manualmente.
- Componente Banner / InlineMessage (futuros consumidores das mesmas tokens).
