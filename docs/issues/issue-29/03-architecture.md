# Phase 3 — Architecture: Label v0.1.0 DoD review

## Scope of change

| Area | What changes | What does NOT change |
|------|-------------|----------------------|
| `ui_kit/components/label/index.tsx` | Nada. Componente já está correto (Radix Label + CVA `size` + `required` + `optional`). | API pública, defaults, classes geradas. |
| `ui_kit/components/label/Label.stories.tsx` | Confirmar que as 6 stories existentes funcionam em light + dark sob o toolbar do preview; sem adições — todas as variantes já cobertas. | Não criar story redundante; sem `parameters.themes` por story (decorator global do preview já cobre). |
| `ui_kit/components/label/label.test.tsx` | **EXPAND** de 11 → ≥ 20 testes; **ADD** jest-axe via `axeInThemes()` (3 cenários × 2 temas = 6 asserts a11y). | Mocks de internos; queries por testId quando query acessível resolve. |
| `docs/issues/issue-29/*` | Brief, Requirements, Architecture, Security review, Quality report. | Outros docs. |

Nada fora de `ui_kit/components/label/` ou `docs/issues/issue-29/` é tocado neste PR. Achados tangenciais → Tangential Finding Protocol (comentário em #29).

## Storybook theming

O preview global (`.storybook/preview.tsx`) já injeta um toolbar `Theme` que aplica `document.documentElement.setAttribute("data-theme", theme)` em todas as stories via decorator. Não é necessário adicionar `parameters.themes` por story — o toggle é cross-cutting.

→ Para AC-1 basta confirmar que cada story renderiza limpa nos dois temas pelo toolbar; sem código novo necessário.

## Testing harness

| Layer | Stack | Reference |
|-------|------|-----------|
| Test runner | Vitest (`npm run test` → `vitest run`) | `vitest.config.ts` |
| DOM | jsdom (cleanup global em `afterEach`) | `vitest.setup.ts` |
| Queries | `@testing-library/react` (`render`, `screen`, `getByRole`, `getByLabelText`, `getByText`) | `lex-frontend-testing` |
| User events | `@testing-library/user-event` (para AC-3: clique no label ativa input) | (vai precisar `await userEvent.setup()`) |
| Matchers | `@testing-library/jest-dom` (`toBeInTheDocument`, `toHaveAttribute`, `toHaveClass`) | já em `vitest.setup.ts` |
| A11y | `jest-axe` (`toHaveNoViolations` globalizado) + helper `axeInThemes(container)` | `ui_kit/test-utils/a11y.ts` (mirror do padrão Badge / Tech Task #125) |
| Path alias | `@/test-utils/a11y` → `ui_kit/test-utils/a11y.ts` | `vitest.config.ts` `resolve.alias` |

## jest-axe pattern (mirroring Badge)

```tsx
import { axeInThemes } from "@/test-utils/a11y";

it("a11y AC-4: default Label + associated input — light + dark", async () => {
  const { container } = render(
    <>
      <Label htmlFor="email-axe">Email</Label>
      <input id="email-axe" type="email" />
    </>,
  );
  await axeInThemes(container);
});
```

`axeInThemes()` internamente:
1. Salva `data-theme` atual.
2. Para cada tema em `["light", "dark"]`: aplica em `document.documentElement`, roda `axe(element)`, asserta `toHaveNoViolations()`.
3. `finally` restaura o tema anterior — sem leak entre testes.

## Test coverage plan (target: ≥ 20 tests, currently 11)

Os 11 testes existentes já cobrem: render, htmlFor, sizes (sm + md), required+asterisco, optional+sufixo, customOptionalLabel, data attributes, className merge, ref. **Manter todos** e adicionar:

| # | Novo teste | AC |
|---|-----------|----|
| 12 | `getByText` resolve children mesmo quando o componente os renderiza dentro de `<span>` interno (guard contra regressão de DOM) | AC-3 |
| 13 | `getByLabelText("Email")` retorna o input associado quando `htmlFor` casa com `id` | AC-3 |
| 14 | Click no label foca o input associado (`userEvent.click` no label → `document.activeElement === input`) | AC-3 |
| 15 | `required` + `optional` simultâneos: ambos renderizados (sufixo e asterisco) sem colisão | AC-3 |
| 16 | Default `optionalLabel` é `"(opcional)"` quando `optional=true` e prop não fornecida | AC-3 |
| 17 | Render aceita ReactNode como children (`<Label><strong>Email</strong></Label>`) | AC-3 |
| 18 | Atributo `data-slot="label"` sempre presente (contrato com CSS / DS) | AC-3 |
| 19 | Sem `required` E sem `optional`: nenhum sufixo nem asterisco no DOM (negative guard) | AC-3 |
| 20 | Spread de props extras (`id`, `aria-describedby`) sobrevive ao Radix Root | AC-3 |
| 21 | a11y `toHaveNoViolations()` — Default associado a input — light + dark | AC-4 |
| 22 | a11y — Label com `required` + input focado (estado interativo principal) — light + dark | AC-4 |
| 23 | a11y — Label associado a input `disabled` (`peer-disabled` styling) — light + dark | AC-4 |

Total: **23 testes**, com 3 deles disparando `axeInThemes` (= 6 asserts axe).

## Brand × Notion verification

- MCP `notion` **não está habilitado** em `.ahrena/.directives` (`# - notion` está comentado). Logo, a verificação Brand vai como **manual pending** no PR (declarado em AC-5).
- Espelhos locais consultados (read-only): `.claude/rules/design/brand/lex-brand-voice.md`, `lex-brand-logo.md`, `lex-brand-colors.md`, `lex-brand-typography.md`. O `Label` usa apenas: `text-foreground`, `text-destructive` (asterisco), `text-muted-foreground` (sufixo opcional) — tokens semânticos do DS, sem hardcoded color. Tipografia herdada do tema global (Poppins via tokens). Texto pt-BR "(opcional)" é direto e neutro — alinhado ao `lex-brand-voice` (Direct, Clear).
- Conclusão: **sem divergência aparente** vs. Notion na superfície do componente; flag manual no PR para Fernando confirmar visualmente.

## Visual baselines

- Não há `__image_snapshots__/` no diretório do Label (`find` confirma).
- Se `npm run test` disparar snapshot images via `jest-image-snapshot` em algum suíte cross-component que toque o Label e gerar diff, **NÃO** atualizar. Listar nomes na seção "Visual baselines (CI re-run needed)" do PR.

## Quality gate

Comandos exatos em Phase 6, ordem:
1. `npm run typecheck`
2. `npm run lint`
3. `npm run test`
4. `npm run build`
5. `npm run docs:build`

Cada um precisa exit code 0. Saídas registradas em `06-quality-report.md`.

## Commit & PR plan

- Commits atômicos (`lex-small-commits` + `lex-conventional-commits`):
  - `chore(label): close v0.1.0 DoD — a11y + stories` — única mudança de produção (test + opcionalmente nada em stories se já cobre).
  - Docs do flow vão no mesmo commit (são parte da entrega do PR).
- PR via `gh pr create`, base `main`, head `chore/29-review-label-v010-dod`, body com `Closes #29` + `Refs #28` + matriz AC↔teste + quality output + seções "Visual baselines (CI re-run needed)" e "Brand × Notion".
- Assignee `@me`; labels: `evolvability ♻️` espelhada + `size/*` calculado.
- **Não merge.**

## Next step

Phase 4 — Implementação: rodar a suite atual para snapshot inicial, então estender `label.test.tsx`.
