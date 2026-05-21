# Roteiro de migração — `wip/` → `ui_kit/`

Operacional. **Um componente por vez. Um PR por componente.** Ordem, receita e check-list
prontos pra rodar sem decisão ad-hoc. Este arquivo é vivo — marque ✅ conforme avança.

> Referências:
> - **`docs/BRAND.md`** — **fonte de verdade para branding** (paleta,
>   tipografia, tokens, motion, iconografia, AI-first). **Consulte antes de
>   qualquer decisão visual.**
> - `wip/preview/` — specs originais (tokens.html, colors-*.html, type-*.html,
>   spacing-radii-shadows.html, iconography*, branding.html, ai-first.html,
>   personas.html, components-react.html)
> - `MIGRATION.md` (original, o "porquê")
> - `HANDOFF.spec.md` (contexto do repo)
> - `wip/ui_kits/components/<Name>/` (fonte de features e padrões visuais)
> - `ui_kit/components/<slug>/` (destino — código de produção)

---

## 0. Contexto

- Já existem **45 componentes** em `ui_kit/components/` (React + Radix + Tailwind 4),
  porém minimalistas.
- O **`wip/ui_kits/components/`** tem **53 componentes** do PoC (HTML + CSS próprio),
  ricos em features e estados (size, state, ícones, prefix/suffix, etc.).
- A migração **eleva cada componente existente ao novo DoD**: 6 arquivos, tokens
  semânticos, testes ≥80% local, story, MDX, export, entry no CHANGELOG.
- Componentes do wip **que não existem** em ui_kit entram como novos componentes
  na lista (ex: AgentCard, ChatMessage, MetricCard, Kanban, Timeline, Stepper,
  Reconciliation, FileUpload, EmptyState, Chip, ButtonGroup, IconButton, Progress,
  Combobox, Command, TopBar, SidebarNav, Tree, ConfidenceIndicator, Logo, Logotipo).

---

## 1. Antes do primeiro componente (one-off)

- [x] `src/` → `ui_kit/` + 10 referências atualizadas
- [x] Baseline: `npm install`, `typecheck`, `test`, `build`, `docs:build`,
      `build-storybook` — todos verdes
- [x] Tokens semânticos no `ui_kit/styles/index.css` (@theme inline com
      `--primary` = laranja, `--secondary` = roxo Guardia)
- [x] `docs/src/pages/componentes/[slug].astro` carrega MDX de
      `docs/src/content/components/<slug>.mdx` quando existir (fallback stub
      quando não)
- [x] Coverage threshold = 25% com FIXME → 70% quando formulários estiverem testados
- [x] Button migrado, 13 testes ✅
- [ ] Mapa de tokens (esta tabela é a fonte de verdade)

### Mapa wip → ui_kit

Use quando encontrar uma classe hardcoded no wip:

| wip (hardcoded)              | ui_kit (semântico) · shadcn    | Guardia-native         | Observação                  |
| ---------------------------- | ------------------------------ | ---------------------- | --------------------------- |
| `bg-white`                   | `bg-background`                | `bg-surface`           | Superfície padrão           |
| `bg-gray-50` / `bg-slate-50` | `bg-muted`                     | `bg-[var(--bg-subtle)]`| Superfície secundária       |
| `bg-orange-*` (CTA)          | `bg-primary`                   | `bg-[var(--accent-brand)]` | CTA / ação primária     |
| `bg-violet-*` / `bg-purple-*`| `bg-secondary`                 | `bg-[var(--action)]`   | Autoridade / ação secundária|
| `bg-red-*`                   | `bg-destructive`               | `bg-[var(--danger)]`   | Erro                        |
| `bg-green-*`                 | —                              | `bg-[var(--success)]`  | Sucesso                     |
| `bg-yellow-*`                | —                              | `bg-[var(--warning)]`  | Atenção                     |
| `bg-blue-*`                  | —                              | `bg-[var(--info)]`     | Informativo                 |
| `text-gray-900`              | `text-foreground`              | `text-[var(--fg)]`     | Texto primário              |
| `text-gray-500`/`-600`       | `text-muted-foreground`        | `text-[var(--fg-muted)]`| Texto secundário           |
| `text-white` (em CTA)        | `text-primary-foreground`      | —                      | Texto sobre fill primary    |
| `border-gray-200`            | `border-border`                | `border-[var(--border-guardia)]` | Borda padrão       |
| `border-gray-300`            | `border-input`                 | —                      | Borda de input              |
| `ring-blue-500`/`ring-*`     | `ring-ring`                    | `ring-[var(--ring-guardia)]` | Anel de foco (laranja)|
| `rounded`/`rounded-lg`       | `rounded-md` (controles) / `rounded-lg` (cards) | mesmo | Seguir canon Guardia (§4.2 do brand.md) |
| `shadow-*` ad-hoc            | `shadow-sm`/`-md`/`-lg`        | mesmo                  | Tint violeta nativo         |

