# Requirements — Plan #87

Critérios numerados, mapeados 1:1 com o DoD do Plan sub-issue #87 + parent
Issue #86. Cada teste de unidade adicionado nesta fase referencia o respectivo
`AC-N` no nome ou docstring, satisfazendo `lex-issue-driven` regra 3
(traçabilidade AC↔teste).

## Aceitação

### AC-1 — Componente com CVA: `variant` + `size` sobre tokens semânticos

> **Revisão de Gate 1 (2026-05-28):** este AC foi reescrito após o stakeholder
> redirecionar o design para o padrão de 3 variantes (underline / pills /
> boxed). O AC original cobria `size` + `orientation`; agora cobre `variant` +
> `size`. Detalhe em `03-architecture.md` § Revisão de Gate 1.

`ui_kit/components/tabs/index.tsx` ganha variantes via `class-variance-authority`:

- `variant`: `underline` (default) / `pills` / `boxed` — declarado em `Tabs`
  (root) e propagado a `TabsList` e `TabsTrigger` via `TabsStyleContext`.
- `size`: `sm` / `md` (default) — propagado pelo mesmo contexto.

Adiciona-se a subcomponente `TabsBadge` (pílula de contagem). Apenas tokens
semânticos: `bg-muted` (track pills), `text-fg-muted`/`text-muted-foreground`
(estado inativo), `text-action-hover` + `border-action` (active underline),
`bg-background` + `shadow-sm` (active pills), `bg-action` + `text-button-fg`
(active boxed — toca Plan #208 em dark mode, documentado em D4),
`bg-bg-hover`/`bg-button-fg/25` (badge ativo). **Zero hex hardcoded.**

**Verificação:**
- `grep -E "cva\(" ui_kit/components/tabs/index.tsx` retorna match (≥ 2 blocos).
- Render por variante aplica classes distintas; `boxed` ativa usa `bg-action` + `text-button-fg`.
- Nenhum valor hex no arquivo.

### AC-2 — Storybook: `Default` + variantes principais em light **e** dark

`Tabs.stories.tsx` cobre `Default`, `Sizes`, `Vertical`, `Disabled` (aba
desabilitada) e uma story `DarkTheme` dedicada que força
`globals: { theme: "dark" }` + `parameters.backgrounds.default: "dark"` e
renderiza a matriz representativa (sizes × orientação + aba ativa/inativa/
desabilitada) sobre superfície Mono Black, seguindo o padrão Avatar (PR #119) /
Combobox (PR #39).

**Verificação:**
- `grep -E "^export const DarkTheme" ui_kit/components/tabs/Tabs.stories.tsx` retorna match.
- `npm run build` (Storybook incluso no pipeline) verde.
- Inspeção visual via toolbar confirma render correto em ambos os temas.

### AC-3 — Behavioral tests cobrindo a matriz do DoD (≥ 20 OU ≥ 80% cobertura)

`ui_kit/components/tabs/tabs.test.tsx` exercita comportamento do usuário via
queries acessíveis (`getByRole`, `getByText`), atinge **≥ 20 casos** OU
**≥ 80% de cobertura de linhas** no arquivo `index.tsx`, sem mockar
colaboradores internos. Matriz mínima:

- **Render/ARIA:** `role="tablist"`, `role="tab"` por trigger, `role="tabpanel"`,
  `aria-selected="true"` na aba ativa, `aria-orientation` correto.
- **Seleção:** clique troca de aba (`data-state=active`), painel correspondente
  visível, painéis inativos ocultos; modo controlado respeita `value` externo.
- **Teclado (ARIA Authoring Practices):** ←/→ navegam em horizontal, ↑/↓ navegam
  em vertical, `Home`/`End` saltam para primeira/última aba.
- **Variants:** `size="sm"`/`"lg"` aplicam classes distintas; `orientation="vertical"`
  expõe `data-orientation`.
- **Disabled:** trigger desabilitado não recebe seleção via clique.
- **Brand-aware:** classes da aba ativa/inativa usam tokens (sem hex hardcoded,
  sem `guardia-purple-*` literal); focus usa `ring-ring`.

**Verificação:** `grep -cE "^\s*(it|test)\(" tabs.test.tsx` ≥ 20, todos passando
em `npm run test`; cobertura do arquivo reportada no `06-quality-report.md`.

### AC-4 — A11y jest-axe em light + dark via `axeInThemes`

`tabs.test.tsx` chama `axeInThemes(container)` (helper em
`ui_kit/test-utils/a11y.ts`) para os estados canônicos de paint, rodando axe
sequencialmente em light + dark (helper alterna `data-theme` no `<html>`):

1. `default` — tablist horizontal, aba 1 ativa.
2. `interativo` — aba 2 ativa após seleção (estado ativo/inativo no mesmo paint).
3. `vertical` — orientação vertical renderizada.
4. `disabled` — uma aba desabilitada presente.

**Verificação:** `grep -cE 'axeInThemes\(container\)' tabs.test.tsx` ≥ 3, todos
passando com `toHaveNoViolations()`.

### AC-5 — Docs Astro + previews + entrada no `MIGRATED`

- `docs/src/pages/componentes/tabs.astro` criado, consumindo `ComponentPreview`,
  seções (Básico, Tamanhos, Vertical, Estados, Playground live, Props, Source
  via `?raw`, Acessibilidade) e os previews.
- `docs/src/previews/tabs.tsx` (rows nomeados) + `docs/src/previews/tabs-live.tsx`
  (`LiveTabsSnippet` via react-live).
- `"Tabs"` adicionado ao Set `MIGRATED` em `docs/src/pages/index.astro` (PascalCase;
  o slug renderizado vira `tabs`).

**Verificação:**
- `npm run docs:build` verde.
- `grep -n '"Tabs"' docs/src/pages/index.astro` retorna match dentro do Set.

### AC-6 — Brand contra Notion (fonte da verdade) via MCP

Verificar via Notion MCP (`mcp__claude_ai_Notion__notion-fetch`) que cores e
tipografia do `Tabs` renderizado estão alinhadas com:

- [Branding (raiz)](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6)
- [Cores](https://www.notion.so/34536f91ebd28142a3f1e0e58fd62c4b)
- [Tipografia](https://www.notion.so/34536f91ebd281b9b76ccc6159bfae69)

**Conhecido (não regressão):** o conflito `--primary`/`--action` laranja vs Notion
violeta CTA já está roteado para o **Plan #208**. `Tabs` usa o padrão pílula
neutro (`bg-background`/`text-foreground`) na aba ativa e `ring-ring` no focus —
não toca esse mapeamento. Qualquer divergência nova é surfaceada e roteada para
issue separada (`lex-no-silent-tech-debt`), nunca silenciada.

**Verificação:** seção `## Brand check` no `06-quality-report.md` listando
(a) tokens consumidos, (b) mapeamento contra Notion (cores + typeface),
(c) divergências novas (esperado: 0).

### AC-7 — Pipeline CI verde

Os 5 comandos canônicos rodam sem erro:

```
npm run typecheck
npm run lint
npm run test
npm run build
npm run docs:build
```

`lex-frontend-typing` exige `tsc --noEmit` zero erros; `lex-frontend-testing`
exige tests verdes; lint exige zero `console.log` e zero hex hardcoded (Radix é
permitido — este repo é a fonte do design-system).

**Verificação:** stdout dos 5 comandos anexado ao `06-quality-report.md` com
exit code 0; CI green no GitHub Checks após push.

### AC-8 — Playground "está bom" Fernando + PR `Closes #87`

Commit atômico único `feat(tabs): migrate to v0.1.0 DoD — ...` (`lex-small-commits`).
PR aberto em `head=feat/86-tabs`, `base=main`, body com `Closes #87`, mirror de
labels (`evolvability ♻️`), seção `## Playground` com link para
`docs/componentes/tabs` e registro da aprovação textual do Fernando.

**Verificação:** URL do PR retornada; `gh pr view --json reviewDecision`.

## Definition of Done (consolidada)

- [ ] AC-1 — CVA `size` + `orientation` sobre tokens semânticos, zero hex.
- [ ] AC-2 — Stories `Default` + variantes + `DarkTheme`, build verde.
- [ ] AC-3 — ≥ 20 testes comportamentais (ou ≥ 80% cobertura), queries acessíveis, zero mocks internos.
- [ ] AC-4 — ≥ 3 cenários `axeInThemes` (light + dark) passando.
- [ ] AC-5 — Página Astro + previews + entrada `MIGRATED`, docs:build verde.
- [ ] AC-6 — Brand check vs Notion via MCP, 0 divergência nova.
- [ ] AC-7 — typecheck + lint + test + build + docs:build verde.
- [ ] AC-8 — PR `Closes #87` + aprovação playground do Fernando.

## Out of scope (não tocar)

- Mapeamento dos tokens `--primary` / `--action` / `--ring` — sob Plan #208.
  Boxed ativa adota `bg-action`/`text-button-fg` deliberadamente (D4 do
  architecture) e ficará alinhada quando #208 for entregue.
- Orientação vertical — removida do escopo na revisão de Gate 1.
- Variante `size="lg"` — removida do escopo na revisão de Gate 1.
- Animação de "active indicator" deslizante (motion) — não pedido pelo DoD.
- Lazy-mount de painéis / integração com router — fora do v0.1.0 do Tabs.
