# Phase 3 — Architecture: Plan #87 (Tabs v0.1.0 DoD)

> **Revisão de Gate 1 (2026-05-28):** o stakeholder direcionou o componente
> para o novo padrão visual (`Tabs.playground.html` + `index.css` em
> Downloads). As decisões D1–D6 abaixo foram **reescritas**. As decisões
> originais (CVA `size`+`orientation`, aba ativa neutra de marca) foram
> substituídas. Resumo do redirect:
>
> - API: **padrão composto Radix-style** (`Tabs / TabsList / TabsTrigger / TabsContent`),
>   alinhado com Select/Combobox/DatePicker/Switch do DS. A referência canônica
>   em `ux_references/ui_kits/components/Tabs/` expunha `items: TabItemProps[]`
>   (array prop) + namespace `Tabs.Item`; essa shape foi descartada em favor do
>   padrão Radix-wrapper composto consistente com o resto do design-system —
>   `items[]` programático teria sido outlier no catálogo.
> - Três variantes visuais novas: `underline` (default), `pills`, `boxed` —
>   variantes haviam sido marcadas out-of-scope no `02-requirements.md`
>   original; agora são parte do escopo do Plan.
> - `size`: apenas `sm` e `md` (o `lg` original foi removido).
> - `orientation`: removida do escopo (a referência visual cobre apenas
>   horizontal).
> - Nova subcomponente `TabsBadge` para pílulas de contagem dentro de
>   `TabsTrigger`.
> - `icon` **não é prop tipada** por item: a referência canônica expunha
>   `icon?: string` em `TabItemProps` + render condicional via `(window as any).Icon`;
>   o componente migrated suporta ícones por composição JSX
>   (`<FileText className="h-4 w-4" /> Lançamentos` dentro do `TabsTrigger`),
>   padrão consistente com Select/Combobox/DatePicker do DS.
> - A aba ativa do `boxed` consome `bg-action` + `text-button-fg` — passa a
>   tocar a divergência Plan #208 em dark mode, deliberadamente, em troca de
>   consistência com Button/Combobox/DatePicker. Detalhe em D4.

## Inspeção do estado atual (baseline em `feat/86-tabs`)

`ui_kit/components/tabs/index.tsx` foi reescrito para a nova direção. Detalhes
neste documento.

## Decisão (D1): API composta preservada + contexto único

Mantém-se `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` e adiciona-se
`TabsBadge`. O barrel já exporta `* from "./tabs"`; os 5 nomes ficam disponíveis
sem mudança de configuração.

- `variant` e `size` são props de `Tabs` (root), declaradas uma única vez e
  propagadas a `TabsList` e `TabsTrigger` via `TabsStyleContext` interno
  (substitui o `TabsSizeContext` da revisão anterior — agora carrega ambos).
- Triggers podem sobrescrever `size` individualmente (uso de exceção; o
  default é herdar do contexto).

## Decisão (D2): três variantes via CVA

Dois blocos `cva`:

### `tabsListVariants`

| variant | classes do track |
|---|---|
| `underline` (default) | `gap-1 border-b border-border` — guia visual sob os triggers |
| `pills` | `gap-1 rounded-full bg-muted p-1` — track elevado em pílula |
| `boxed` | `gap-1` — sem track; cada trigger é um card |

### `tabsTriggerVariants`

Base comum a todas as variantes: layout flex, tipografia média, transições,
hover muda para `text-fg`, foco anel laranja com offset, disabled
`opacity-50`.

Cada variante define as classes específicas + override de
`[&_.tabs-badge]` quando ativa:

| variant | inativa | hover | ativa | badge ativa |
|---|---|---|---|---|
| `underline` | `border-b-2 border-transparent -mb-px` | `text-fg` | `text-action-hover` + `border-action` | `bg-bg-hover` + `text-action-hover` |
| `pills` | `rounded-full` | `text-fg` | `bg-background` + `text-action-hover` + `shadow-sm` | `bg-bg-hover` + `text-action-hover` |
| `boxed` | `border-border bg-background rounded-md` | `bg-bg-hover` + `border-action` | `bg-action` + `text-button-fg` + `border-action` | `bg-button-fg/25` + `text-button-fg` |

`compoundVariants` × `size`:

| variant | size | padding + texto |
|---|---|---|
| underline | md | `px-3.5 py-2.5 text-sm` |
| underline | sm | `px-3 py-2 text-[13px]` |
| pills | md | `px-3.5 py-1.5 text-[13.5px]` |
| pills | sm | `px-3 py-[5px] text-[12.5px]` |
| boxed | md | `px-3.5 py-2 text-[13.5px]` |
| boxed | sm | `px-3 py-1.5 text-[12.5px]` |

Tokens consumidos (todos válidos, verificados em `ui_kit/styles/index.css`):
`text-fg-muted`, `text-fg`, `text-action-hover`, `text-button-fg`,
`bg-muted`, `bg-background`, `bg-action`, `bg-bg-hover`,
`border-border`, `border-action`, `ring-ring`, `shadow-sm`. **Zero hex**.

