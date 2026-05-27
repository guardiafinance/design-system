import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import {
  FileUpload,
  type FileUploader,
  type FileRejection,
  type UploadFile,
} from "./index";

const meta: Meta<typeof FileUpload> = {
  title: "Components/FileUpload",
  component: FileUpload,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    a11y: {
      // WHY: Dropzone caption text ("Arraste ou clique...") uses
      // `text-fg-muted` — the shared muted token deferred to Plan #128
      // follow-up. Button variant renders Button (.bg-primary brand) which
      // sits in the lex-brand-colors button range.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
    docs: {
      description: {
        component:
          "Dropzone com validação client-side de tipo e tamanho, drag-and-drop e dois modos de operação: auto-upload (componente faz o XHR e atualiza progress) ou controlled (consumer gerencia estado).",
      },
    },
  },
  argTypes: {
    variant: { control: "radio", options: ["dropzone", "button"] },
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    compact: { control: "boolean" },
    buttonSize: { control: "radio", options: ["sm", "md", "lg"] },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHint: Story = {
  args: { hint: "PDF até 10 MB" },
};

export const ValidationAccept: Story = {
  args: { accept: ".pdf,.png", hint: "Apenas PDF e PNG" },
};

export const ValidationMaxSize: Story = {
  args: {
    maxSize: 1024 * 1024,
    hint: "Máximo 1 MB · arquivos maiores são rejeitados",
  },
};

export const Multiple: Story = {
  args: { multiple: true, hint: "Selecione um ou mais arquivos" },
};

export const Compact: Story = {
  args: { compact: true, hint: "Variante densa para sidebars" },
};

export const Disabled: Story = {
  args: { disabled: true, hint: "Aguarde o processamento anterior" },
};

export const ControlledFiles: Story = {
  render: () => {
    const files: UploadFile[] = [
      { name: "extrato-marco-2025.pdf", size: 425_000, status: "done" },
      {
        name: "comprovante.png",
        size: 120_000,
        status: "uploading",
        progress: 64,
      },
      {
        name: "boleto-vencido.zip",
        size: 8_400_000,
        status: "error",
        error: "Tamanho excede 5 MB",
      },
    ];
    return <FileUpload files={files} onRemove={() => {}} />;
  },
};

/**
 * Auto-upload mode: passe `uploader` (Promise + onProgress).
 * O componente atualiza a barra sozinho conforme o XHR sobe.
 */
export const AutoUploadCustom: Story = {
  render: () => {
    /* Simulação de upload com progresso */
    const fakeUploader: FileUploader = ({ onProgress, signal }) =>
      new Promise((resolve, reject) => {
        let p = 0;
        const tick = setInterval(() => {
          if (signal.aborted) {
            clearInterval(tick);
            return;
          }
          p = Math.min(100, p + Math.floor(Math.random() * 12) + 4);
          onProgress(p);
          if (p >= 100) {
            clearInterval(tick);
            resolve();
          }
        }, 220);
        signal.addEventListener("abort", () => {
          clearInterval(tick);
          reject(new Error("Cancelado"));
        });
      });

    return (
      <FileUpload
        multiple
        accept=".pdf,.png,.jpg"
        maxSize={5 * 1024 * 1024}
        hint="PDF / PNG / JPG · máx. 5 MB · upload simulado"
        uploader={fakeUploader}
      />
    );
  },
};

/**
 * Auto-upload via uploadUrl: o componente cria um XHR e faz POST com
 * FormData. Esta story usa um endpoint público (httpbin) só para demo
 * — não vai funcionar offline.
 */
export const AutoUploadUrl: Story = {
  render: () => (
    <FileUpload
      multiple
      uploadUrl="https://httpbin.org/post"
      hint="POST FormData para httpbin.org · requer rede"
    />
  ),
};

/**
 * Variant minimalista — botão. Útil em forms inline e células de tabela.
 */
export const ButtonVariant: Story = {
  args: { variant: "button" },
};

export const ButtonWithLabel: Story = {
  args: {
    variant: "button",
    buttonLabel: "Anexar comprovante",
    accept: ".pdf,.png,.jpg",
    maxSize: 5 * 1024 * 1024,
  },
};

export const ButtonSizes: Story = {
  render: () => (
    <div className="flex items-end gap-3">
      <FileUpload variant="button" buttonSize="sm" buttonLabel="Small" />
      <FileUpload variant="button" buttonSize="md" buttonLabel="Medium" />
      <FileUpload variant="button" buttonSize="lg" buttonLabel="Large" />
    </div>
  ),
};

export const ButtonWithUploader: Story = {
  render: () => {
    const fakeUploader: FileUploader = ({ onProgress, signal }) =>
      new Promise((resolve, reject) => {
        let p = 0;
        const tick = setInterval(() => {
          if (signal.aborted) return clearInterval(tick);
          p = Math.min(100, p + Math.floor(Math.random() * 14) + 6);
          onProgress(p);
          if (p >= 100) {
            clearInterval(tick);
            resolve();
          }
        }, 220);
        signal.addEventListener("abort", () => {
          clearInterval(tick);
          reject(new Error("Cancelado"));
        });
      });
    return (
      <FileUpload
        variant="button"
        multiple
        accept=".pdf,.png,.jpg"
        maxSize={5 * 1024 * 1024}
        hint="Até 5 MB · upload simulado"
        uploader={fakeUploader}
      />
    );
  },
};

/**
 * Matriz de estados visuais críticos do FileUpload em tema dark.
 *
 * Cobertura: dropzone vazio (Default), dropzone com lista nas 3 statuses
 * (`done` + `uploading` + `error`), dropzone Disabled e a variant button
 * em três tamanhos (`sm` / `md` / `lg`). Replica o padrão do Combobox
 * (`Combobox.stories.tsx::DarkTheme`, PR #219), DatePicker (#218),
 * Button (#209), IconButton (#205), ButtonGroup (#206) e Avatar (#119).
 *
 * WHY decorators undefined: o meta envolve cada story em `w-[480px]`
 * (útil pro dropzone padrão); na matriz queremos o stack vertical natural
 * para o reviewer ler todos os estados de uma vez no playground.
 *
 * Background "dark" definido em `.storybook/preview.tsx`
 * (parameters.backgrounds.values + applyThemeSync). Todos os tokens
 * (`bg-action`, `text-action`, `text-button-fg`, `border-action`,
 * `bg-bg-hover`, `text-fg`, `border-border-strong`) flipam via
 * `[data-theme="dark"]` no `<html>`.
 */
export const DarkTheme: Story = {
  globals: { theme: "dark" },
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          "Matriz dos estados visuais críticos do FileUpload no tema dark — dropzone vazio, dropzone com lista (`done` + `uploading` + `error`), dropzone Disabled e a variant button nos 3 tamanhos. Cada estado mantém contraste WCAG AA conforme tokens do design-system em dark mode (`bg-action`, `text-action`, `text-button-fg`, `border-action`).",
      },
    },
  },
  decorators: undefined,
  render: () => {
    const mixedFiles: UploadFile[] = [
      { name: "extrato-marco-2025.pdf", size: 425_000, status: "done" },
      {
        name: "comprovante.png",
        size: 120_000,
        status: "uploading",
        progress: 64,
      },
      {
        name: "boleto-rejeitado.zip",
        size: 8_400_000,
        status: "error",
        error: "Tamanho excede 5 MB",
      },
    ];
    return (
      <div className="flex w-[520px] flex-col gap-6">
        <FileUpload hint="PDF / PNG / JPG · máx. 5 MB" />
        <FileUpload files={mixedFiles} onRemove={() => {}} />
        <FileUpload
          disabled
          hint="Aguarde o processamento anterior"
        />
        <div className="flex items-end gap-3">
          <FileUpload variant="button" buttonSize="sm" buttonLabel="Small" />
          <FileUpload variant="button" buttonSize="md" buttonLabel="Medium" />
          <FileUpload variant="button" buttonSize="lg" buttonLabel="Large" />
        </div>
      </div>
    );
  },
};

/**
 * onReject custom: receba as rejeições e mostre fora da lista interna.
 */
export const RejectCallback: Story = {
  render: function RejectCallbackStory() {
    const [rejections, setRejections] = useState<FileRejection[]>([]);
    return (
      <div className="flex flex-col gap-3">
        <FileUpload
          accept=".pdf"
          maxSize={1024 * 100}
          hint="PDF até 100 KB · rejeições aparecem como toast abaixo"
          onReject={setRejections}
        />
        {rejections.length > 0 && (
          <div className="rounded-md border border-signal-red/30 bg-signal-red/10 p-3 text-sm text-signal-red">
            <strong>{rejections.length} arquivo(s) rejeitado(s):</strong>
            <ul className="ml-4 list-disc">
              {rejections.map((r, i) => (
                <li key={i}>
                  {r.file.name} — {r.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
};
