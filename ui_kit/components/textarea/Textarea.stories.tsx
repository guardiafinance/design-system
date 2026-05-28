import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { Textarea } from "./index";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Campo de texto multilinha. Paridade com Input (sm/md/lg, default/error/success, invalid). Extras: contador (`showCount`), auto-grow (`autoSize` + `maxRows`), controle de `resize`.",
      },
    },
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    state: { control: "radio", options: ["default", "error", "success"] },
    resize: { control: "radio", options: ["none", "vertical", "both"] },
    invalid: { control: "boolean" },
    showCount: { control: "boolean" },
    autoSize: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-96">
      <label htmlFor="sb-default" className="mb-2 block text-sm font-medium">
        Observação
      </label>
      <Textarea
        id="sb-default"
        placeholder="Digite uma observação…"
        rows={3}
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      <div>
        <label htmlFor="sb-sm" className="mb-1 block text-xs uppercase text-fg-muted">
          sm
        </label>
        <Textarea
          id="sb-sm"
          size="sm"
          defaultValue="Textarea pequena (sm)"
          rows={2}
        />
      </div>
      <div>
        <label htmlFor="sb-md" className="mb-1 block text-xs uppercase text-fg-muted">
          md (default)
        </label>
        <Textarea
          id="sb-md"
          defaultValue="Textarea média (md) — padrão"
          rows={3}
        />
      </div>
      <div>
        <label htmlFor="sb-lg" className="mb-1 block text-xs uppercase text-fg-muted">
          lg
        </label>
        <Textarea
          id="sb-lg"
          size="lg"
          defaultValue="Textarea grande (lg)"
          rows={4}
        />
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="grid w-full max-w-3xl grid-cols-3 gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="sb-default-st" className="text-xs uppercase text-fg-muted">
          Default
        </label>
        <Textarea id="sb-default-st" placeholder="Sem estado" rows={3} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="sb-err-st" className="text-xs uppercase text-fg-muted">
          Error
        </label>
        <Textarea
          id="sb-err-st"
          invalid
          defaultValue="CNPJ inválido informado no contexto"
          rows={3}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="sb-ok-st" className="text-xs uppercase text-fg-muted">
          Success
        </label>
        <Textarea
          id="sb-ok-st"
          state="success"
          defaultValue="Revisado e aprovado pelo contador"
          rows={3}
        />
      </div>
    </div>
  ),
};

export const WithCounter: Story = {
  render: () => {
    function Wrapper() {
      const [bio, setBio] = useState(
        "Contador técnico com foco em conciliação bancária automatizada.",
      );
      return (
        <div className="w-96">
          <label htmlFor="sb-counter" className="mb-2 block text-sm font-medium">
            Bio do profissional
          </label>
          <Textarea
            id="sb-counter"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio…"
            showCount
            maxLength={240}
            rows={4}
          />
        </div>
      );
    }
    return <Wrapper />;
  },
};

export const AutoSize: Story = {
  render: () => {
    function Wrapper() {
      const [text, setText] = useState(
        "Digite mais linhas para ver o textarea\ngrowing automaticamente.\n\nQuando alcançar maxRows={6}, o overflow vira scroll.",
      );
      return (
        <div className="w-96">
          <label htmlFor="sb-auto" className="mb-2 block text-sm font-medium">
            AutoSize · maxRows=6
          </label>
          <Textarea
            id="sb-auto"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoSize
            maxRows={6}
            placeholder="Digite multi-linha…"
          />
        </div>
      );
    }
    return <Wrapper />;
  },
};

export const ResizeOptions: Story = {
  render: () => (
    <div className="grid w-full max-w-3xl grid-cols-3 gap-4">
      <div>
        <label
          htmlFor="sb-r-none"
          className="mb-1 block text-xs uppercase text-fg-muted"
        >
          resize=none
        </label>
        <Textarea id="sb-r-none" resize="none" defaultValue="sem handle" rows={3} />
      </div>
      <div>
        <label
          htmlFor="sb-r-vert"
          className="mb-1 block text-xs uppercase text-fg-muted"
        >
          vertical (default)
        </label>
        <Textarea
          id="sb-r-vert"
          resize="vertical"
          defaultValue="handle vertical"
          rows={3}
        />
      </div>
      <div>
        <label
          htmlFor="sb-r-both"
          className="mb-1 block text-xs uppercase text-fg-muted"
        >
          both
        </label>
        <Textarea
          id="sb-r-both"
          resize="both"
          defaultValue="handle nos dois eixos"
          rows={3}
        />
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-96">
      <label htmlFor="sb-disabled" className="mb-2 block text-sm font-medium">
        Travado
      </label>
      <Textarea
        id="sb-disabled"
        disabled
        defaultValue="Campo travado durante exportação"
        rows={3}
      />
    </div>
  ),
};