**Rampas de marca** (quando precisar de um tom específico de Orange/Violet/Pink/Yellow/Gray):
- `bg-guardia-orange-500`, `text-guardia-violet-700`, etc. (todos os 25 tons expostos como utilities)

**Signal colors** (só data-viz): `bg-signal-green|yellow|red|blue`. Para UI,
use `--success|warning|danger|info` via tokens semânticos.

**Regra:** se bater numa cor fora dessas tabelas, parar, consultar
`docs/BRAND.md`, adicionar o token em `ui_kit/styles/index.css` se
necessário, documentar no MDX. **Nunca** inventar uma cor solta.

---

## 2. Receita (8 passos por componente)

Idêntica ao `MIGRATION.md §3`. Aqui condensada em checklist executável:

### Passo 1 — Estrutura de pasta (DoD)

A estrutura atual do ui_kit é `index.tsx` + `<Name>.stories.tsx`. A migração
**mantém** `index.tsx` como entry e **expande** para a estrutura DoD:

```
ui_kit/components/<slug>/
├── index.tsx           # componente + export nomeado
├── <slug>.types.ts     # props + variants (CVA)
├── <slug>.test.tsx     # Vitest + Testing Library
├── <Name>.stories.tsx  # Storybook
└── <slug>.mdx          # docs rica (opcional, mas parte do DoD)
```

O MDX vai em `docs/src/content/components/<slug>.mdx` (onde o `[slug].astro`
carrega via `import.meta.glob`).

### Passo 2 — Ler wip/

```bash
cat wip/ui_kits/components/<Name>/index.tsx
cat wip/ui_kits/components/<Name>/index.css
cat wip/ui_kits/components/<Name>/<Name>.playground.html   # visual
```

Extrair: props expostas, variantes, estados, comportamento de foco, markup
semântico (labels, aria-\*).

### Passo 3 — Aplicar tokens

Abrir o `ui_kit/components/<slug>/index.tsx` atual, comparar com o wip, adicionar
features ausentes **usando só tokens semânticos** (mapa §1). Zero `bg-gray-*`,
`text-white`, `border-slate-*`.

### Passo 4 — Variantes com CVA

Extrair para `<slug>.types.ts`:

```ts
// Padrão do Button (ui_kit/components/button/index.tsx)
import { cva, type VariantProps } from "class-variance-authority";

export const <nome>Variants = cva("classes-base", {
  variants: { size: { sm, md, lg }, state: { default, error } },
  defaultVariants: { size: "md", state: "default" },
});

export type <Nome>Props = React.<Html>Attributes<Html> & VariantProps<typeof <nome>Variants>;
```

### Passo 5 — A11y

Checklist mínimo por componente:

- [ ] `forwardRef` (RHF precisa)
- [ ] `aria-invalid` quando `state === "error"`
- [ ] `aria-describedby` apontando pro helper/error text (se tiver)
- [ ] Foco visível: `focus-visible:ring-2 focus-visible:ring-ring`
- [ ] Disabled: `disabled:opacity-50 disabled:pointer-events-none`
- [ ] Contraste AA em light **e** dark (testar no Storybook toggle)
- [ ] Navegação por teclado (Tab, Enter, Space, Esc, setas quando aplicável)

### Passo 6 — Testes

Mínimo viável (padrão do `ui_kit/components/button/button.test.tsx`):

```ts
it("renders with default props");
it("applies each variant class");
it("applies each size class");
it("fires onChange/onClick");
it("does not fire when disabled");
it("forwards ref");
// Quando aplicável:
it("renders leadingIcon and trailingIcon");
it("sets aria-invalid when state === 'error'");
```

Alvo: **≥80% cobertura no arquivo** (medido pelo `test:coverage`).

### Passo 7 — Story + MDX

**Story** (`<Name>.stories.tsx`): Default, All sizes, All states, Com label +
helper, In a form (exemplo real).

**MDX** (`docs/src/content/components/<slug>.mdx`):

```mdx
## Quando usar

Breve parágrafo: o papel desse componente e quando ele é a ferramenta certa.

## Quando não usar

- Para X → use Y
- Para Z → use W

## Anatomia

(Diagrama simples ou bullets listando as partes)

## Props principais

| Prop    | Tipo      | Default    | Descrição |
| ------- | --------- | ---------- | --------- |
| `size`  | `sm\|md\|lg` | `md`    | ...       |
| `state` | `default\|error\|success` | `default` | ... |

## Exemplos

\`\`\`tsx
<Component size="lg" state="error" />
\`\`\`

## Acessibilidade

- `aria-*` setados
- Navegação por teclado: ...
- Foco visível via `ring-ring`

## Do's & Don'ts

- ✅ Usar em ...
- ❌ Não usar para ...
```

