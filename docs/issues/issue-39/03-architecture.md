# Architecture — Plan #39

## Scope (literal)

**Test/story-only delta.** Nenhuma mudança em `index.tsx` (source do componente).
A barra de implementação que o DoD do parent #38 levanta — review playground +
dark coverage + a11y + Brand — pode ser fechada inteiramente em:

1. `ui_kit/components/combobox/Combobox.stories.tsx` (+1 story `DarkTheme`).
2. `ui_kit/components/combobox/combobox.test.tsx` (+2 testes comportamentais
   `Home`/`End`, +1 cenário `axeInThemes` `no-results`).
3. `docs/issues/issue-39/*.md` (artifacts do fluxo Issue-Driven).

Sem ADR — não há decisão arquitetural relevante. Padrão segue Avatar/Button
review.

## Affected components

| Arquivo | Tipo de mudança | Linhas esperadas |
|---|---|---|
| `ui_kit/components/combobox/Combobox.stories.tsx` | adição story `DarkTheme` ao final | +~50 |
| `ui_kit/components/combobox/combobox.test.tsx` | +2 behavioral (`Home`/`End`) no bloco principal + 1 a11y (`no-results`) no bloco `a11y` | +~30 |
| `docs/issues/issue-39/01-brief.md` | novo arquivo | +~70 |
| `docs/issues/issue-39/02-requirements.md` | novo arquivo | +~110 |
| `docs/issues/issue-39/03-architecture.md` | novo arquivo (este) | +~80 |
| `docs/issues/issue-39/05-security-review.md` | novo arquivo | +~30 |
| `docs/issues/issue-39/06-quality-report.md` | novo arquivo | +~80 |

**Não tocar:**

- `ui_kit/components/combobox/index.tsx` — source intacta. Qualquer mudança
  ali requer expandir o escopo via novo Gate 1.
- `docs/src/pages/componentes/combobox.astro` — playground já cobre as 7
  seções necessárias.
