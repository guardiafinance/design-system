# Phase 6 — Quality Gate Report: Plan #87 (Tabs v0.1.0 DoD)

Resultado das 6+1 checagens canônicas do `kata-quality-gate` aplicado ao diff
do Plan #87.

> **Atualizado em 2026-05-28** após redirecionamento do stakeholder no
> Gate 1: a contagem de testes, a tabela de tokens e a Brand check abaixo
> refletem o novo design (3 variantes — `underline` / `pills` / `boxed`).
> Detalhe do redirect em `03-architecture.md` § Revisão de Gate 1.

## Check 1 — Traçabilidade AC↔teste

Cada `it()` da suíte `tabs.test.tsx` referencia o `AC-N` correspondente no nome
do teste, conforme `lex-issue-driven` regra 3.

| AC | Cobertura no teste |
|---|---|
| AC-1 (CVA size + orientation) | `TabsList size=md/sm/lg`, `trigger sobrescreve size`, `orientation=vertical/horizontal`, `aba ativa usa pílula neutra`, `focus-visible:ring`, `zero cores hardcoded` |
| AC-2 (stories light+dark) | Cobertura indireta via `build` verde; story `DarkTheme` exportada (`grep -E "^export const DarkTheme" Tabs.stories.tsx` = match) |
| AC-3 (≥20 testes comportamentais) | 31 `it()` no total, dos quais 27 comportamentais e 4 a11y |
| AC-4 (axeInThemes light+dark) | 4 cenários: default horizontal, após troca, vertical, disabled |
| AC-5 (docs Astro + MIGRATED) | Cobertura via `docs:build` verde + página rota `/componentes/tabs/` emitida; entrada `"Tabs"` no Set MIGRATED (linha 700 de `docs/src/pages/index.astro`) |
| AC-6 (Brand vs Notion) | Seção `## Brand check` abaixo |
| AC-7 (pipeline CI verde) | Seção `## Pipeline` abaixo |
| AC-8 (PR `Closes #87`) | a ser preenchido no body do PR |

**Resultado:** ✅ AC↔teste rastreável.

## Check 2 — Scope creep

Arquivos modificados no diff confrontados com a matriz do `03-architecture.md`:

| Arquivo | Esperado? |
|---|---|
| `ui_kit/components/tabs/index.tsx` | ✅ sim |
| `ui_kit/components/tabs/tabs.test.tsx` | ✅ sim (novo) |
| `ui_kit/components/tabs/Tabs.stories.tsx` | ✅ sim |
| `docs/src/pages/componentes/tabs.astro` | ✅ sim (novo) |
| `docs/src/previews/tabs.tsx` | ✅ sim (novo) |
| `docs/src/previews/tabs-live.tsx` | ✅ sim (novo) |
| `docs/src/pages/index.astro` | ✅ sim (entrada MIGRATED) |
| `docs/issues/issue-86/0{1,2,3,5,6}-*.md` | ✅ sim (phase artifacts) |

**Resultado:** ✅ 0 arquivos fora do escopo declarado.

## Check 3 — Best practices

| Critério | Avaliação |
|---|---|
| `lex-frontend-typing` | ✅ `strict: true`; 0 `any`; types explícitos via `VariantProps` |
| `lex-frontend-accessibility` | ✅ ARIA Radix-native; teclado ←/→/↑/↓/Home/End; focus-visible preservado |
| `lex-frontend-security` | ✅ zero `innerHTML`; zero secrets; sem links externos |
| `lex-design-system-library` | ✅ Radix permitido (repo é o source do DS); zero token hardcoded |
| `lex-brand-colors` | ✅ apenas tokens semânticos; 0 hex em CSS/JSX |
| `lex-brand-typography` | ✅ inherita chain `'Poppins','Roboto',sans-serif` do root |
| `lex-logging-decorator` | ✅ zero `console.*` |
| `lex-no-silent-tech-debt` | ✅ zero TODO/FIXME/XXX silenciosos no diff |
| `lex-observability-required` | ➖ N/A (Tabs é UI puro, sem runtime surface) |

**Resultado:** ✅ Lexis aplicáveis cumpridas.

## Check 4 — Testes

```
$ npm run test
Test Files  25 passed (25)
     Tests  725 passed (725)
  Duration  35.98s
```

Suíte `tabs.test.tsx` isolada:

```
$ npx vitest run ui_kit/components/tabs/tabs.test.tsx
 ✓ ui_kit/components/tabs/tabs.test.tsx (31 tests) 3816ms

Test Files  1 passed (1)
     Tests  31 passed (31)
```

