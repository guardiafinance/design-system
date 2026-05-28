import type { Meta, StoryObj } from "@storybook/react";
import { Building2 } from "lucide-react";

import { Select } from "./index";

const PLANOS = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "business", label: "Business" },
  { value: "enterprise", label: "Enterprise" },
];

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  args: { options: PLANOS },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Dropdown estilizado para listas curtas. Mesma arquitetura do Combobox (Radix Popover + listbox custom), só sem busca. Para listas longas/buscáveis, prefira `<Combobox />`.",
      },
    },
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    state: { control: "radio", options: ["default", "error", "success"] },
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Selecione um plano" },
};

export const WithDefaultValue: Story = {
  args: { defaultValue: "pro" },
};

export const WithLeftIcon: Story = {
  args: {
    placeholder: "Selecione",
    leftIcon: <Building2 width={16} height={16} />,
  },
};

export const Sizes: Story = {
  decorators: [],
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Select options={PLANOS} size="sm" placeholder="Small" />
      <Select options={PLANOS} size="md" placeholder="Medium (default)" />
      <Select options={PLANOS} size="lg" placeholder="Large" />
    </div>
  ),
};

export const States: Story = {
  decorators: [],
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Select options={PLANOS} placeholder="Default" />
      <Select options={PLANOS} state="error" defaultValue="pro" />
      <Select options={PLANOS} state="success" defaultValue="pro" />
      <Select options={PLANOS} invalid placeholder="Invalid (shortcut)" />
      <Select options={PLANOS} disabled defaultValue="starter" />
    </div>
  ),
};

export const WithDisabledOption: Story = {
  args: {
    options: [
      ...PLANOS,
      { value: "legacy", label: "Legacy (descontinuado)", disabled: true },
    ],
  },
};

/**
 * Select no tema dark.
 *
 * Força `globals.theme="dark"` no nível da story (não apenas via toolbar
 * global) e renderiza a matriz dos estados visuais críticos: trigger
 * fechado em cada variante relevante (Default, com seleção, Invalid,
 * Disabled), com `leftIcon`, e com option `disabled`. Segue o padrão
 * estabelecido pelo Avatar (`Avatar.stories.tsx::DarkTheme`, PR #119) e
 * replicado em IconButton (#205), ButtonGroup (#206), Button (#209),
 * Checkbox (#217), DatePicker (#218), Combobox (#219), FileUpload (#222),
 * Input (#223) e FormLayout (#224).
 *
 * WHY não força open: o `<Popover.Portal>` do Radix renderiza fora do
 * decorator de tema da story, então um estado open visual no dark exigiria
 * portal customizado. A cobertura a11y em ambos os temas (incluindo open
 * com seleção, invalid e disabled) fica em `select.test.tsx` via
 * `axeInThemes`, que alterna `data-theme` no `<html>` — toolkit dedicado.
 *
 * Background "dark" definido em `.storybook/preview.tsx`
 * (parameters.backgrounds.values + applyThemeSync). Todos os tokens
 * (`bg-background`, `text-fg`, `border-border-strong`, `border-action`,
 * `bg-bg-hover`, `text-action`, `text-fg-muted`, `bg-muted`,
 * `border-destructive`) flipam via `[data-theme="dark"]` no `<html>`.
 *
 * Post-#226: em dark, `--primary` resolve para Laranja 500 (CTA principal
 * por contraste sobre superfícies escuras); `border-action` usa o mesmo
 * token via `--action`. A inversão já está em `main` — esta story apenas
 * exercita os tokens, sem reabrir a discussão de brand.
 */
export const DarkTheme: Story = {
  globals: { theme: "dark" },
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          "Matriz dos estados visuais críticos do Select no tema dark — trigger fechado em cada variante (Default, com seleção, Invalid, Disabled, com leftIcon, com option disabled). Cada estado mantém contraste WCAG AA conforme tokens do design-system em dark mode (pós-inversão #226: `--primary` em dark resolve para Laranja 500).",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <Select options={PLANOS} placeholder="Default — Selecione um plano" />
      <Select options={PLANOS} defaultValue="pro" />
      <Select options={PLANOS} invalid placeholder="Invalid state" />
      <Select options={PLANOS} disabled defaultValue="business" />
      <Select
        options={PLANOS}
        placeholder="Com leftIcon"
        leftIcon={<Building2 width={16} height={16} />}
      />
      <Select
        options={[
          ...PLANOS,
          { value: "legacy", label: "Legacy (descontinuado)", disabled: true },
        ]}
        defaultValue="enterprise"
      />
    </div>
  ),
};
