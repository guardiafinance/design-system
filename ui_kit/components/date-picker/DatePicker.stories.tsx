import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { DatePicker } from "./index";

const meta: Meta<typeof DatePicker> = {
  title: "Components/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    a11y: {
      // WHY: trigger placeholder uses the shared `text-fg-muted` token, which
      // falls just below axe's 4.5:1 normal-text threshold. Same token issue
      // as Combobox/Input/MultiSelect — token-level adjustment requires Brand
      // validation per Plan #128 risks. Removed when `--fg-muted` is revised.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
    docs: {
      description: {
        component:
          "Seletor de data única em popover, com formato `dd/mm/aaaa` e localização pt-BR. Base no `react-day-picker` (a11y completa de calendar grid) + Radix Popover (focus management e dismissal).",
      },
    },
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
    clearable: { control: "boolean" },
    showToday: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDefaultValue: Story = {
  args: { defaultValue: new Date(2025, 2, 15) },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [date, setDate] = useState<Date | null>(new Date(2025, 0, 7));
    return (
      <div className="flex flex-col gap-2">
        <DatePicker value={date} onChange={setDate} />
        <p className="text-xs text-fg-muted">
          ISO: <code className="font-mono">{date?.toISOString() ?? "null"}</code>
        </p>
      </div>
    );
  },
};

export const Sizes: Story = {
  decorators: undefined,
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <DatePicker size="sm" placeholder="Small" />
      <DatePicker size="md" placeholder="Medium (default)" />
      <DatePicker size="lg" placeholder="Large" />
    </div>
  ),
};

export const WithMinMax: Story = {
  args: {
    minDate: new Date(),
    maxDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    placeholder: "Próximos 30 dias",
  },
};

export const Invalid: Story = {
  args: { invalid: true, placeholder: "Data obrigatória" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: new Date() },
};

export const NoToday: Story = {
  args: { showToday: false },
};

export const NotClearable: Story = {
  args: { defaultValue: new Date(), clearable: false },
};

/**
 * Renders the popover open by default so the docs preview captures the
 * calendar grid surface — selected day, today indicator, month nav, "Hoje"
 * footer. The standard stories above can be opened via the toolbar at
 * runtime; this dedicated story makes the open state reviewable without
 * interaction (parallel to Combobox/Select OpenInDialog precedent).
 */
export const OpenInDialog: Story = {
  args: {
    defaultValue: new Date(2026, 4, 15),
    open: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Dialog aberto com data selecionada para revisão do grid de dias, indicador 'hoje', navegação de mês e rodapé 'Hoje'. Útil para validar o estado visual do popover em light + dark sem precisar interagir.",
      },
    },
  },
};

/**
 * Forces dark theme regardless of the global toolbar toggle. Serves as a
 * visual contract: DatePicker preserves WCAG AA on `bg-action` (selected
 * day), `text-action` (today indicator, "Hoje" button), and the trigger
 * border/ring tokens over the Mono Black (#0E1016) surface declared in
 * lex-brand-colors.
 */
export const DarkTheme: Story = {
  globals: { theme: "dark" },
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          "Matriz de sizes + estados (default / com valor / invalid / disabled / aberto) sobre fundo escuro. Tokens `bg-action`, `text-button-fg`, `border-action`, `text-action` mantêm contraste >= 4.5:1 (texto) / >= 3:1 (UI) conforme `lex-brand-colors`.",
      },
    },
  },
  decorators: undefined,
  render: () => (
    <div className="flex w-72 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <DatePicker size="sm" placeholder="Small" />
        <DatePicker size="md" placeholder="Medium (default)" />
        <DatePicker size="lg" placeholder="Large" />
      </div>
      <div className="flex flex-col gap-2">
        <DatePicker defaultValue={new Date(2026, 4, 15)} />
        <DatePicker invalid placeholder="Data obrigatória" />
        <DatePicker disabled defaultValue={new Date(2026, 4, 15)} />
      </div>
      <DatePicker defaultValue={new Date(2026, 4, 15)} open />
    </div>
  ),
};
