---
adr_id: "001"
title: Visual diff report — custom script vs OSS
status: accepted
date: 2026-05-23
deciders: fernandoseguim
context_issue: guardiatechnology/design-system#133
parent_issue: guardiatechnology/design-system#130
---

# ADR-001: Visual diff report — custom script vs OSS

## Context

A migração para `@storybook/test-runner` + `jest-image-snapshot` (Tech Task #126) deixou o gate visual rodando, mas falhas chegavam ao reviewer como um zip do GitHub Actions com PNGs soltas em `__diff_output__/`. Para PRs que mexem em design tokens ou componentes compartilhados, isso é ruim — 50+ PNGs para inspecionar manualmente, sem contexto de qual story falhou, sem comparação visual entre baseline e current.

Plan #133 (escopo B de #130) ataca essa ergonomia: gerar um relatório HTML navegável com `baseline | received | diff` lado a lado por story+tema, publicado como artifact do GH Actions.

## Decisão

Adotar um **script custom em ESM puro** (`scripts/generate-diff-report.mjs`, ~200 linhas, zero deps externas) que:

1. Caminha recursivamente em `__image_snapshots__/__diff_output__/` (estrutura hierárquica derivada de Plan #132)
2. Para cada `*-diff.png` encontrado, localiza o `*-received.png` correspondente (gerado via `storeReceivedOnFailure: true` no test-runner) e a baseline em `__image_snapshots__/{title}/{theme}/{variant}.png`
3. Gera `__image_snapshots__/__diff_output__/index.html` agrupando entries por componente, com cards `baseline | received | diff`
4. Inclui metadados de CI no header (branch, commit, link do workflow run) via env vars padrão do GH Actions

O HTML é publicado como parte do artifact `visual-diffs-${run_id}` (alongside dos PNGs originais). Reviewer baixa o zip, abre `index.html` no browser, vê todas as falhas em uma página.

## Alternativas avaliadas

### A. `reg-publish-github-action` + `reg-suit`

- **Pró:** action pronta, com GH integration nativa
- **Contra:** exige adotar `reg-suit` como comparador, duplicando a lógica de `jest-image-snapshot` que já usamos (e que já está integrada com o `@storybook/test-runner`). Adiciona uma segunda toolchain para o mesmo problema
- **Veredito:** rejeitada — coupling com toolchain externa para resolver problema de apresentação

### B. `lost-pixel` em report mode

- **Pró:** ferramenta consolidada, gera report HTML pronto
- **Contra:** puxa Playwright próprio (~150 MB em `node_modules`), conflita com o Playwright já configurado pelo test-runner. Over-engineering para o tamanho do catálogo atual (53 stories × 2 temas = 106 snapshots)
- **Veredito:** rejeitada — bundle size desproporcional ao escopo

### C. Script custom (escolhido)

- **Pró:** zero deps novas, lê output existente do `jest-image-snapshot`, ~200 linhas mantíveis, integra com a hierarquia de baselines do Plan #132
- **Contra:** uma codebase a mais para manter
- **Mitigação do contra:** script é simples (apenas filesystem walk + template HTML), sem lógica de comparação pixel-a-pixel (essa já é do test-runner). Manutenção esperada: muito baixa
- **Veredito:** aceita

## Consequências

- **+** Sem novas dependências em `package.json`
- **+** Mantém Git como source of truth (consistente com #127, #128, #132)
- **+** Sem coupling com SaaS externo
- **+** Script reutiliza a estrutura hierárquica de `__diff_output__/` já derivada do `snapshotDirForStory` compartilhado entre test-runner e migration script
- **−** Manutenção do script é nossa (não terceirizada). Mitigada pela simplicidade do scope (~200 linhas, sem lógica complexa)
- **−** Report é estático (sem filtros interativos por componente/tema além do agrupamento já feito). Aceitável pro tamanho atual; expansão é trivial se necessário

## Implementação

- `scripts/generate-diff-report.mjs` — gerador zero-deps
- `.storybook/test-runner.ts` — adiciona `storeReceivedOnFailure: true` + `customReceivedDir` (hierárquico, espelho do `customDiffDir`)
- `.github/workflows/pull-request.yml` — chama o gerador após `test-storybook:ci` falhar, sobe `index.html` junto com os PNGs no artifact

## Revisita

Reavaliar esta decisão se:

- Catálogo passar de ~500 stories e o report HTML estático ficar pesado de scrollar
- Surgir demanda recorrente por features que o report custom não cobre (diff overlay, filtros, comentários inline)
- Equipe assumir budget para adotar Chromatic ou Argos (decisão registrada em #126 — fora de escopo agora)
