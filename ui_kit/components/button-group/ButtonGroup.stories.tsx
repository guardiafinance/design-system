import type { Meta, StoryObj } from "@storybook/react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "../button";
import { ButtonGroup } from "./index";

const meta: Meta<typeof ButtonGroup> = {
  title: "Components/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Agrupa Buttons/IconButtons visualmente conectados. **Attached** (default) colapsa bordas/radii entre os filhos; **spaced** (attached=false) adiciona gap. Suporta orientação horizontal e vertical.",
      },
    },
  },
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
    },
    attached: {
      control: "boolean",
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline">Anterior</Button>
      <Button variant="outline">Atual</Button>
      <Button variant="outline">Próximo</Button>
    </ButtonGroup>
  ),
};

export const Attached: Story = {
  render: () => (
    <ButtonGroup aria-label="Navegação">
      <Button variant="outline" leadingIcon={<ChevronLeft />}>
        Anterior
      </Button>
      <Button variant="outline" trailingIcon={<ChevronRight />}>
        Próximo
      </Button>
    </ButtonGroup>
  ),
};

export const Spaced: Story = {
  render: () => (
    <ButtonGroup attached={false}>
      <Button variant="outline">Salvar</Button>
      <Button variant="outline">Salvar e continuar</Button>
      <Button variant="outline">Cancelar</Button>
    </ButtonGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical" aria-label="Ações">
      <Button variant="outline">Exportar</Button>
      <Button variant="outline">Imprimir</Button>
      <Button variant="outline">Compartilhar</Button>
    </ButtonGroup>
  ),
};

export const Toolbar: Story = {
  render: () => (
    <div className="flex gap-3">
      <ButtonGroup role="toolbar" aria-label="Formatação de texto">
        <Button variant="outline" size="icon" aria-label="Negrito">
          <Bold />
        </Button>
        <Button variant="outline" size="icon" aria-label="Itálico">
          <Italic />
        </Button>
        <Button variant="outline" size="icon" aria-label="Sublinhado">
          <Underline />
        </Button>
      </ButtonGroup>
      <ButtonGroup role="toolbar" aria-label="Alinhamento">
        <Button variant="outline" size="icon" aria-label="Alinhar à esquerda">
          <AlignLeft />
        </Button>
        <Button variant="outline" size="icon" aria-label="Centralizar">
          <AlignCenter />
        </Button>
        <Button variant="outline" size="icon" aria-label="Alinhar à direita">
          <AlignRight />
        </Button>
      </ButtonGroup>
    </div>
  ),
};

export const MixedVariants: Story = {
  parameters: {
    a11y: {
      // WHY: renders Button variants `default` (Violet 500) and `destructive`
      // (Signal Red), both brand tokens in the 3:1–4.5:1 range permitted for
      // buttons by lex-brand-colors. See Button.stories.tsx meta for canon.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
  },
  render: () => (
    <ButtonGroup>
      <Button variant="default">Aprovar</Button>
      <Button variant="destructive">Rejeitar</Button>
    </ButtonGroup>
  ),
};