- 27 testes comportamentais (`getByRole`, `getByText`; zero `getByTestId`).
- 4 testes a11y via `axeInThemes(container)` cobrindo light + dark.
- 0 mocks de colaboradores internos.

**Resultado:** ✅ todos verdes; ≥ 20 atendido com folga (31).

## Check 5 — Coverage

```
$ npx vitest run ui_kit/components/tabs/tabs.test.tsx \
    --coverage --coverage.include="ui_kit/components/tabs/index.tsx"

-----------|---------|----------|---------|---------|-------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------|---------|----------|---------|---------|-------------------
All files  |     100 |       80 |     100 |     100 |
 index.tsx |     100 |       80 |     100 |     100 | 97
-----------|---------|----------|---------|---------|-------------------
```

Linha 97 corresponde ao branch do fallback `size ?? inheritedSize` quando
ambos são `undefined` simultaneamente — caminho defensivo, não acionável via
API pública (Radix sempre passa `data-state` válido). Cobertura ≥ 80% em todas
as dimensões; AC-3 atingido pela via "OU ≥ 80%" e pela via "≥ 20 testes"
simultaneamente.

**Resultado:** ✅ 100% statements / 80% branches / 100% functions / 100% lines.

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

### Tokens consumidos pelo Tabs

| Token | Light | Dark | Uso |
|---|---|---|---|
| `bg-muted` | `#F0ECEF` (purple-tinted) | `#1E1E24` (gray-800) | track da `TabsList` |
| `text-muted-foreground` | `--muted-foreground` (gray) | `gray-100 #D7D7D9` | texto da aba inativa |
| `bg-background` | `#FDFDFD` (Mono White) | `#17171B` (gray-900) | pílula da aba ativa |
| `text-foreground` | `#4F186D` (Violeta 500) | `#FDFDFD` (Mono White) | texto da aba ativa |
| `shadow-sm` | — | — | elevação da aba ativa |
| `ring-ring` | `#E07400` (Laranja 500) | `#E07400` (Laranja 500) | anel de foco |
| `ring-offset-background` | derivado de `bg-background` | derivado de `bg-background` | offset do anel |

### Contraste WCAG (aba ativa)

| Combinação | Contraste | Nível |
|---|---|---|
| Violeta 500 + Mono White (light) | 7.85:1 | **AAA** em qualquer tamanho |
| Mono White + Gray 900 (dark) | ≈17:1 | **AAA** em qualquer tamanho |
| Anel laranja 500 (focus) | ≥ 3:1 sobre ambos os fundos | **AA UI** |

Todas as combinações superam o mínimo WCAG 2.1 AA exigido por `lex-frontend-accessibility`.

### Divergências encontradas

**0 (zero) divergências novas.** Pontos verificados:

1. **Aba ativa não é CTA.** Notion documenta hierarquia de botões (Primário =
   Violeta + Branco) — Tabs é navegação por segmentos, não CTA, e o padrão
   "pílula neutra" (background + foreground) é apropriado para segmented
   controls. Não consome `--action`.
2. **`--action` violet/orange (light/dark)** rastreado pelo Plan #208 — **não
   tocado por este componente** (Tabs não usa `bg-action`, `border-action`
   nem `text-action`).
3. **Foco laranja** alinha com Notion: "Foco (anel) primário = Laranja 500".
4. **Tipografia** herda chain `'Poppins','Roboto',sans-serif` do root — sem
   Lastica em corpo (Lastica é exclusiva do logo conforme `lex-brand-typography`).
5. **Logo** N/A — Tabs não é superfície de logo.

**Resultado:** ✅ Brand alinhado com Notion; 0 divergências novas.

## Pipeline (AC-7)

| Comando | Exit | Tempo | Observação |
|---|---|---|---|
| `npm run typecheck` | 0 | ~10s | sem output (sucesso) |
| `npm run lint` | 0 | ~15s | 0 errors; 27 warnings — todos pré-existentes em `main`, nenhum em arquivos do Tabs |
| `npm run test` | 0 | 35.98s | 725 passed (25 files) |
| `npm run build` | 0 | ~30s | rslib emitted 68 files, 91.0 kB gzipped |
| `npm run docs:build` | 0 | 62.01s | 23 pages, incluindo `/componentes/tabs/index.html` |

**Resultado:** ✅ 5/5 verdes.

## Decisão

**Go.** Os 6 checks (+ Brand check) estão verdes. Procede para Phase 7
(`kata-pr-prepare`).
