# Contribuindo com o Guardia Design System

## Pré-requisitos

- Node.js 22 (alinhado com o CI)
- npm 10+

```bash
npm install
npm run init:env    # configura git hooks locais
```

## Fluxo de PR

1. Crie a issue (templates em `.github/ISSUE_TEMPLATE/`).
2. Branch `{type}/{N}-{slug}` a partir de `main`.
3. Implemente, mantendo commits atômicos com Conventional Commits.
4. Antes do push: `npm run lint && npm run test && npm run typecheck && npm run build`.
5. Abra o PR referenciando a issue via `Closes #N` ou `Refs #N`.

## Visual regression + a11y (test-storybook)

A migração do Chromatic deixou o gate visual + a11y na stack `@storybook/test-runner` (Playwright) + `jest-image-snapshot` + axe-core. Baselines em `__image_snapshots__/` são commitadas no repo (Git como source of truth).

### Layout de baselines

Subdividido por title + tema, com o variant como leaf:

```
__image_snapshots__/
├── components/
│   ├── multi-select/
│   │   ├── dark/
│   │   │   ├── default.png
│   │   │   └── with-default-value.png
│   │   └── light/
│   │       ├── default.png
│   │       └── with-default-value.png
│   └── button/
│       ├── dark/...
│       └── light/...
└── theme/
    └── theme/
        ├── dark/...
        └── light/...
```

A estrutura vem de `context.title` (split por `/`, cada segmento kebab-case) + tema + `context.name` (kebab-case). Em PR que mexe num único componente, o reviewer scrolla um diretório com 4–10 PNGs em vez de 426+ arquivos em pasta flat.

### Setup local

Playwright Chromium é instalado uma vez por máquina:

```bash
npx playwright install chromium
```

### Rodar localmente contra Storybook em dev

Em um terminal, suba o Storybook:

```bash
npm run storybook        # → http://localhost:6006
```

Em outro:

```bash
npm run test-storybook         # roda visual + a11y; falha em diff visual
npm run test-storybook:update  # atualiza baselines (-u)
```

### Rodar contra Storybook static (mesmo modo do CI)

```bash
npm run test-storybook:ci      # build static + serve + run; falha em baseline ausente
```

### Diff report HTML local

Quando o gate visual falha (local ou CI), você pode gerar um `index.html` navegável que mostra `baseline | received | diff` lado a lado por story+tema:

```bash
node scripts/generate-diff-report.mjs
# → __image_snapshots__/__diff_output__/index.html
open __image_snapshots__/__diff_output__/index.html  # macOS
```

No CI o report é gerado automaticamente quando há falha e fica dentro do artifact `visual-diffs-${run_id}`. A decisão de tooling (script custom vs OSS) está registrada em [docs/adr/ADR-001-visual-diff-report-tooling.md](docs/adr/ADR-001-visual-diff-report-tooling.md).

### Atualizar baselines (após mudança intencional)

**Cross-platform drift**: font rendering e antialiasing diferem entre macOS e Ubuntu. Baselines geradas em dev local (macOS) **não passam** no CI (Ubuntu). O CI é a source of truth para os PNGs em `__image_snapshots__/`.

Fluxo recomendado:

1. Faça a mudança visual no componente (sem rodar `test-storybook:update` local).
2. Push do PR. CI vai falhar no job `Visual regression + a11y` — esperado.
3. Abra o run falhado, baixe o artifact `visual-diffs-*` e abra `__diff_output__/index.html` no browser — relatório navegável com `baseline | received | diff` lado a lado por story+tema. Confira se o diff é intencional. (Os PNGs soltos seguem no zip caso queira inspecionar individualmente; o HTML é só conveniência.)
4. Se intencional: aplique a label **`regenerate-baselines`** no PR (`gh pr edit <N> --add-label regenerate-baselines` ou via UI).
5. O CI re-triggea (evento `labeled`), o job visual roda em modo regeneração (gera baselines no Ubuntu, pusha como commit assinado pelo GitHub via Git Database API).
6. Remova a label (`gh pr edit <N> --remove-label regenerate-baselines`).
7. Abra o run de CI anterior e clique **Re-run failed jobs**. Validação roda contra as novas baselines.