### Passo 8 — Export público + validação

```ts
// ui_kit/components/<slug>/index.tsx — já exporta
export { <Nome> };
export type { <Nome>Props };

// ui_kit/components/index.ts
export * from "./<slug>";
```

Validação local:

```bash
npm run typecheck && npm run lint && npm run test && npm run build
npm run docs:build
```

Tudo verde → commit + PR.

---

## 3. Ordem de migração (fila atômica)

Cada linha é um PR. A data fica em branco até ser mergeado.

### Semana 1 — Form primitives (P0)

| #  | Componente      | PR | Data merge | Notas                                        |
| -- | --------------- | -- | ---------- | -------------------------------------------- |
| 1  | **Input**       |    |            | Adicionar size/state/prefix/suffix/icons     |
| 2  | Textarea        |    |            | Adicionar auto-resize opcional               |
| 3  | Label           |    |            | Acessibilidade (for + id)                    |
| 4  | Checkbox        |    |            | Indeterminate state                          |
| 5  | Radio Group     |    |            | Orientation horizontal/vertical              |
| 6  | Switch          |    |            | Tamanhos sm/md                               |

### Semana 2 — Visual primitives (P0)

| #  | Componente      | PR | Data merge | Notas                                        |
| -- | --------------- | -- | ---------- | -------------------------------------------- |
| 7  | Badge           |    |            | Limpar `bg-*-[0-9]` hardcoded (5 ocorrências)|
| 8  | Avatar          |    |            | Fallback de iniciais                         |
| 9  | **Spinner**     |    |            | Novo componente (wip tem, ui_kit não)        |
| 10 | Separator       |    |            |                                              |
| 11 | Skeleton        |    |            |                                              |
| 12 | Typography      |    |            | Heading, Text, Lead                          |

### Semana 3 — Compostos simples (P1)

| #  | Componente      | PR | Data merge | Notas                                        |
| -- | --------------- | -- | ---------- | -------------------------------------------- |
| 13 | Card            |    |            | Card.Header, Card.Title, Card.Content        |
| 14 | Alert           |    |            | Variants: info, success, warning, destructive|
| 15 | Tooltip         |    |            |                                              |
| 16 | Tabs            |    |            |                                              |
| 17 | Accordion       |    |            |                                              |

### Semana 4 — Overlays (P2)

| #  | Componente      | PR | Data merge | Notas                                        |
| -- | --------------- | -- | ---------- | -------------------------------------------- |
| 18 | Dialog          |    |            |                                              |
| 19 | Alert Dialog    |    |            |                                              |
| 20 | Drawer          |    |            |                                              |
| 21 | Popover         |    |            |                                              |
| 22 | Dropdown Menu   |    |            |                                              |
| 23 | Sheet           |    |            |                                              |
| 24 | Context Menu    |    |            |                                              |
| 25 | Sonner (Toast)  |    |            |                                              |

### Semana 5 — Data entry avançado (P2)

| #  | Componente      | PR | Data merge | Notas                                        |
| -- | --------------- | -- | ---------- | -------------------------------------------- |
| 26 | Select          |    |            |                                              |
| 27 | **Combobox**    |    |            | Novo (wip tem, ui_kit não)                   |
| 28 | Multi Select    |    |            |                                              |
| 29 | Calendar        |    |            | (já existe, revisar)                         |
| 30 | Input OTP       |    |            |                                              |
| 31 | Form            |    |            | Revisar com padrão atual                     |
| 32 | Toggle          |    |            |                                              |
| 33 | Toggle Group    |    |            |                                              |

### Semana 6 — Dados & navegação (P2)

| #  | Componente      | PR | Data merge | Notas                                        |
| -- | --------------- | -- | ---------- | -------------------------------------------- |
| 34 | Table           |    |            | TanStack Table wrappers                      |
| 35 | Pagination      |    |            | Corrigir a11y (lint error já identificado)   |
| 36 | Breadcrumb      |    |            |                                              |
| 37 | Menubar         |    |            |                                              |
| 38 | Navigation Menu |    |            |                                              |
| 39 | Scroll Area     |    |            | Limpar `bg-gray-*` hardcoded (1 ocorrência)  |
| 40 | Navbar          |    |            | Corrigir lint errors (2 ocorrências)         |
| 41 | Sidebar         |    |            |                                              |
| 42 | Collapsible     |    |            |                                              |
| 43 | Chart           |    |            | Recharts wrappers                            |
| 44 | Badge Select    |    |            |                                              |
| 45 | Custom Icons    |    |            |                                              |

