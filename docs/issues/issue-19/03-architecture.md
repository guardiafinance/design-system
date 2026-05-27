# Architecture — Issue #19

## Componentes afetados (escopo)

| Arquivo | Mudança esperada |
|---|---|
| `ui_kit/components/badge/badge.test.tsx` | Adicionar blocos a11y para Default, Badge-em-`<button>` (interativo) e Badge-em-`<button disabled>`; adicionar a11y para variantes dot + icons; adicionar testes comportamentais com `getByRole` para o caso composto. |
| `ui_kit/components/badge/Badge.stories.tsx` | Sem alterações necessárias — Soft/Solid/Outline/WithDot/WithIcons/Square/Counts já cobrem o eixo de variantes e o toolbar `light/dark` cuida do tema. |
| `ui_kit/components/badge/index.tsx` | Sem alterações — Badge é estável; v0.1.0 valida o componente como-está. |
| `docs/issues/issue-19/01-brief.md` | Criado em Phase 1. |
| `docs/issues/issue-19/02-requirements.md` | Criado em Phase 2. |
| `docs/issues/issue-19/03-architecture.md` | Este arquivo. |
| `docs/issues/issue-19/05-security-review.md` | Criado em Phase 5. |
| `docs/issues/issue-19/06-quality-report.md` | Criado em Phase 6. |

## Guardrails de escopo

Apenas dois subdiretórios são tocados nesta revisão:

1. `ui_kit/components/badge/` — somente o arquivo de teste recebe
   extensões; `index.tsx` e `Badge.stories.tsx` ficam intocados.
2. `docs/issues/issue-19/` — artefatos do fluxo.

Qualquer mudança fora desses dois diretórios dispara
`lex-no-silent-tech-debt` (Tangential Finding Protocol) — registrada
como comentário em #19 ou nova sub-issue, nunca incluída neste PR.

## Decisões de design

### D-1 — "Estado interativo principal" e "disabled" em primitivo passivo

Badge não tem semântica interativa nativa (sem `role`/`tabIndex`/
`onClick` próprio). A leitura literal de AC-3/AC-4 ("interações,
navegação por teclado, estados como hover/checked/open/expanded,
disabled") aplicada a um `<span>` passivo seria vacuosamente
satisfeita. Decisão: cobrir o **caso composto** real — Badge dentro
de `<button>` (que carrega `role`/`tabIndex`/`disabled`) — porque é
exatamente assim que aparece nas surfaces (counters em buttons,
indicators em tabs, status em items de menu).

**Consequência:** as queries `getByRole('button', { name: ... })`
demonstram que Badge não polui a árvore acessível do container nem
interfere na operabilidade por teclado/disabled. Mantém a Lei
`lex-frontend-testing` ("acessível antes de testId") e cobre a
intenção de AC-4.

### D-2 — Não alterar `index.tsx`

Badge tem 173 linhas, 3 eixos × 7 variantes × 3 aparências × 2 shapes
amparados por 18 testes de unidade que já travam regressões WCAG
(documentadas em ADR-003 / Issue #173 / PR #175 / Issue #180). O
escopo de #19 é **revisão**, não evolução. Tocar `index.tsx` viola
`lex-small-commits` e abre risco de quebrar a baseline visual
(snapshots Ubuntu/CI), que está fora do escopo por construção (NEVER
regenerar de macOS).

### D-3 — Storybook sem novas stories

A matriz Default + Soft + Solid + Outline + WithDot + WithIcons +
Square + Counts já cobre Default + variantes principais nos dois
temas (toolbar global). Adicionar stories duplicaria cobertura e
violaria `lex-small-commits`. AC-1 é verificada pelo
`build-storybook` verde sem alteração.

### D-4 — Brand × Notion manual

`notion` MCP server está comentado em `.ahrena/.directives`. Não
ativo por iniciativa do agente (`lex-mcp` rule 3). O PR sinaliza a
verificação manual pendente em seção dedicada. Localmente, a Badge
já consome apenas tokens (zero hex hardcoded), e WCAG está provado
nos comentários inline do `index.tsx` — qualquer divergência detectada
manualmente vira nova sub-issue.

## Riscos

| Risco | Mitigação |
|---|---|
| Snapshot visual quebra no CI Ubuntu após mudanças no teste | Testes adicionados são puramente comportamentais (DOM + axe), não tocam `__image_snapshots__/`. Risco baixo. |
| `axeInThemes` num container `<button disabled>` reportar violação inesperada | O caso é canônico (botão semântico nativo com label); espera-se 0 violações. Se aparecer, é regressão real e bloqueia o PR. |
| Brand × Notion divergir | Registrado como pendência manual no corpo do PR. Não bloqueia a revisão técnica, só a aprovação final do Fernando. |
| Cobertura < 80% mesmo com testes novos | Coverage atual já é alto (Badge é simples; `it.each` expande para 17+ casos). A adição de blocos a11y compostos eleva a contagem `it` para ≥ 20 sem risco. |