## Decisão (D3): `TabsBadge` com override descendente

`TabsBadge` é um `<span>` com a classe `tabs-badge` e estilo inativo padrão
(`bg-muted` + `text-muted-foreground`). O trigger ativo sobrescreve via
seletor descendente `[&_.tabs-badge]` na CVA do trigger (ver D2). Isso evita
acoplar o badge ao contexto da variante (badge desconhece o pai); a estilização
ativa flui via cascade CSS.

Compor:

```tsx
<TabsTrigger value="lanc">
  <FileText className="h-4 w-4" />
  Lançamentos
  <TabsBadge>248</TabsBadge>
</TabsTrigger>
```

## Decisão (D4): `boxed` ativa CONSOME `bg-action` (revisão D3 original)

A decisão D3 original (não consumir `--action` para evitar Plan #208) foi
**revogada** para a variante `boxed`. Razões:

1. O novo design pede uma pílula sólida na aba ativa do boxed; manter neutra
   (`bg-background`) descaracterizaria visualmente a variante.
2. Usar `bg-guardia-purple-500` literal (pinning de marca em light+dark)
   bypassaria o token chain do design-system e ficaria como única exceção do
   catálogo (Button, IconButton, Combobox, DatePicker, Checkbox usam `bg-action`).
3. Consumir `bg-action` + `text-button-fg` mantém boxed alinhado ao token
   chain canônico — em dark mode pinta laranja, exatamente como os botões
   primários da plataforma (consistente com a diretriz Notion: "em superfícies
   escuras, laranja assume o papel de cor de ação preferencial").
4. Plan #208 (inversão violet/orange) corrigirá boxed globalmente quando
   entregue, sem PR adicional aqui.

As variantes `underline` e `pills` permanecem neutras do `--action` no
**background** (track / pílula): o ativo usa `text-action-hover` (token, ok)
mas NÃO `bg-action` — o paint principal continua neutro.

## Decisão (D5): acessibilidade (ARIA Authoring Practices — Tabs)

Tudo Radix-nativo:

- `role="tablist"` (List), `role="tab"` por trigger, `role="tabpanel"` por content.
- `aria-selected` na aba ativa, `data-state="active|inactive"`, `tabindex` roving.
- Teclado: ←/→ navegam, `Home`/`End` saltam (horizontal-only — orientation foi removida).
- Focus-visible: `ring-2 ring-ring ring-offset-2 rounded-sm`, nunca removido.

## Decisão (D6): testes — suíte reescrita

Suíte refeita para cobrir as três variantes, sizes, badge e a matriz de
acessibilidade. Alvo ≥ 20 `it()` comportamentais (34 atingidos) + ≥ 3 cenários
`axeInThemes` (4 atingidos). Queries acessíveis, zero mocks internos. O teste
"não consome `--action`" do baseline foi substituído por testes específicos
de cada variante.

## Matriz de componentes / arquivos (escopo do PR)

| Arquivo | Status | Razão |
|---|---|---|
| `ui_kit/components/tabs/index.tsx` | **reescrito** | 3 variantes + size + TabsBadge (D1–D4) |
| `ui_kit/components/tabs/tabs.test.tsx` | **reescrito** | suíte cobrindo as 3 variantes + badge + a11y light/dark (D6) |
| `ui_kit/components/tabs/Tabs.stories.tsx` | **reescrito** | Default(underline) · Pills · Boxed · Sizes · Disabled · DarkTheme |
| `docs/src/pages/componentes/tabs.astro` | **reescrito** | seções por variante |
| `docs/src/previews/tabs.tsx` | **reescrito** | UnderlineRow · PillsRow · BoxedRow · SizesRow · DisabledRow |
| `docs/src/previews/tabs-live.tsx` | **reescrito** | LiveTabsSnippet com `TabsBadge` |
| `docs/src/pages/index.astro` | **inalterado** desde o commit anterior | `"Tabs"` já no Set `MIGRATED` |
| `ui_kit/components/index.ts` | inalterado | `export * from "./tabs"` já presente |
| `docs/issues/issue-86/0{1,2,3,5,6}-*.md` | **atualizado** | reflete o redirect |

Qualquer outro arquivo no diff = scope creep, bloqueio no Gate 2.

## ADRs

Nenhum ADR novo. As decisões arquiteturais (consumo de `bg-action` na boxed,
três variantes, contexto único) estão documentadas aqui (D2–D4). Não há
acoplamento cross-context novo. A mudança de comportamento entre commits do
mesmo PR é coberta pela revisão do stakeholder (Gate 1).

## Riscos

| Risco | Mitigação |
|---|---|
| Baselines visuais divergem do paint anterior (mesma label já aplicada) | Label `regenerate-baselines` já está no PR; CI regenera automaticamente |
| Boxed ativa em dark fica laranja por causa do token chain | Documentado em D4; Plan #208 corrige a inversão global |
| Reescrita derruba consumidores do `size="lg"` ou `orientation="vertical"` | Tabs é first-class novo no v0.1.0 — não havia consumidores na plataforma; breaking change deliberado dentro da mesma migração |
