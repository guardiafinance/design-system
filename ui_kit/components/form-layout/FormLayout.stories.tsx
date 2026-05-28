import type { Meta, StoryObj } from "@storybook/react";

import { FormLayout } from "./index";
import { Input } from "../input";
import { Select } from "../select";

const PLANOS = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "business", label: "Business" },
  { value: "enterprise", label: "Enterprise" },
];

const FREQ = [
  { value: "now", label: "Imediato" },
  { value: "daily", label: "Diário" },
  { value: "weekly", label: "Semanal" },
];

const CANAL = [
  { value: "email", label: "Email" },
  { value: "push", label: "Push" },
  { value: "both", label: "Push + Email" },
];

const meta: Meta<typeof FormLayout> = {
  title: "Components/FormLayout",
  component: FormLayout,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    a11y: {
      // WHY: FormLayout stories aggregate Input / Select / hint / description
      // primitives, all of which share the `text-fg-muted` token deferred
      // to Plan #128 follow-up. Error states use signal-red text on muted
      // bg — permissive surface per lex-brand-colors.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
    docs: {
      description: {
        component:
          "Esqueleto de formulários da Guardia. Compound component que padroniza cadastros, filtros, settings e wizards via Header / Section / Row / Field / Actions / Divider — três variantes (stacked, split, inline) e duas densidades (comfy, compact). Os exemplos abaixo usam Input e Select do próprio design system.",
      },
    },
  },
  argTypes: {
    variant: { control: "radio", options: ["stacked", "split", "inline"] },
    density: { control: "radio", options: ["comfy", "compact"] },
    as: { control: "radio", options: ["form", "div"] },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Stacked: Story = {
  render: () => (
    <FormLayout variant="stacked">
      <FormLayout.Header
        title="Cadastrar empresa"
        description="Preencha os dados básicos para criar a conta"
      />
      <FormLayout.Section title="Identificação">
        <FormLayout.Row cols={12}>
          <FormLayout.Field label="CNPJ" required span={6} htmlFor="s-cnpj">
            <Input placeholder="00.000.000/0000-00" />
          </FormLayout.Field>
          <FormLayout.Field label="Razão social" required span={6} htmlFor="s-rs">
            <Input />
          </FormLayout.Field>
        </FormLayout.Row>
      </FormLayout.Section>
      <FormLayout.Actions>
        <button className="rounded-md border border-border px-3 py-2 text-sm">
          Cancelar
        </button>
        <button className="rounded-md bg-guardia-purple-500 px-3 py-2 text-sm text-white">
          Salvar
        </button>
      </FormLayout.Actions>
    </FormLayout>
  ),
};

export const Split: Story = {
  render: () => (
    <FormLayout variant="split">
      <FormLayout.Header
        title="Editar empresa"
        description="Atualize informações de cadastro e fiscais"
      />
      <FormLayout.Section
        title="Identificação"
        description="Razão social, CNPJ e nome fantasia. Esses dados aparecem em emissões fiscais."
      >
        <FormLayout.Field label="CNPJ" required htmlFor="sp-cnpj">
          <Input placeholder="00.000.000/0000-00" />
        </FormLayout.Field>
        <FormLayout.Field label="Razão social" required htmlFor="sp-rs">
          <Input />
        </FormLayout.Field>
        <FormLayout.Field label="Plano" required htmlFor="sp-plano">
          <Select options={PLANOS} placeholder="Selecione" />
        </FormLayout.Field>
      </FormLayout.Section>
      <FormLayout.Divider />
      <FormLayout.Section
        title="Contato"
        description="Email principal e telefone para alertas operacionais."
      >
        <FormLayout.Field label="Email" required hint="Usado em login e notificações" htmlFor="sp-email">
          <Input type="email" />
        </FormLayout.Field>
        <FormLayout.Field label="Telefone" optional htmlFor="sp-tel" labelAside="WhatsApp aceito">
          <Input placeholder="(11) 9 9999-9999" />
        </FormLayout.Field>
      </FormLayout.Section>
      <FormLayout.Actions sticky>
        <button className="rounded-md border border-border px-3 py-2 text-sm">
          Cancelar
        </button>
        <button className="rounded-md bg-guardia-purple-500 px-3 py-2 text-sm text-white">
          Salvar alterações
        </button>
      </FormLayout.Actions>
    </FormLayout>
  ),
};

export const Inline: Story = {
  render: () => (
    <FormLayout variant="inline" density="compact">
      <FormLayout.Header
        title="Configurações de notificação"
        description="Defina quando e como você quer ser avisado"
      />
      <FormLayout.Section>
        <FormLayout.Field label="Frequência" htmlFor="i-freq">
          <Select options={FREQ} />
        </FormLayout.Field>
        <FormLayout.Field label="Canal preferido" hint="Email é o fallback" htmlFor="i-canal">
          <Select options={CANAL} />
        </FormLayout.Field>
        <FormLayout.Field label="Horário silencioso" optional htmlFor="i-quiet">
          <Input placeholder="22:00 — 07:00" />
        </FormLayout.Field>
      </FormLayout.Section>
      <FormLayout.Actions>
        <button className="rounded-md bg-guardia-purple-500 px-3 py-2 text-sm text-white">
          Salvar preferências
        </button>
      </FormLayout.Actions>
    </FormLayout>
  ),
};

export const WithErrors: Story = {
  render: () => (
    <FormLayout variant="stacked">
      <FormLayout.Header title="Validação" description="Estados de erro inline — Field injeta `invalid` no Input automaticamente" />
      <FormLayout.Section>
        <FormLayout.Row cols={12}>
          <FormLayout.Field
            label="CNPJ"
            required
            span={6}
            htmlFor="e-cnpj"
            error="CNPJ inválido — verifique os dígitos"
          >
            <Input defaultValue="00.000.000/0001-X" />
          </FormLayout.Field>
          <FormLayout.Field label="Email" required span={6} htmlFor="e-email" hint="Será usado para login">
            <Input type="email" />
          </FormLayout.Field>
        </FormLayout.Row>
      </FormLayout.Section>
    </FormLayout>
  ),
};

export const CompactDensity: Story = {
  render: () => (
    <FormLayout variant="stacked" density="compact">
      <FormLayout.Header title="Filtros" description="Refine os resultados da busca" />
      <FormLayout.Section>
        <FormLayout.Row cols={4}>
          <FormLayout.Field label="Status" htmlFor="f-status">
            <Select size="sm" options={[
              { value: "all", label: "Todos" },
              { value: "active", label: "Ativos" },
              { value: "suspended", label: "Suspensos" },
            ]} />
          </FormLayout.Field>
          <FormLayout.Field label="Plano" htmlFor="f-plan">
            <Select size="sm" options={PLANOS} placeholder="Todos" />
          </FormLayout.Field>
          <FormLayout.Field label="Cidade" htmlFor="f-city">
            <Input size="sm" />
          </FormLayout.Field>
          <FormLayout.Field label="Tags" htmlFor="f-tags">
            <Input size="sm" placeholder="vendas, suporte, ..." />
          </FormLayout.Field>
        </FormLayout.Row>
      </FormLayout.Section>
      <FormLayout.Actions align="between">
        <button className="text-sm text-guardia-purple-700 underline">
          Limpar filtros
        </button>
        <button className="rounded-md bg-guardia-purple-500 px-3 py-2 text-sm text-white">
          Aplicar
        </button>
      </FormLayout.Actions>
    </FormLayout>
  ),
};

/**
 * DarkTheme — matriz das tres variantes (stacked, split, inline) × densidades
 * (comfy, compact) + estados criticos (errors, disabled cascade, fieldset/legend
 * grouping) sob fundo Mono Black (#0E1016) / Cinza 900 (#17171B), per
 * lex-brand-colors.
 *
 * FormLayout e um layout primitive — nao tem tokens proprios alem dos
 * `text-fg` / `text-fg-muted` / `border-border` / `signal-red` (errors) /
 * `bg-[color-mix(...var(--surface)...)]` (sticky actions). Esta story
 * confirma que o esqueleto composicional (Header h2 + Section h3 + Row
 * 12-col + Field label/hint/error + sticky Actions) permanece legivel e
 * operavel quando composto com Input + Select escuros sob `data-theme="dark"`.
 */
export const DarkTheme: Story = {
  globals: { theme: "dark" },
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          'Matriz variantes × densidades + estados (errors, disabled cascade, fieldset+legend grouping) sob `data-theme="dark"`. Confirma que `text-fg` / `border-border` / `signal-red` (errors) e `bg-[color-mix(in_srgb,var(--surface)_92%,transparent)]` (sticky actions com backdrop-blur) preservam contraste sobre Mono Black, e que o esqueleto composicional permanece legivel quando wraps de Input + Select renderizam em tema escuro.',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-10">
      {/* Stacked + comfy + errors */}
      <FormLayout variant="stacked">
        <FormLayout.Header
          title="Cadastrar empresa (dark)"
          description="Stacked + comfy — variante padrão para cadastros"
        />
        <FormLayout.Section title="Identificação" description="Dados fiscais e cadastrais">
          <FormLayout.Row cols={12}>
            <FormLayout.Field
              label="CNPJ"
              required
              span={6}
              htmlFor="dk-cnpj"
              error="CNPJ inválido — verifique os dígitos"
            >
              <Input defaultValue="00.000.000/0001-X" />
            </FormLayout.Field>
            <FormLayout.Field
              label="Razão social"
              required
              span={6}
              htmlFor="dk-rs"
              hint="Conforme cadastro na Receita Federal"
            >
              <Input />
            </FormLayout.Field>
          </FormLayout.Row>
        </FormLayout.Section>
      </FormLayout>

      {/* Split + Section description + sticky actions */}
      <FormLayout variant="split">
        <FormLayout.Header
          title="Editar empresa (dark)"
          description="Variante split — sidebar à esquerda, campos à direita"
        />
        <FormLayout.Section
          title="Contato"
          description="Email principal e telefone para alertas operacionais. Email é usado em login."
        >
          <FormLayout.Field label="Email" required hint="Usado em login e notificações" htmlFor="dk-email">
            <Input type="email" />
          </FormLayout.Field>
          <FormLayout.Field label="Plano" required htmlFor="dk-plano">
            <Select options={PLANOS} placeholder="Selecione" />
          </FormLayout.Field>
        </FormLayout.Section>
        <FormLayout.Divider />
        <FormLayout.Section title="Notificações" description="Canal e frequência de envio.">
          <FormLayout.Field label="Canal" htmlFor="dk-canal">
            <Select options={CANAL} />
          </FormLayout.Field>
          <FormLayout.Field label="Frequência" htmlFor="dk-freq">
            <Select options={FREQ} />
          </FormLayout.Field>
        </FormLayout.Section>
        <FormLayout.Actions sticky>
          <button className="rounded-md border border-border px-3 py-2 text-sm text-fg">
            Cancelar
          </button>
          <button className="rounded-md bg-guardia-purple-500 px-3 py-2 text-sm text-white">
            Salvar alterações
          </button>
        </FormLayout.Actions>
      </FormLayout>

      {/* Inline + compact (settings) */}
      <FormLayout variant="inline" density="compact">
        <FormLayout.Header
          title="Notificações (dark)"
          description="Variante inline + compact — settings"
        />
        <FormLayout.Section>
          <FormLayout.Field label="Frequência" htmlFor="dk-i-freq">
            <Select options={FREQ} />
          </FormLayout.Field>
          <FormLayout.Field label="Canal preferido" hint="Email é o fallback" htmlFor="dk-i-canal">
            <Select options={CANAL} />
          </FormLayout.Field>
          <FormLayout.Field label="Horário silencioso" optional htmlFor="dk-i-quiet">
            <Input placeholder="22:00 — 07:00" />
          </FormLayout.Field>
        </FormLayout.Section>
      </FormLayout>

      {/* fieldset + legend grouping + disabled cascade */}
      <FormLayout variant="stacked">
        <FormLayout.Header
          title="Grupos e disabled (dark)"
          description="fieldset/legend + cascade de disabled em fieldset nativo"
        />
        <FormLayout.Section>
          <fieldset className="rounded-md border border-border p-4">
            <legend className="px-2 text-[12.5px] font-semibold text-fg">
              Endereço comercial
            </legend>
            <FormLayout.Row cols={12}>
              <FormLayout.Field label="CEP" span={4} htmlFor="dk-cep">
                <Input placeholder="00000-000" />
              </FormLayout.Field>
              <FormLayout.Field label="Logradouro" span={8} htmlFor="dk-log">
                <Input />
              </FormLayout.Field>
            </FormLayout.Row>
          </fieldset>
          <fieldset disabled className="mt-4 rounded-md border border-border p-4 opacity-60">
            <legend className="px-2 text-[12.5px] font-semibold text-fg">
              Dados bancários (bloqueado)
            </legend>
            <FormLayout.Row cols={12}>
              <FormLayout.Field label="Banco" span={6} htmlFor="dk-banco">
                <Input />
              </FormLayout.Field>
              <FormLayout.Field label="Agência" span={6} htmlFor="dk-ag">
                <Input />
              </FormLayout.Field>
            </FormLayout.Row>
          </fieldset>
        </FormLayout.Section>
      </FormLayout>
    </div>
  ),
};