- Tokens (`tailwind.config.ts`, theme files) — fora de escopo (sob #128 e #208).

## Component composition

Combobox é uma primitiva **standalone** — não compõe `Input`/`Popover`/`Command`
do design-system (esses três não existem como primitivos próprios em
`ui_kit/components/`). Compõe diretamente:

- `@radix-ui/react-popover` (wrapper headless — Popover.Root, Trigger, Portal,
  Content). Comportamento de positioning, outside-click, Escape, focus
  management vem do Radix.
- `lucide-react` (ícones Check, ChevronDown, Search, X — todos com
  `aria-hidden="true"`).
- `class-variance-authority` (CVA) para `triggerVariants` (size matrix).
- `@/lib/utils::cn` (Tailwind class merger).

**Implicação Brand:** verificação Brand do Combobox é **local**, não herdada
de outros primitivos. Cada token consumido é responsabilidade do Combobox.

## A11y wiring (não muda)

| Elemento | role | aria-* attributes |
|---|---|---|
| Trigger `<button>` | `combobox` | `aria-expanded`, `aria-haspopup="listbox"`, `aria-controls={listId}`, `aria-invalid?`, `aria-label?`, `aria-labelledby?` |
| Search `<input>` | implícito (`type="search"`) | `aria-controls={listId}`, `aria-activedescendant={activeOptionId?}` |
| List `<div>` | `listbox` | `id={listId}` |
| Option `<button>` | `option` | `aria-selected`, `id={optionId(i)}`, `data-option-index={i}` |
| Clear `<button>` (sibling) | implícito | `aria-label="Limpar seleção"` |
| ChevronDown / Check / Search / X | n/a | `aria-hidden="true"` |

Pattern correto: ARIA Authoring Practices recomenda **não aninhar elementos
interativos dentro de `role="combobox"`**. O Combobox respeita isso —
clear button é sibling absolutamente posicionado (WHY-comment em `index.tsx:254-258`).

## Delta plan (Phase 4)

### Delta 1 — Story `DarkTheme` em `Combobox.stories.tsx`

Adicionar ao final do arquivo, após `EmptyState`:

```typescript
/**
 * Combobox no tema dark.
 *
 * Força globals.theme="dark" e renderiza matriz dos estados visuais críticos:
 * trigger fechado (Default + WithDefaultValue + Invalid + Disabled),
 * Clearable com valor, com leftIcon. Não força open — Popover dentro de
 * decorators de Storybook é renderizado em Portal que escapa o decorator
 * de tema; a interação open é coberta pelos cenários jest-axe do
 * combobox.test.tsx (que aplica data-theme via axeInThemes helper).
 *
 * Background "dark" definido em .storybook/preview.tsx
 * (parameters.backgrounds.values). Tokens flipam automaticamente via
 * [data-theme="dark"] no <html> + applyThemeSync.
 */
export const DarkTheme: Story = {
  globals: { theme: "dark" },
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          "Matriz dos estados visuais críticos do Combobox no tema dark — trigger fechado em cada variante, com seleção, invalid, disabled, clearable e com leftIcon. Cada estado mantém contraste WCAG AA conforme tokens do design-system em dark mode.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <Combobox options={PLANOS} placeholder="Default — Selecione…" />
      <Combobox options={PLANOS} defaultValue="pro" />
      <Combobox options={PLANOS} invalid placeholder="Invalid state" />
      <Combobox options={PLANOS} disabled defaultValue="business" />
      <Combobox options={PLANOS} defaultValue="enterprise" clearable />
      <Combobox
        options={CLIENTES}
        leftIcon={<Building2 width={16} height={16} />}
        defaultValue="03"
      />
    </div>
  ),
};
```

### Delta 2 — Tests `Home`/`End` em `combobox.test.tsx`

Adicionar ao final do bloco `describe("Combobox", () => { ... })` antes do
sub-describe `AC traceability`:

```typescript
it("AC-3: Home posiciona activeIndex no primeiro option filtrado", async () => {
  render(<Combobox options={PLANOS} />);
  await userEvent.click(screen.getByRole("combobox"));
  const search = screen.getByPlaceholderText("Buscar…");
  // Avança para o meio, depois Home volta ao primeiro
  await userEvent.keyboard("{ArrowDown}{ArrowDown}{Home}{Enter}");
  // Primeiro option é "Starter"
  expect(screen.getByRole("combobox")).toHaveTextContent("Starter");
});

it("AC-3: End posiciona activeIndex no último option filtrado", async () => {
  render(<Combobox options={PLANOS} />);
  await userEvent.click(screen.getByRole("combobox"));
  const search = screen.getByPlaceholderText("Buscar…");
  await userEvent.keyboard("{End}{Enter}");
  // Último option não disabled é "Enterprise" (Legacy é disabled, mas End
  // posiciona em filtered[length-1] que inclui disabled; Enter sobre disabled
  // não dispara pick — então o trigger mantém placeholder.)
  // Para validar comportamento de End em si, basta que activeIndex flua
  // para a última posição e o option correspondente fique com aria-current/
  // — checamos via aria-activedescendant do search.
  expect(search).toHaveAttribute(
    "aria-activedescendant",
    expect.stringMatching(/-opt-3$/),
  );
});
```

WHY do segundo teste usar `aria-activedescendant` em vez de selection: `End`
posiciona em `filtered[length-1]` que aqui é `Legacy` (disabled). `Enter`
sobre option disabled é no-op (`pick` early-returns). A asserção correta é a
intenção do teclado — checamos que `activeIndex` chegou ao último índice,
exposto pelo `aria-activedescendant`.

### Delta 3 — Cenário `no-results` em `axeInThemes`

Adicionar dentro do sub-describe `a11y`:

```typescript
it("AC-6: has no WCAG 2.1 AA violations in light + dark (opened, no results)", async () => {
  const { container } = render(
    <Combobox options={PLANOS} aria-label="Plano contratado" />,
  );
  await userEvent.click(screen.getByRole("combobox"));
  await userEvent.type(
    screen.getByPlaceholderText("Buscar…"),
    "zzz-nenhum-resultado",
  );
  // Confirma estado no-results visível antes do axe
  expect(screen.getByText("Nenhum resultado")).toBeInTheDocument();
  await axeInThemes(container);
});
```

## Risks

| Risk | Mitigação |
|---|---|
| `DarkTheme` story renderiza Popover Portal fora do decorator de tema | Não forçamos open na story (matriz só de estados fechados + clearable); cenários open ficam no jest-axe que aplica `data-theme` via helper. |
| Teste `End` cobrir option disabled gera flaky | Asserção via `aria-activedescendant` em vez de `Enter` resolve — a intenção do teclado é a coisa testada. |
| `npm run docs:build` requer source-view em runtime | Astro já consome `?raw` de `index.tsx` e nada foi alterado lá; build não regride. |
| Visual baselines `__image_snapshots__/components/combobox` precisam regenerar | Como `index.tsx` não muda, paint do componente é idêntico. Stories nova é um story key novo, sem baseline pré-existente — Playwright skip OR cria. Sem `regenerate-baselines` esperado. |

## Gate 1 — Auto-ack

Per o briefing inicial: scope é test/story-only delta seguindo o padrão Button
(PR #209) / IconButton (PR #205) / ButtonGroup (PR #206), já mergeados como
referência. Procedo direto para Phase 4 sem aguardar humano. Qualquer surpresa
estrutural (e.g. `npm run test` revelando que um cenário existente regride com
o `no-results`) será surfaceada antes do PR.

**Stacked PR Decomposition:** N/A. Plan = 1 PR atômico per `lex-agent-planning`.