Por que re-run manual? GitHub Actions não re-triggea automaticamente CI quando o push vem do próprio workflow com GITHUB_TOKEN (loop prevention). O re-run manual é a saída.

**Restrição**: regeneração via label **só funciona em PRs do mesmo repositório**. Forks rodam o workflow com permissões reduzidas — o push de commit assinado falha por design. Contribuidores externos pedem pra um maintainer aplicar a label e gerar as baselines.

Fluxo local (só pra desenvolvimento iterativo, **não pra commit**):

```bash
npm run storybook                  # → http://localhost:6006
npm run test-storybook:update      # gera baselines locais (macOS)
```

Use isso pra ver o que mudou rapidamente. Não commite essas baselines — a regeneração via label vai sobrescrever no Ubuntu.

### Como funciona

Cada story é capturada em dois temas (light + dark) via `data-theme` alternado no `<html>` antes de cada screenshot. O axe-core executa WCAG 2.1 A + AA contra `#storybook-root` em ambos os temas.

Animações CSS são congeladas durante a captura (`animation-play-state: paused`) para garantir determinismo entre runs.

### Warn-not-fail para stories novas (Tech Task #238)

Stories sem baseline canônica em `__image_snapshots__/{title}/{theme}/{variant}.png` **não derrubam mais o CI** quando o PR roda em modo validate (default). O runner captura o PNG candidato em `__image_snapshots__/__pending__/{title}/{theme}/{variant}.png` (diretório gitignored) e registra um entry em `__pending__/manifest.json`. O workflow:

- Publica `__pending__/` como artifact `visual-regression-pending-{run_id}` (retenção 7 dias).
- Posta (ou edita, via marker estável) um único comentário na PR listando as stories pendentes.

Para promover candidatos a baselines canônicas:

1. Aplique a label `regenerate-baselines` na PR.
2. O fluxo de regen reroda todas as stories, escreve `__image_snapshots__/{title}/{theme}/{variant}.png` definitivas e assina commit de volta no branch.
3. Remova a label e use "Re-run failed jobs" para validar contra as novas baselines.

**Não commite nada em `__image_snapshots__/__pending__/`.** O diretório é gitignored e existe apenas para pré-visualização. A promoção só acontece via label.

Diffs em baselines existentes **continuam falhando strict** — o warn-not-fail só cobre o caso "primeira execução de uma story nova". Regressão real não é mascarada.

### A11y em hard mode

O axe roda em hard mode: violações WCAG 2.1 A + AA bloqueiam o build como qualquer diff visual. Stories que precisam derrogar uma regra específica (por exemplo, showcases de tokens de marca que caem no range 3:1–4.5:1 do `lex-brand-colors` e só são aplicáveis a títulos/buttons/badges em superfícies de produto) declaram override por story:

```ts
export const MyShowcase: Story = {
  parameters: {
    a11y: {
      // WHY: explicação direta da razão + referência ao lex que governa o uso
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
  },
};
```

Stories que não devem ser auditadas no axe (raríssimo — só componentes intrinsecamente sem semântica avaliável) declaram `parameters.a11y.disable: true` com comentário WHY adjacente.

### Stories que não devem ser snapshotadas

Stories puramente decorativas ou com não-determinismo intrínseco podem desabilitar o snapshot via parameter:

```ts
export const MyStory: Story = {
  parameters: { test: { disableSnapshot: true } },
  render: () => <Spinner />,
};
```

Use com critério — toda exceção precisa de justificativa explícita no PR ou em comentário `// WHY: ...` adjacente.

## Adicionar um componente

1. `ui_kit/components/<nome>/index.tsx` + `<Nome>.stories.tsx`.
2. Teste em `<nome>.test.tsx` (Vitest + Testing Library).
3. Export em `ui_kit/components/index.ts`.
4. Entrada em `docs/src/data/components.ts` (gera página `/componentes/<slug>`).
5. Rodar `npm run test-storybook:update` para gerar baselines iniciais do componente.
6. Commit das baselines no mesmo PR.

## Padrões

- TypeScript strict obrigatório (`npm run typecheck`).
- Lint zero (`npm run lint`).
- Vitest threshold mínimo 70% (`npm run test:coverage`).
- Conventional Commits no subject.
- Branch follow `{type}/{N}-{slug}`.

## Licença

Propriedade da Guardia Finance. Uso interno apenas.
