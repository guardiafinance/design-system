import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { Slider } from "./index";

const meta: Meta<typeof Slider> = {
  title: "Components/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Faixa numérica contínua. Wrapper de `<input type=\"range\">` com variantes `size`, estados `invalid` e `disabled`, e readout opcional com `format` / `prefix` / `suffix`. Mantém role=slider, ARIA value-now/min/max e navegação por setas nativos.",
      },
    },
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md"] },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    showValue: { control: "boolean" },
    prefix: { control: "text" },
    suffix: { control: "text" },
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    "aria-label": "Volume",
    defaultValue: 40,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-80">
      <Slider aria-label="sm" size="sm" defaultValue={30} showValue suffix="%" />
      <Slider aria-label="md" size="md" defaultValue={60} showValue suffix="%" />
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    function ControlledSlider() {
      const [value, setValue] = useState(25);
      return (
        <div className="flex flex-col gap-3 w-80">
          <Slider
            aria-label="Volume controlado"
            value={value}
            onValueChange={setValue}
            showValue
            suffix="%"
          />
          <p className="text-sm text-fg-muted">
            Estado externo: <code className="font-mono">{value}</code>
          </p>
        </div>
      );
    }
    return <ControlledSlider />;
  },
};

export const WithFormatPrefixSuffix: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-80">
      <Slider
        aria-label="Preço"
        defaultValue={120}
        min={0}
        max={500}
        step={10}
        showValue
        prefix="R$ "
        format={(v) => v.toFixed(2).replace(".", ",")}
      />
      <Slider
        aria-label="Latência"
        defaultValue={250}
        min={50}
        max={1000}
        step={25}
        showValue
        suffix=" ms"
      />
      <Slider
        aria-label="Progresso"
        defaultValue={75}
        showValue
        format={(v) => `${v}%`}
      />
    </div>
  ),
};

export const Invalid: Story = {
  args: {
    "aria-label": "Volume",
    defaultValue: 95,
    invalid: true,
    showValue: true,
    suffix: "%",
  },
};

export const Disabled: Story = {
  args: {
    "aria-label": "Volume",
    defaultValue: 30,
    disabled: true,
    showValue: true,
    suffix: "%",
  },
};
