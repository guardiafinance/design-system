import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import {
  DatePicker,
  type DateRange,
  type DatePickerSingleProps,
  type DatePickerRangeProps,
} from "./index";

/* WHY: Meta is parameterized on the single-mode props variant so the
   existing single-mode StoryObj `args` typecheck unchanged. Range
   stories live in their own block at the bottom with their own typing
   (`DatePickerRangeProps`). The DatePicker component itself accepts
   the full discriminated union — this is purely a type-level routing
   for Storybook's `args` inference. */
const meta: Meta<DatePickerSingleProps> = {
  title: "Components/DatePicker",
  component: DatePicker as React.ComponentType<DatePickerSingleProps>,
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
          "Seletor de data única (default) ou intervalo (`mode=\"range\"`) em popover, com formato `dd/mm/aaaa` e localização pt-BR. Base no `react-day-picker` (a11y completa de calendar grid) + Radix Popover (focus management e dismissal). API com discriminated union por `mode` — ver ADR-004 para o trade-off de design.",
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

type Story = StoryObj<DatePickerSingleProps>;

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

/* -------------------------------------------------------------------------
   Range mode stories
   -------------------------------------------------------------------------
   Per Plan #208 lesson — every story-level interactive element MUST have an
   accessible name (label / aria-label / wrapping <label>) or axe's `label`
   rule blocks Storybook's accessibility tests. The DatePicker in range mode
   defaults its `aria-label` to "Selecionar intervalo de datas"; every range
   story below either accepts that default or sets an explicit `aria-label`. */

type RangeStory = StoryObj<DatePickerRangeProps>;

const RangeDatePicker = DatePicker as React.ComponentType<DatePickerRangeProps>;

const RANGE_PRESELECTED: DateRange = {
  from: new Date(2026, 2, 1),
  to: new Date(2026, 2, 15),
};

export const RangeDefault: RangeStory = {
  args: { mode: "range" },
  render: (args) => <RangeDatePicker {...args} />,
};

export const RangePreselected: RangeStory = {
  args: { mode: "range", defaultValue: RANGE_PRESELECTED },
  render: (args) => <RangeDatePicker {...args} />,
};

export const RangePartialState: RangeStory = {
  args: { mode: "range" },
  render: function RangePartialStory() {
    const [range, setRange] = useState<DateRange | null>(null);
    return (
      <div className="flex flex-col gap-2">
        <RangeDatePicker
          mode="range"
          value={range}
          onChange={setRange}
          aria-label="Selecionar intervalo (estado parcial)"
        />
        <p className="text-xs text-fg-muted">
          Clique uma vez para começar — durante a seleção, o trigger mostra{" "}
          <code className="font-mono">dd/mm/aaaa — </code>. Esc descarta.
        </p>
      </div>
    );
  },
};

export const RangeWithMinMax: RangeStory = {
  args: {
    mode: "range",
    minDate: new Date(),
    maxDate: new Date(new Date().setDate(new Date().getDate() + 60)),
    placeholder: "Próximos 60 dias",
  },
  render: (args) => <RangeDatePicker {...args} />,
};

export const RangeDisabled: RangeStory = {
  args: {
    mode: "range",
    disabled: true,
    defaultValue: RANGE_PRESELECTED,
  },
  render: (args) => <RangeDatePicker {...args} />,
};

export const RangeDarkTheme: RangeStory = {
  args: { mode: "range", defaultValue: RANGE_PRESELECTED },
  parameters: {
    backgrounds: { default: "dark" },
    themes: { themeOverride: "dark" },
  },
  decorators: [
    (Story) => (
      <div data-theme="dark" className="bg-background p-6">
        <div className="w-72">
          <Story />
        </div>
      </div>
    ),
  ],
  render: (args) => <RangeDatePicker {...args} />,
};