export const InsideForm: Story = {
  render: () => (
    <form
      className="flex w-96 flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        alert(`bio = ${data.get("bio") || "(vazio)"}`);
      }}
    >
      <label htmlFor="sb-form" className="text-sm font-medium">
        Bio
      </label>
      <Textarea
        id="sb-form"
        name="bio"
        placeholder="Conte sobre você…"
        required
        showCount
        maxLength={240}
        rows={4}
      />
      <button
        type="submit"
        className="self-start rounded-md bg-guardia-purple-500 px-3 py-2 text-sm text-white"
      >
        Enviar
      </button>
    </form>
  ),
};

/**
 * Força a story para o tema escuro independentemente do toggle global da
 * toolbar. Serve como contrato visual: o Textarea mantém WCAG AA dos
 * estados (default, error, success, disabled) em todos os tamanhos (sm,
 * md, lg) sobre fundo Mono Black (#0E1016) / Surface 2 (#28282F)
 * declarados em lex-brand-colors. Os tokens brand-aware (`border-primary`,
 * `border-destructive`, `border-signal-green`, `text-fg`,
 * `placeholder:text-fg-muted/70`, `focus-within:ring-ring`) preservam
 * contraste sob `data-theme="dark"`, mesmo após a inversão do --primary
 * do v0.1.0 (PR #226: Violet 500 em light, Orange 500 em dark).
 *
 * Todos os <Textarea> desta story carregam nome acessível explícito
 * (`<label htmlFor>`) — mitiga a armadilha Plan #208 (componentes sem
 * rótulo na DarkTheme story disparam axe `label` rule violation).
 */
export const DarkTheme: Story = {
  globals: { theme: "dark" },
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          'Matriz tamanhos × estados + contador + autoSize + disabled sobre fundo escuro. Confirma que `border-primary` (Orange 500 em dark) e `focus-within:ring-ring` mantêm contraste ≥ 3:1 (UI) sob `data-theme="dark"`, e que o placeholder e o contador (`text-fg-muted`) preservam legibilidade sobre Mono Black.',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <label htmlFor="dk-sm" className="mb-1 block text-xs uppercase text-fg-muted">
          sm
        </label>
        <Textarea id="dk-sm" size="sm" defaultValue="Textarea pequena" rows={2} />
      </div>
      <div>
        <label htmlFor="dk-md" className="mb-1 block text-xs uppercase text-fg-muted">
          md (default)
        </label>
        <Textarea id="dk-md" defaultValue="Textarea média" rows={3} />
      </div>
      <div>
        <label htmlFor="dk-lg" className="mb-1 block text-xs uppercase text-fg-muted">
          lg
        </label>
        <Textarea id="dk-lg" size="lg" defaultValue="Textarea grande" rows={4} />
      </div>
      <div>
        <label htmlFor="dk-err" className="mb-1 block text-xs uppercase text-fg-muted">
          Error
        </label>
        <Textarea
          id="dk-err"
          invalid
          defaultValue="conteúdo inválido"
          rows={3}
        />
      </div>
      <div>
        <label htmlFor="dk-ok" className="mb-1 block text-xs uppercase text-fg-muted">
          Success
        </label>
        <Textarea
          id="dk-ok"
          state="success"
          defaultValue="revisado e aprovado"
          rows={3}
        />
      </div>
      <div>
        <label htmlFor="dk-count" className="mb-1 block text-xs uppercase text-fg-muted">
          Counter
        </label>
        <Textarea
          id="dk-count"
          showCount
          maxLength={120}
          defaultValue="Com contador habilitado."
          rows={3}
        />
      </div>
      <div>
        <label htmlFor="dk-disabled" className="mb-1 block text-xs uppercase text-fg-muted">
          Disabled
        </label>
        <Textarea
          id="dk-disabled"
          disabled
          defaultValue="campo travado"
          rows={2}
        />
      </div>
    </div>
  ),
};