### Backlog — novos componentes (opcional, sob demanda)

| #  | Componente            | PR | Origem wip                       |
| -- | --------------------- | -- | -------------------------------- |
| 46 | Spinner               |    | `wip/ui_kits/components/Spinner` |
| 47 | Chip                  |    | `wip/ui_kits/components/Chip`    |
| 48 | ButtonGroup           |    |                                  |
| 49 | IconButton            |    |                                  |
| 50 | Progress              |    |                                  |
| 51 | Stepper               |    |                                  |
| 52 | FileUpload            |    |                                  |
| 53 | EmptyState            |    |                                  |
| 54 | Combobox              |    |                                  |
| 55 | Command               |    |                                  |
| 56 | AgentCard             |    | Guardia-specific                 |
| 57 | ChatMessage           |    | Guardia-specific                 |
| 58 | MetricCard            |    | Guardia-specific                 |
| 59 | ConfidenceIndicator   |    | Guardia-specific                 |
| 60 | Kanban                |    |                                  |
| 61 | Timeline              |    |                                  |
| 62 | Reconciliation        |    | Guardia-specific                 |
| 63 | TopBar                |    |                                  |
| 64 | SidebarNav            |    |                                  |
| 65 | Tree                  |    |                                  |

---

## 4. Fluxo operacional por componente (tático)

```bash
# 1. Branch
git checkout -b feat/<slug>-migrate

# 2. Ler o wip
cat wip/ui_kits/components/<Name>/index.tsx
cat wip/ui_kits/components/<Name>/index.css

# 3. Editar ui_kit/components/<slug>/index.tsx (adicionar CVA + features)
#    Criar <slug>.types.ts
#    Criar <slug>.test.tsx

# 4. Criar docs/src/content/components/<slug>.mdx

# 5. Validar
npm run typecheck
npm run lint
npm run test
npm run build
npm run docs:build

# 6. Visual smoke
npm run dev:all             # sobe Storybook :6006 + docs :4321

# 7. Commit + PR
git add ui_kit/components/<slug> docs/src/content/components/<slug>.mdx
git commit -m "feat(<slug>): migrate from wip with semantic tokens + tests + docs"
git push -u origin feat/<slug>-migrate
gh pr create --title "feat(<slug>): migrate to DoD" --body "…"
```

---

## 5. Definition of Done (por componente)

- [ ] Pasta `ui_kit/components/<slug>/` com `index.tsx`, `<slug>.types.ts`,
      `<slug>.test.tsx`, `<Name>.stories.tsx`
- [ ] `docs/src/content/components/<slug>.mdx` escrito
- [ ] Zero cores hardcoded (passa `npm run lint` + grep manual)
- [ ] Testes ≥80% no arquivo (`npm run test:coverage`)
- [ ] Story cobre todas as variantes + estados
- [ ] MDX tem "Quando usar" e "Quando não usar"
- [ ] A11y: foco visível, keyboard nav, aria-\* corretos, contraste AA
- [ ] Light **e** dark mode testados no Storybook
- [ ] Chromatic aprovado (cloud, no CI)
- [ ] Exportado em `ui_kit/components/index.ts`
- [ ] Entry adicionada no `docs/src/pages/changelog.astro` (seção "Unreleased")
- [ ] PR mergeado em `master`

---

## 6. Armadilhas comuns

- ❌ **Migrar 2+ componentes no mesmo PR.** Review fica impossível. Um por PR.
- ❌ **Copiar o JSX do wip e só trocar cor.** O wip tem markup pobre de a11y —
  reavaliar semântica HTML também.
- ❌ **Adicionar features novas durante a migração.** Migração = paridade visual
  + tokens + testes + a11y. Feature nova é PR separado depois.
- ❌ **Esquecer o dark mode.** Tokens resolvem 90%, mas testar explicitamente com
  o toggle do Storybook.
- ❌ **Pular o MDX.** Sem doc rica, o DS é só "uma pasta de componentes".
- ❌ **Quebrar a API pública sem nota.** Qualquer mudança de props → CHANGELOG.
- ❌ **Importar de `wip/`.** `wip/` é read-only (§10 do handoff). Copie o que
  precisar, nunca importe.

---

## 7. Meta

- 1 componente P0 primitivo por dia (6/semana).
- Compostos P1–P2 podem levar 2–3 dias.
- Estimativa: **4–6 semanas** pros 45 existentes; backlog de novos sob demanda.
