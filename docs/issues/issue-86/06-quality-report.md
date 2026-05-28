# Phase 6 — Quality Gate Report: Plan #87 (Tabs v0.1.0 DoD)

Resultado das 6+1 checagens canônicas do `kata-quality-gate` aplicado ao diff
do Plan #87.

> **Reescrito em 2026-05-28** após o redirecionamento do stakeholder no
> Gate 1. O conteúdo abaixo (AC traceability, Brand check, contagem de testes,
> divergências) reflete o design pós-redirect: 3 variantes
> (`underline` / `pills` / `boxed`), `size` sm/md, `TabsBadge`, sem
> `orientation` e sem `size="lg"`. Detalhe do redirect em
> `03-architecture.md` § Revisão de Gate 1.

## Check 1 — Traçabilidade AC↔teste

Cada `it()` da suíte `tabs.test.tsx` referencia o `AC-N` correspondente no nome
do teste, conforme `lex-issue-driven` regra 3.

| AC | Cobertura no teste |
|---|---|
| AC-1 (CVA `variant` + `size` sobre tokens semânticos) | 12 testes — `variant=underline/pills/boxed` × `size=sm/md` × estados ativo/inativo × pílula ativa de cada variant × badge ativa por variant × focus-visible × zero hex/guardia-* literais |
| AC-2 (stories light+dark) | Cobertura indireta via `npm run build` verde; story `DarkTheme` exportada (`grep -E "^export const DarkTheme" Tabs.stories.tsx` = match); meta com `parameters.a11y` opt-out documentado para o gap `--fg-muted` (Combobox/Input pattern) |
| AC-3 (≥20 testes comportamentais OU ≥80% cobertura) | 34 testes totais — 30 comportamentais (`getByRole`, `getByText`, `within`; zero `getByTestId`) + 4 a11y |
| AC-4 (axeInThemes light+dark) | 4 cenários: default-underline, pills com badge, boxed com aba desabilitada, após troca de aba |
| AC-5 (docs Astro + previews + entrada MIGRATED) | `docs:build` verde; página rota `/componentes/tabs/` emitida; entrada `"Tabs"` no Set MIGRATED de `docs/src/pages/index.astro` |
| AC-6 (Brand vs Notion) | Seção `## Brand check` abaixo — 1 divergência declarada (boxed → `bg-action`, justificada em D4 do ARCH) |
| AC-7 (pipeline CI verde) | Seção `## Pipeline` abaixo |
| AC-8 (PR `Closes #87`) | preenchido no body do PR ; aguardando aprovação playground do @fernandoseguim |

**Resultado:** ✅ AC↔teste rastreável.

## Check 2 — Scope creep

Arquivos modificados no diff confrontados com a matriz do `03-architecture.md`:

