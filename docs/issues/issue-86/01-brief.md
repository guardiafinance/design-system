# Brief — Issue #86 (Plan #87)

- **Issue pai:** [#86 — feat(tabs): migrate Tabs to v0.1.0 DoD](https://github.com/guardiatechnology/design-system/issues/86)
- **Plan sub-issue:** [#87 — Plan: migrate Tabs to v0.1.0 DoD](https://github.com/guardiatechnology/design-system/issues/87)
- **Epic:** #13 (v0.1.0)
- **Categoria:** Navigation
- **Assignee:** @fernandoseguim
- **Status (Plan):** `status: development` (transição de `status: todo` no início do fluxo)

## Contexto

`Tabs` consta no catálogo canônico de 52 componentes do `@guardia/design-system` v0.1.0, mas está **abaixo do DoD**: existe apenas um baseline minimalista herdado do shadcn, sem testes, sem cobertura dark, sem página Astro e fora do Set `MIGRATED`. Sem esta migração, a categoria **Navigation** fica incompleta no v0.1.0.

A infraestrutura transversal já está em `main` e **não precisa ser refeita**:

| Infra | Origem | Status |
|---|---|---|
| Storybook toolbar light/dark + `applyThemeSync` | PR #119 | merged |
| Astro playground cross-iframe theme toggle | PR #119 | merged |
| `ui_kit/test-utils/a11y.ts::axeInThemes` helper | Tech Task #125 | merged |
| Notion MCP habilitado | PR #216 | merged |
| Labels canônicas `status:*` | PR #215 | merged |

## Estado atual do componente

- **Source:** `ui_kit/components/tabs/index.tsx` — 55 linhas. Base: Radix Tabs (`@radix-ui/react-tabs`), wrapper shadcn cru, sem CVA. Exporta `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` (componente composto).
- **Tokens consumidos hoje:** `bg-muted`, `text-muted-foreground`, `bg-background`, `text-foreground`, `ring-ring`, `ring-offset-background`. Todos são tokens válidos do design-system (camada shadcn-compat mapeada em `ui_kit/styles/index.css`) — **zero hex hardcoded**. A lacuna Brand é, portanto, pequena no nível de token.
- **Variantes:** nenhuma. Sem `size`, sem `orientation`. O DoD do parent #86 pede explicitamente **"Radix Tabs + sizes + orientation"**.
- **Stories:** `Tabs.stories.tsx` — apenas `Default` (1 story), sem cobertura dark e sem variantes.
- **Tests:** inexistentes. Não há `tabs.test.tsx`.
- **Docs Astro:** inexistente. Não há `docs/src/pages/componentes/tabs.astro` nem previews.
- **Barrel:** `export * from "./tabs"` já presente em `ui_kit/components/index.ts:44` — sem mudança necessária.
- **MIGRATED:** `"Tabs"` **ausente** do Set em `docs/src/pages/index.astro` (linha ~678).

## Diferença para os Plans #37 / #39 (checkbox / combobox)

Aqueles eram **reviews** de componentes já migrados (delta mínimo: 1 story dark). Tabs é uma **construção quase do zero**: o baseline existe mas precisa ganhar CVA (sizes + orientation), suíte de testes comportamentais completa, stories com matriz dark, página Astro com previews e entrada no `MIGRATED`. O esforço de implementação é materialmente maior.

## Conhecidos transversais (fora do escopo deste Plan)

- **`--action` violeta (light) / laranja (dark) vs Notion CTA** → rastreado pelo **Plan #208** (Brand inversion). O indicador de aba ativa do `Tabs` usa o padrão "pílula elevada" (`bg-background` + `text-foreground` + sombra), que é neutro de marca e **não toca** esse mapeamento. O focus ring usa `ring-ring` (laranja, canônico). Nenhuma divergência nova esperada.

## Unknowns

- Confirmar via Notion MCP que cores e tipografia do `Tabs` renderizado (track, aba ativa/inativa, focus ring) não divergem do espelho local (`lex-brand-colors`, `lex-brand-typography`).
- Confirmar a escala exata de `size` (sm/md/lg) contra os tokens de altura/espaçamento já usados por componentes irmãos (Button, Combobox) para manter paridade visual.

## Goal

Elevar `Tabs` ao DoD completo do v0.1.0: CVA com `size` (sm/md/lg) + `orientation` (horizontal/vertical) sobre tokens semânticos, suíte `tabs.test.tsx` (≥ 20 testes comportamentais + `axeInThemes` light/dark), stories com `DarkTheme`, página Astro + previews + live, entrada no `MIGRATED`. PR atômico único `Closes #87`.
