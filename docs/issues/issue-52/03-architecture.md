# Architecture — #52 feat(switch): migrate Switch to v0.1.0 DoD

## Decisão estrutural

Migração in-place do diretório `ui_kit/components/switch/` para o DoD canônico. Componente reescrito do zero usando os mesmos padrões já validados por `Checkbox` (analógico mais próximo: Forms category, Radix primitive, label/description, invalid, sm/md, jest-axe em light + dark).

## Stack adotada

- **Base:** `@radix-ui/react-switch` (mesma versão já no `package.json`; o baseline atual já usava).
- **Variants:** `class-variance-authority` (CVA) para `trackVariants` (root) e `thumbVariants`.
- **Estilos:** Tailwind v4 (utilities + tokens semânticos do `ui_kit/styles/index.css`).
- **Composição com label:** wrapper `<label htmlFor={id}>` quando `label` ou `description` é passada (mesmo padrão de Checkbox).
- **ID:** `React.useId()` com fallback ao `id` passado.
- **Acessibilidade:** Radix Switch nativo provê `role="switch"` + `aria-checked`. Adicionamos `aria-invalid` (quando `invalid`), `aria-describedby` (quando `description`) e `disabled:opacity-55`.

## API pública

```tsx
export interface SwitchProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>, "children">,
    VariantProps<typeof trackVariants> {
  invalid?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  wrapperClassName?: string;
}

export const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLButtonElement>>;
```

Props mantidos do Radix: `checked`, `defaultChecked`, `onCheckedChange`, `disabled`, `name`, `value`, `required`, `id`, `className`. Removido `children` (Radix Switch ignora; usamos `<SwitchPrimitives.Thumb>` interno fixo).

## Divergências em relação à referência legacy (`ux_references/Switch/index.tsx`)

| Item | Legacy | v0.1.0 DoD | Justificativa |
|---|---|---|---|
| Primitive | `<input type="checkbox" role="switch">` nativo | `@radix-ui/react-switch` | Padrão consolidado pelos demais componentes Forms; Radix garante focus management, `aria-checked` correto, `data-state` para CSS. |
| Callback de mudança | `onChange(e)` (input event) | `onCheckedChange(checked: boolean)` | Radix nativo; tipa o valor sem precisar ler `e.target.checked`. |
| Estado `invalid` | Inexistente | `invalid?: boolean` + `aria-invalid` + `ring-destructive/40` | Paridade com Checkbox/Radio/Input do DoD; necessário para FormLayout. |
| Tokens | `--violet-500` literal | `bg-action` (brand-aware) | `lex-brand-colors` § "CTA hierarchy by theme": violet no light, orange no dark — automático via `data-theme`. |
| Sizes API | `sm` / `md` | `sm` / `md` (mantidos) | Paridade total. |
| Track dimensions | 30×18 (sm) / 38×22 (md) | 30×18 / 38×22 — mantidos | Paridade total. |
| Thumb dimensions | 14×14 (sm) / 18×18 (md) | 14×14 / 18×18 — mantidos | Paridade total. |
| Wrapper `<label>` | sempre | apenas quando `label` ou `description` é passada | Permite uso standalone dentro de FormLayout / table cell. |

Nenhuma divergência altera o resultado visual da paridade lado-a-lado com o playground legacy.

## Estrutura de arquivos afetados (Scope Table)

| Arquivo | Mudança | AC(s) |
|---|---|---|
| `ui_kit/components/switch/index.tsx` | **Reescrito** | AC-1..AC-13 |
| `ui_kit/components/switch/Switch.test.tsx` | **Criado** | AC-2..AC-13, AC-14 |
| `ui_kit/components/switch/Switch.stories.tsx` | **Reescrito** | AC-15 |
| `docs/src/pages/componentes/switch.astro` | **Criado** | AC-16 |
| `docs/src/previews/switch.tsx` | **Criado** | AC-17 |
| `docs/src/previews/switch-live.tsx` | **Criado** | AC-17 |
| `docs/src/pages/index.astro` | **Editado** (Set MIGRATED) | AC-18 |
| `ui_kit/components/index.ts` | (já contém export — sem mudança) | AC-19 |
| `docs/issues/issue-52/01-brief.md` | **Criado** | — |
| `docs/issues/issue-52/02-requirements.md` | **Criado** | — |
| `docs/issues/issue-52/03-architecture.md` | **Criado** | — |
| `docs/issues/issue-52/05-security-review.md` | **Criado** (Phase 5) | — |
| `docs/issues/issue-52/06-quality-report.md` | **Criado** (Phase 6) | — |

