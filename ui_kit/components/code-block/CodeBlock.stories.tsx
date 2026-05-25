import type { Meta, StoryObj } from "@storybook/react";

import { CodeBlock } from "./index";

const sampleTsx = `import { Button } from "@guardiatechnology/design-system";
import { Save } from "lucide-react";

export function Save({ isSaving }: { isSaving: boolean }) {
  return (
    <Button variant="default" leadingIcon={<Save />} loading={isSaving}>
      Salvar
    </Button>
  );
}`;

const sampleBash = `# configure registry
@guardiatechnology:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}

# install
npm install @guardiatechnology/design-system`;

const sampleJson = `{
  "name": "my-app",
  "dependencies": {
    "@guardiatechnology/design-system": "^0.1.0",
    "react": "^19.0.0"
  }
}`;

const meta: Meta<typeof CodeBlock> = {
  title: "Components/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    a11y: {
      // WHY: CodeBlock renders code on a brand-violet background with line
      // numbers in `text-white/30` (intentionally subtle, used only for
      // ordinal reference, not content). The dark code surface follows
      // the editor convention; lex-brand-colors permits violet 700/900
      // backgrounds with white text. Line-number contrast is decorative.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
    docs: {
      description: {
        component:
          "Container para código-fonte com botão de copiar e header opcional (filename + language). Não embute highlighter — para destaque de sintaxe, passe `highlightedHtml` gerado no build-time.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    code: sampleTsx,
  },
};

export const WithFilename: Story = {
  args: {
    code: sampleTsx,
    filename: "SaveButton.tsx",
    language: "tsx",
  },
};

export const Bash: Story = {
  args: {
    code: sampleBash,
    filename: ".npmrc",
    language: "bash",
  },
};

export const Json: Story = {
  args: {
    code: sampleJson,
    filename: "package.json",
    language: "json",
  },
};

export const WithLineNumbers: Story = {
  args: {
    code: sampleTsx,
    filename: "SaveButton.tsx",
    language: "tsx",
    showLineNumbers: true,
  },
};

export const Scrollable: Story = {
  args: {
    code: Array.from({ length: 40 }, (_, i) => `line ${i + 1}`).join("\n"),
    filename: "long.txt",
    language: "text",
    maxHeight: "220px",
    showLineNumbers: true,
  },
};

export const WithHighlightedHtml: Story = {
  args: {
    code: 'const x = "hello";',
    language: "tsx",
    highlightedHtml: `<pre><code><span style="color:#F1C08C">const</span> <span style="color:#D7BFE4">x</span> = <span style="color:#00BF63">&quot;hello&quot;</span>;</code></pre>`,
  },
};

export const WithoutCopyButton: Story = {
  args: {
    code: sampleTsx,
    copyable: false,
  },
};
