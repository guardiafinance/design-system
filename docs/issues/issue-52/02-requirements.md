# Requirements — #52 feat(switch): migrate Switch to v0.1.0 DoD

> Acceptance Criteria numerados, derivados do corpo das issues #52 + #53 e do bundle legacy `ux_references/ui_kits/components/Switch/`. Cada AC tem mapeamento direto para teste(s) (`AC-N` no nome ou docstring) e/ou para artefato Astro / Storybook / barrel.

## Acceptance Criteria

### AC-1 — API pública mínima

`Switch` exporta interface `SwitchProps` (estendendo `React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>`) com props:

- `size?: "sm" | "md"` (default `"md"`)
- `label?: React.ReactNode`
- `description?: React.ReactNode`
- `invalid?: boolean`
- `wrapperClassName?: string`
- todos os props nativos do Radix Switch (`checked`, `defaultChecked`, `disabled`, `onCheckedChange`, `id`, `className`, …)

**Teste:** `Switch.test.tsx` — `AC-1` na primeira describe.

### AC-2 — Renderização standalone (sem label)

Sem `label` e sem `description`, retorna apenas `<SwitchPrimitives.Root>` sem `<label>` wrapper.

**Teste:** `it("AC-2: renderiza standalone (sem label)")`.

### AC-3 — Renderização com label clicável

Com `label` (ou `description`), envolve em `<label htmlFor={id}>` nativo — clique no texto alterna o estado via `htmlFor`.

**Teste:** `it("AC-3: clique no label alterna o switch via htmlFor")`.

### AC-4 — Description com aria-describedby

Quando `description` é passada, gera id determinístico `{id}-desc` e o liga via `aria-describedby` no `<SwitchPrimitives.Root>`.

**Teste:** `it("AC-4: description gera aria-describedby")`.

### AC-5 — Sizes sm e md

- `size="sm"` → track 30×18 (h-[18px] w-[30px]), thumb 14×14, translate-x 12.
- `size="md"` → track 38×22 (h-[22px] w-[38px]), thumb 18×18, translate-x 16.
- Default = `md`.

Paridade visual com `ux_references/Switch/index.css` linhas 16-17, 28-29, 32-33.

**Teste:** `it("AC-5: size=sm aplica 30×18")` + `it("AC-5: size=md (default) aplica 38×22")`.

### AC-6 — Estados visuais (checked/unchecked)

- `checked=true` → `data-state=checked`; track `bg-action`; thumb translada `--translate-checked`.
- `checked=false` → `data-state=unchecked`; track `bg-muted` (sem fill); thumb em zero.

**Teste:** `it("AC-6: checked expõe data-state=checked")` + `it("AC-6: unchecked expõe data-state=unchecked")`.

### AC-7 — Estado disabled

`disabled=true` aplica `disabled:opacity-55` + `disabled:cursor-not-allowed` no `<label>` wrapper e no `<SwitchPrimitives.Root>`. Clique não dispara `onCheckedChange`.

**Teste:** `it("AC-7: disabled bloqueia clique")` + `it("AC-7: disabled aplica opacity-55")`.

### AC-8 — Estado invalid

`invalid=true` aplica `aria-invalid="true"` no `<SwitchPrimitives.Root>` e classe `aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/40` (anel vermelho).

**Teste:** `it("AC-8: invalid aplica aria-invalid e ring-destructive")`.

### AC-9 — Focus-visible com `--ring`

`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`.

**Teste:** `it("AC-9: focus-visible aplica ring-ring com offset")`.

### AC-10 — Tokens semânticos exclusivos

Zero cores hardcoded (`#`, `guardia-purple-*`, `guardia-orange-*`, `bg-violet-500`, `text-white`). Apenas tokens brand-aware: `bg-action`, `bg-muted`, `bg-background` (thumb), `text-fg`, `text-fg-muted`, `border-border-strong`, `ring-ring`, `ring-destructive`. `lex-brand-colors` + `lex-design-system-library`.

**Teste:** `it("AC-10: zero hex/cores hardcoded; apenas tokens brand-aware")`.

### AC-11 — Teclado Space alterna

`Space` no `<SwitchPrimitives.Root>` focado alterna o estado (Radix nativo). `lex-frontend-accessibility` rule 2.

**Teste:** `it("AC-11: Space alterna o switch (Radix native)")`.

