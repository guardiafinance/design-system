import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { CodeEditor } from "./index";

const seedTsx = `import { Button } from "@guardiafinance/design-system";

export function Demo() {
  return <Button>Olá</Button>;
}`;

const seedJson = `{
  "name": "meu-app",
  "version": "0.1.0"
}`;

const meta: Meta<typeof CodeEditor> = {
  title: "Components/CodeEditor",
  component: CodeEditor,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Editor de código leve — mesmo visual do `CodeBlock` com `<textarea>` editável. Tab indenta, Enter preserva indentação. Sem syntax highlight para manter o bundle enxuto.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: seedTsx,
    filename: "Demo.tsx",
    language: "tsx",
  },
};

export const Empty: Story = {
  args: {
    placeholder: "Cole ou digite seu código aqui…",
    filename: "playground.tsx",
    language: "tsx",
  },
};

export const Json: Story = {
  args: {
    defaultValue: seedJson,
    filename: "package.json",
    language: "json",
  },
};

export const NoHeader: Story = {
  args: {
    defaultValue: seedTsx,
  },
};

export const NoLineNumbers: Story = {
  args: {
    defaultValue: seedTsx,
    filename: "Demo.tsx",
    language: "tsx",
    showLineNumbers: false,
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState(seedTsx);
    return (
      <div style={{ display: "grid", gap: "12px" }}>
        <CodeEditor
          value={value}
          onChange={setValue}
          filename="Demo.tsx"
          language="tsx"
        />
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 12,
            color: "#6b4f7a",
          }}
        >
          {value.length} caracteres · {value.split("\n").length} linhas
        </div>
      </div>
    );
  },
};

export const ReadOnly: Story = {
  args: {
    defaultValue: seedTsx,
    filename: "view-only.tsx",
    language: "tsx",
    readOnly: true,
  },
};

export const Compact: Story = {
  args: {
    defaultValue: "npm install @guardiafinance/design-system",
    filename: ".npmrc-example",
    language: "bash",
    minHeight: "80px",
    showLineNumbers: false,
  },
};