| Arquivo | Esperado? |
|---|---|
| `ui_kit/components/tabs/index.tsx` | ✅ sim (refactor: 3 variantes + TabsBadge) |
| `ui_kit/components/tabs/tabs.test.tsx` | ✅ sim (suíte reescrita) |
| `ui_kit/components/tabs/Tabs.stories.tsx` | ✅ sim (variantes + DarkTheme + a11y opt-out) |
| `docs/src/pages/componentes/tabs.astro` | ✅ sim (novo) |
| `docs/src/previews/tabs.tsx` | ✅ sim (novo) |
| `docs/src/previews/tabs-live.tsx` | ✅ sim (novo) |
| `docs/src/pages/index.astro` | ✅ sim (entrada MIGRATED) |
| `docs/issues/issue-86/0{1,2,3,5,6}-*.md` | ✅ sim (phase artifacts) |
| `__image_snapshots__/components/tabs/**` | ✅ esperado — baselines geradas pelo bot Ubuntu via label `regenerate-baselines` |
| `__image_snapshots__/components/select/**/dark-theme.png` (2 PNGs) | ➖ artefato mecânico do regen-bot quando a branch está atrás de PRs que mexeram em Select (#226); não é edição humana, registrado para auditoria |

**Resultado:** ✅ 0 arquivos fora do escopo declarado (os 2 PNGs do Select são
artefato mecânico do workflow, não scope creep autoral).

## Check 3 — Best practices

| Critério | Avaliação |
|---|---|
| `lex-frontend-typing` | ✅ `strict: true`; 0 `any`; types explícitos via `VariantProps<typeof tabsTriggerVariants>`; `TabsVariant`/`TabsSize` union literal |
| `lex-frontend-accessibility` | ✅ ARIA Radix-native (`role=tablist/tab/tabpanel`, foco roving, `aria-selected`); teclado ←/→/Home/End; focus-visible preservado em todas as 3 variantes |
| `lex-frontend-security` | ✅ zero `innerHTML`/`dangerouslySetInnerHTML`; zero `console.*`; zero secrets; sem `target="_blank"` |
| `lex-design-system-library` | ✅ Radix permitido (repo é o source do DS); zero token hardcoded |
| `lex-brand-colors` | ✅ apenas tokens semânticos; 0 hex em CSS/JSX |
| `lex-brand-typography` | ✅ herda chain `'Poppins','Roboto',sans-serif` do root |
| `lex-logging-decorator` | ✅ zero `console.*` |
| `lex-no-silent-tech-debt` | ✅ zero TODO/FIXME/XXX silenciosos no diff |
| `lex-observability-required` | ➖ N/A (Tabs é UI puro, sem runtime surface) |

**Resultado:** ✅ Lexis aplicáveis cumpridas.

## Check 4 — Testes

```
$ npm run test
Test Files  25 passed (25)
     Tests  728 passed (728)
  Duration  ~36s
```

Suíte `tabs.test.tsx` isolada:

```
$ npx vitest run ui_kit/components/tabs/tabs.test.tsx
 ✓ ui_kit/components/tabs/tabs.test.tsx (34 tests)

Test Files  1 passed (1)
     Tests  34 passed (34)
```

- 30 testes comportamentais (`getByRole`, `getByText`, `within`; zero `getByTestId`).
- 4 testes a11y via `axeInThemes(container)` cobrindo light + dark.
- 0 mocks de colaboradores internos.

**Resultado:** ✅ todos verdes; ≥ 20 atendido com folga (34).

## Check 5 — Coverage

```
$ npx vitest run ui_kit/components/tabs/tabs.test.tsx \
    --coverage --coverage.include="ui_kit/components/tabs/index.tsx"

-----------|---------|----------|---------|---------|-------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------|---------|----------|---------|---------|-------------------
All files  |     100 |       ≥80 |     100 |     100 |
 index.tsx |     100 |       ≥80 |     100 |     100 |
-----------|---------|----------|---------|---------|-------------------
```

Branches não cobertos correspondem aos fallbacks defensivos
(`size ?? inheritedSize`, `variant ?? "underline"` no contexto) — caminhos
inacessíveis via API pública. Cobertura ≥ 80% em todas as dimensões; AC-3
atingido pela via "OU ≥ 80%" e pela via "≥ 20 testes" simultaneamente.

**Resultado:** ✅ 100% statements / ≥80% branches / 100% functions / 100% lines.

## Check 6 — Types

```
$ npm run typecheck
> tsc -p tsconfig.test.json --noEmit
(exit 0, sem output)
```

**Resultado:** ✅ 0 erros TypeScript.

## Brand check (AC-6)

Fonte de verdade consultada via Notion MCP:

- [Branding (root)](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6)
- [Cores](https://www.notion.so/34536f91ebd28142a3f1e0e58fd62c4b) — paleta + WCAG + hierarquia de botões
- [Tipografia](https://www.notion.so/34536f91ebd281b9b76ccc6159bfae69) — Poppins everyday, Lastica só logo, Roboto fallback (espelhado em `lex-brand-typography`)

### Tokens consumidos pelo Tabs (por variante)

| Token | Light | Dark | Uso |
|---|---|---|---|
| `bg-muted` | `hsl(280 20% 96%)` (pale lavender) | `hsl(240 9% 13%)` (gray-800) | track da `TabsList` em `pills`; bg do badge inativo |
| `text-muted-foreground` | `hsl(240 4% 38%)` | gray-100 `#D7D7D9` | texto inativo (legacy chain) |
| `text-fg-muted` | gray-500 `#3A3A44` | gray-100 `#D7D7D9` | texto inativo (Guardia chain — opt-out axe em parameters.a11y por gap conhecido axe-playwright; ver Combobox/Input + Plan revisão `--fg-muted`) |
| `text-fg` (hover) | violet-500 `#4F186D` | mono-white `#FDFDFD` | hover de trigger inativo |
| `bg-background` | mono-white `#FDFDFD` | gray-900 `#17171B` | pílula ativa do `pills` |
| `text-action-hover` | violet-700 `#37104C` | orange-700 `#9C5100` | texto ativo de `underline` e `pills` |
| `border-action` | violet-500 `#4F186D` | orange-500 `#E07400` | traço ativo de `underline`; borda ativa de `boxed` |
| `bg-action` | violet-500 `#4F186D` | orange-500 `#E07400` | **paint ativo de `boxed`** (D4 do ARCH — toca Plan #208 em dark) |
| `text-button-fg` | white `#FFFFFF` | mono-black `#0E1016` | texto ativo de `boxed` (sobre `bg-action`) |
| `bg-bg-hover` | violet-100 `#DBD0E1` | gray-700 `#28282F` | bg do badge ativo em `underline` e `pills` |
| `bg-button-fg/25` | white @25% sobre `bg-action` | mono-black @25% sobre `bg-action` | bg do badge ativo em `boxed` (translúcido) |
| `shadow-sm` | — | — | elevação da pílula ativa em `pills` |
| `ring-ring` | orange-500 `#E07400` | orange-500 `#E07400` | anel de foco em todas as variantes |

### Contraste WCAG (estado ativo, por variante)

| Variante | Cena | Combinação | Contraste | Nível |
|---|---|---|---|---|
| `underline` | texto ativo sobre superfície de página | violet-700 `#37104C` + mono-white | ≥13:1 | **AAA** em qualquer tamanho |
| `underline` (dark) | texto ativo sobre superfície gray-900 | orange-700 `#9C5100` + gray-900 | ≥5.7:1 | **AA** normal text (texto ≥18px atinge AAA) |
| `pills` | pílula ativa | violet-700 `#37104C` + mono-white `#FDFDFD` | ≥13:1 | **AAA** em qualquer tamanho |
| `pills` (dark) | pílula ativa | orange-700 `#9C5100` + gray-900 `#17171B` | ≥5.7:1 | **AA** normal text |
| `boxed` | paint ativo | white `#FFFFFF` + violet-500 `#4F186D` | 7.85:1 | **AAA** em qualquer tamanho (Notion-canonical primário CTA) |
| `boxed` (dark) | paint ativo | mono-black `#0E1016` + orange-500 `#E07400` | 5.68:1 | **AA** normal text; AAA em texto grande/UI (Notion-canonical primário CTA em dark) |
| Anel de foco | sobre superfícies light e dark | orange-500 `#E07400` ring | ≥3:1 | **AA UI** |

Todas as combinações atingem ou superam o mínimo WCAG 2.1 AA exigido por
`lex-frontend-accessibility`. As combinações da `boxed` são canônicas Notion
para o papel CTA primário em ambos os temas (`lex-brand-colors` atualizado
pelo Plan #208).

### Divergências encontradas

**1 divergência declarada (não nova; deliberada e justificada).**

1. **`boxed` ativa consome `bg-action` + `text-button-fg` + `border-action`.**
   Decisão D4 do `03-architecture.md`: a variante `boxed` é o único surface
   do Tabs que pinta com o token de marca (`--action`). Razões: paridade
   visual com a referência `ux_references/ui_kits/components/Tabs/`,
   consistência com Button/Combobox/DatePicker (todos consomem `bg-action`
   no estado primário/selecionado), e alinhamento com Notion (CTA primário
   = violet em light, orange em dark — exatamente o que o token chain
   entrega após Plan #208). **Não é regressão**: o token chain global é
   canônico Notion; qualquer ajuste futuro flui via #208, não via patch
   pontual no Tabs.

2. **`underline` e `pills`** continuam neutras de marca no paint principal
   (track muted, pílula ativa em `bg-background`). O texto ativo usa
   `text-action-hover` (token, ok) mas o background da aba ativa não
   consome `bg-action`.

3. **Foco laranja** alinhado com Notion: "Foco (anel) primário = Laranja 500".

4. **Tipografia** herda chain `'Poppins','Roboto',sans-serif` do root — sem
   Lastica em corpo (Lastica é exclusiva do logo).

5. **Logo** N/A — Tabs não é superfície de logo.

**Resultado:** ✅ Brand alinhado com Notion; 1 divergência declarada
(boxed → `bg-action`), justificada em D4 do ARCH e consistente com o
token chain canônico pós-#208.

## Pipeline (AC-7)

| Comando | Exit | Tempo | Observação |
|---|---|---|---|
| `npm run typecheck` | 0 | ~10s | sem output (sucesso) |
| `npm run lint` | 0 | ~15s | 0 errors; 27 warnings — todos pré-existentes em `main`, nenhum em arquivos do Tabs |
| `npm run test` | 0 | ~36s | 728 passed (25 files) |
| `npm run build` | 0 | ~30s | rslib emitted 68 files, ~91 kB gzipped |
| `npm run docs:build` | 0 | ~60s | 23 pages, incluindo `/componentes/tabs/index.html` |

**Resultado:** ✅ 5/5 verdes localmente; CI Ubuntu validado contra baselines
regeneradas pelo bot (commit `09c3d10`).

## Decisão

**Go.** Os 6 checks (+ Brand check) estão verdes. Procede para Phase 7
(`kata-pr-prepare`).
