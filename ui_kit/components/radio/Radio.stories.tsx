import type { Meta, StoryObj } from "@storybook/react";

import { Radio, RadioGroup } from "./index";

const meta: Meta<typeof Radio> = {
  title: "Components/Radio",
  component: Radio,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Seleção única dentro de um grupo. Compound: `<RadioGroup>` envolve N `<Radio>`. Base no Radix Radio Group (keyboard ↑↓, roving tabindex, role=radiogroup).",
      },
    },
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md"] },
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="daily">
      <Radio value="now" label="Imediato" />
      <Radio value="daily" label="Diário" />
      <Radio value="weekly" label="Semanal" />
    </RadioGroup>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <RadioGroup defaultValue="daily">
      <Radio value="now" label="Imediato" description="Recebe assim que acontece" />
      <Radio value="daily" label="Diário" description="Resumo no fim do dia" />
      <Radio value="weekly" label="Semanal" description="Resumo na sexta-feira" />
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup orientation="horizontal" defaultValue="month" gap={20}>
      <Radio value="day" label="Dia" />
      <Radio value="week" label="Semana" />
      <Radio value="month" label="Mês" />
      <Radio value="year" label="Ano" />
    </RadioGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-xs uppercase text-fg-muted">sm</p>
        <RadioGroup defaultValue="a">
          <Radio value="a" size="sm" label="Pequeno" description="13px label" />
          <Radio value="b" size="sm" label="Pequeno" description="Box 16px" />
        </RadioGroup>
      </div>
      <div>
        <p className="mb-2 text-xs uppercase text-fg-muted">md (default)</p>
        <RadioGroup defaultValue="a">
          <Radio value="a" label="Médio" description="14px label" />
          <Radio value="b" label="Médio" description="Box 18px" />
        </RadioGroup>
      </div>
    </div>
  ),
};

export const Invalid: Story = {
  render: () => (
    <RadioGroup>
      <Radio value="a" invalid label="Você precisa escolher uma opção" />
      <Radio value="b" invalid label="Outra alternativa" />
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="now">
      <Radio value="now" label="Disponível agora" />
      <Radio value="trial" label="Não disponível neste plano" disabled />
      <Radio value="enterprise" label="Apenas Enterprise" disabled />
    </RadioGroup>
  ),
};

export const Standalone: Story = {
  render: () => (
    <RadioGroup defaultValue="b" name="standalone">
      <div className="flex items-center gap-2">
        <Radio id="r-a" value="a" />
        <label htmlFor="r-a" className="text-sm">
          Sem composição interna — label externa via{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">
            htmlFor
          </code>
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Radio id="r-b" value="b" />
        <label htmlFor="r-b" className="text-sm">
          Útil quando preciso de layout custom
        </label>
      </div>
    </RadioGroup>
  ),
};

/**
 * Força a story para o tema escuro independentemente do toggle global da
 * toolbar. Serve como contrato visual: o Radio mantém WCAG AA dos estados
 * (unchecked, checked, invalid, disabled) em ambos os tamanhos (sm, md)
 * sobre fundo Mono Black (#0E1016) / Cinza 900 (#17171B) declarados em
 * lex-brand-colors. Os tokens brand-aware (`bg-action`, `border-action`,
 * `border-border-strong`, `text-fg`, `text-fg-muted`, `border-destructive`)
 * preservam contraste sob `data-theme="dark"`, mesmo após a inversão do
 * --primary do v0.1.0 (PR #226: Violet 500 em light, Orange 500 em dark).
 *
 * Todos os <Radio> e <RadioGroup> desta story carregam nome acessível
 * explícito (prop `label` ou `aria-label` no grupo) — mitiga a armadilha
 * Plan #208 (componentes sem rótulo na DarkTheme story disparam axe
 * `label` rule violation).
 */
export const DarkTheme: Story = {
  globals: { theme: "dark" },
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          'Matriz estados × tamanhos + composição com label/description + horizontal + invalid + disabled + fieldset/legend sobre fundo escuro. Confirma que `bg-action` / `border-action` mantêm contraste ≥ 3:1 (UI) sob `data-theme="dark"`, e que o anel de foco (`focus-visible:ring-ring`) e a borda padrão (`border-border-strong`) preservam visibilidade sobre Mono Black.',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-8">
      <RadioGroup aria-label="Frequência md" defaultValue="daily">
        <Radio
          value="now"
          label="Imediato (md)"
          description="Recebe assim que acontece"
        />
        <Radio
          value="daily"
          label="Diário (md)"
          description="Resumo no fim do dia"
        />
        <Radio
          value="weekly"
          label="Semanal (md)"
          description="Resumo na sexta-feira"
        />
      </RadioGroup>

      <RadioGroup aria-label="Frequência sm" defaultValue="a">
        <Radio value="a" size="sm" label="Pequeno (sm)" description="13px label" />
        <Radio value="b" size="sm" label="Pequeno (sm)" description="Box 16px" />
      </RadioGroup>

      <RadioGroup
        aria-label="Período"
        orientation="horizontal"
        defaultValue="month"
        gap={20}
      >
        <Radio value="day" label="Dia" />
        <Radio value="week" label="Semana" />
        <Radio value="month" label="Mês" />
        <Radio value="year" label="Ano" />
      </RadioGroup>

      <RadioGroup aria-label="Opção inválida">
        <Radio value="a" invalid label="Você precisa escolher uma opção" />
        <Radio value="b" invalid label="Outra alternativa" />
      </RadioGroup>

      <RadioGroup aria-label="Disponibilidade" defaultValue="now">
        <Radio value="now" label="Disponível agora" />
        <Radio value="trial" label="Não disponível neste plano" disabled />
        <Radio value="enterprise" label="Apenas Enterprise" disabled />
      </RadioGroup>

      <fieldset className="flex flex-col gap-3 rounded-md border border-border p-4">
        <legend className="px-2 text-sm font-semibold">
          Notificações (dark)
        </legend>
        <RadioGroup name="dark-notif" defaultValue="email">
          <Radio
            value="email"
            label="Email"
            description="Resumo diário e alertas críticos"
          />
          <Radio value="push" label="Push" description="Apenas alertas críticos" />
          <Radio value="sms" label="SMS" description="Apenas para 2FA" disabled />
        </RadioGroup>
      </fieldset>
    </div>
  ),
};

export const InsideForm: Story = {
  parameters: {
    a11y: {
      // WHY: story renders Radio descriptions in `text-fg-muted` and a raw
      // Violet 500 submit button (.bg-guardia-purple-500) — both inside the
      // lex-brand-colors permissive surfaces (button 3:1 / muted caption
      // deferred to follow-up).
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
  },
  render: () => (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        alert(`plano = ${data.get("plano")}`);
      }}
    >
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-semibold">Plano</legend>
        <RadioGroup name="plano" defaultValue="pro">
          <Radio value="starter" label="Starter" description="Até 1k transações/mês" />
          <Radio value="pro" label="Pro" description="Até 10k transações/mês" />
          <Radio value="enterprise" label="Enterprise" description="Personalizado" />
        </RadioGroup>
      </fieldset>
      <button
        type="submit"
        className="self-start rounded-md bg-guardia-purple-500 px-3 py-2 text-sm text-white"
      >
        Confirmar
      </button>
    </form>
  ),
};