Nenhum arquivo fora desse escopo será tocado. Cross-component refactors → escopo expandido via Gate 1 ou novo Plan sub-issue.

## Token mapping (claro e auditável)

| Estado | Token track | Token thumb | Notas |
|---|---|---|---|
| unchecked | `bg-muted` | `bg-background` | `--muted` é cinza neutro em ambos os temas |
| checked | `bg-action` | `bg-background` | violet light / orange dark |
| disabled | `opacity-55 + cursor-not-allowed` | inerit | aplicado no root + wrapper |
| invalid | `ring-2 ring-destructive/40` | — | sem mudar `bg-action`/`bg-muted` |
| focus-visible | `ring-2 ring-ring ring-offset-2 ring-offset-background` | — | Radix focus delegado para o root (button) |
| hover (não disabled, não checked) | `hover:bg-muted-foreground/20` ou neutro — manter `bg-muted` (referência legacy sem hover dedicado) | — | Paridade legacy. |

`text-fg` para `label`, `text-fg-muted` para `description` — idêntico Checkbox.

## Decisão sobre `border-2 border-transparent` no track

O baseline atual usa `border-2 border-transparent` no root para compatibilizar com focus-ring offset. Mantido na nova implementação para manter consistência com Checkbox/Radio: garante que `focus-visible:ring-offset-2` não bate na borda do track.

## Sem novos endpoints / event consumers / jobs

Componente puramente UI cliente. `lex-observability-required` Rule 1 não se aplica (não há "new runtime surface" no sentido HTTP/event consumer/job). Validado em Phase 5.

## Stacked PR Decomposition

**Avaliação contra Decision Checklist (`codex-stacked-prs`):**

- Único componente (uma única feature de pequena/média superfície).
- Sinais altos detectados: 0 (não há decomposição natural em camadas API → UI → docs; tudo é UI/docs do mesmo componente).
- Anti-sinais detectados: 1 (escopo pequeno, ≤ 8 arquivos editados/criados).

**Decisão:** **NÃO** decompor. Single PR (kata-contributing-pr) — coerente com a frase do issue body "PRs Estimados: 1 — PR atômico único conforme `lex-agent-planning`".

## Brand alignment (Notion como fonte da verdade)

- **Cores:** `bg-action` mapeia para Violeta 500 (light) / Laranja 500 (dark) — alinhado com [Cores no Notion](https://www.notion.so/34536f91ebd28142a3f1e0e58fd62c4b). Sem hardcoded.
- **Tipografia:** Poppins (fonte global do design-system); label 14px/13px medium 500; description 12.5px/12px regular — alinhado com [Tipografia no Notion](https://www.notion.so/34536f91ebd281b9b76ccc6159bfae69) e `lex-brand-typography`.
- **Logo:** N/A (componente não usa logo).
- **Voz:** Labels em PT-BR direto ("Notificações por e-mail", "Autopilot de conciliação", "Bloqueado") — alinhado com [Voz no Notion](https://www.notion.so/34536f91ebd2817f8cc5ca29e657c828) e `lex-brand-voice`. Zero buzzwords.

Nenhuma divergência detectada → espelho local não precisa de atualização para este escopo.

## Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Breaking change para consumidores que usavam `variant: "brand" \| "accent"` | Baixa | Médio | O baseline atual não é v0.1.0 DoD nem está documentado/anunciado. Sem consumidores na codebase via grep. Removido sem ADR (`@guardia/design-system` interno; nada externo depende disto ainda). |
| Conflito com PR paralelo de Textarea (#54/#55) | Média | Baixa | Worktree isolado `.worktrees/52-switch/` + zero overlap de arquivos (Textarea toca `ui_kit/components/textarea/` + `docs/src/pages/componentes/textarea.astro` + `docs/src/previews/textarea.tsx` + `docs/src/pages/index.astro` linha 678-700 Set MIGRATED). Apenas o Set MIGRATED tem conflito potencial; resolvido por ordem de merge (rebase whichever PR is second). |
| Falha em Gate 2 por cobertura < 80% | Baixa | Médio | ≥ 20 testes planejados; análogos (Checkbox tem 24 testes + 6 a11y; Radio similar). |
| Falha jest-axe em dark | Baixa | Alto | `axeInThemes` aplica antes de `bg-action` orange → contraste pré-validado por Checkbox/Radio que usam o mesmo token. |
| Diferença visual com o playground legacy | Baixa | Alto | Track/thumb dimensions idênticos; transição preservada; comparação explícita no Gate 1 + na aprovação do Fernando antes do PR. |