### AC-12 — Auto-gera id quando não passado

`React.useId()` quando `id` ausente; respeita `id` customizado quando passado.

**Teste:** `it("AC-12: auto-gera id")` + `it("AC-12: respeita id customizado")`.

### AC-13 — Aceita className e wrapperClassName customizados

`className` aplica no `<SwitchPrimitives.Root>`; `wrapperClassName` aplica no `<label>` wrapper.

**Teste:** `it("AC-13: respeita className no root")` + `it("AC-13: respeita wrapperClassName no <label>")`.

### AC-14 — A11y light + dark sem violações axe

`Switch.test.tsx` usa `axeInThemes` (helper `@/test-utils/a11y`) para validar `expect(...).toHaveNoViolations()` em **light** e **dark** para:

- (a) Default (sem label) — só switch
- (b) Com label
- (c) Com label + description
- (d) Checked (estado interativo principal)
- (e) Invalid + label + description
- (f) Disabled

`lex-frontend-accessibility` + diretriz Notion Dark Mode + #125.

**Teste:** `describe("a11y")` em `Switch.test.tsx` com ≥ 6 testes.

### AC-15 — Storybook em light + dark

`Switch.stories.tsx` cobre: `Default`, `WithDescription`, `Checked`, `Invalid`, `Disabled`, `Sizes` (matriz sm × md), `Group` (composição com fieldset/legend), `DarkTheme` (matriz states × sizes + composição forçada para `data-theme="dark"` via `globals: { theme: "dark" }` e `backgrounds: { default: "dark" }`).

### AC-16 — Página Astro

`docs/src/pages/componentes/switch.astro` consome `ComponentPreview` com seções: Padrão, Com descrição, Estados, Tamanhos, Grupo (controlado), Playground (live editor), Props (tabela), Source code, Acessibilidade.

### AC-17 — Previews React

- `docs/src/previews/switch.tsx` — exports `BasicRow`, `WithDescriptionRow`, `StatesRow`, `SizesRow`, `GroupRow`, `StandaloneRow`.
- `docs/src/previews/switch-live.tsx` — `LiveSwitchSnippet` com `LiveProvider` + `CodeEditor` + `LivePreview` (padrão checkbox-live).

### AC-18 — Entrada no Set `MIGRATED`

`docs/src/pages/index.astro` linhas 678-700 (`const MIGRATED = new Set([…])`) inclui `"Switch"`, em ordem alfabética (entre `Spinner` e os demais — mantida a ordem do array existente).

### AC-19 — Barrel export

`ui_kit/components/index.ts` mantém `export * from "./switch";` (já presente). Validar que `import { Switch } from "@guardia/design-system"` resolve.

### AC-20 — Build verde

```bash
npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build
```

Cinco comandos verdes localmente antes do push (Gate 2).

### AC-21 — Aprovação de playground

Comparação lado-a-lado registrada no PR body: snapshot do `ux_references/Switch/Switch.playground.html` vs. a página `/componentes/switch/` migrada. Fernando registra "está bom" explícito antes do merge.

### AC-22 — Cobertura ≥ 80% no arquivo

`Switch.test.tsx` cobre ≥ 80% do `index.tsx` (estatísticas, ramos, funções) OU ≥ 20 testes de unidade — o que vier primeiro. Mensurado por `npm run test -- --coverage` quando a baseline do projeto suportar.

## Definition of Done (consolidada)

- [ ] AC-1 a AC-22 atendidos
- [ ] `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` verde
- [ ] Commit atômico único `feat(switch): migrate to v0.1.0 DoD — …`
- [ ] PR body com `Closes #53`
- [ ] Aprovação por playground "está bom" registrada no PR

## Out of scope

- Adição de variantes além do par `sm/md` (legacy ref tem apenas esses dois).
- Variants visuais alternativas (`brand`, `accent`) — removidos do baseline; substituídos pelo token único `--action` que já é brand-aware (violet light / orange dark).
- Adicionar tokens novos no `ui_kit/styles/index.css` além do que `Switch` estritamente precisa (escopo da issue).
- Refatorações não relacionadas em outros componentes.
- Mudança no contrato de outros componentes adjacentes (Checkbox, Radio).
- Migração de Switch para `__image_snapshots__` (visual regression é orquestrado por outra trilha — Plan #220 e companheiros).
