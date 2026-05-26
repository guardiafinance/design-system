import { FormLayout } from "@ds/components/form-layout";
import { Input } from "@ds/components/input";
import { Select } from "@ds/components/select";

const PERIODOS = [
  { value: "today", label: "Hoje" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mês" },
  { value: "quarter", label: "Este trimestre" },
];

const STATUS = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "suspended", label: "Suspensos" },
];

const PLANOS = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "business", label: "Business" },
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

export function StackedRow() {
  return (
    <FormLayout variant="stacked" as="div" className="rounded-lg border border-border bg-card p-5">
      <FormLayout.Header
        title="Cadastrar empresa"
        description="Preencha os dados básicos para criar a conta"
      />
      <FormLayout.Section title="Identificação">
        <FormLayout.Row cols={12}>
          <FormLayout.Field label="CNPJ" required span={6} htmlFor="d-cnpj">
            <Input placeholder="00.000.000/0000-00" />
          </FormLayout.Field>
          <FormLayout.Field label="Razão social" required span={6} htmlFor="d-rs">
            <Input />
          </FormLayout.Field>
          <FormLayout.Field label="Email" required span={6} htmlFor="d-em">
            <Input type="email" />
          </FormLayout.Field>
          <FormLayout.Field label="Telefone" optional span={6} htmlFor="d-tel">
            <Input placeholder="(11) 9 9999-9999" />
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
  );
}

export function SplitRow() {
  return (
    <FormLayout variant="split" as="div" className="rounded-lg border border-border bg-card p-5">
      <FormLayout.Header
        title="Editar empresa"
        description="Atualize informações de cadastro e fiscais"
      />
      <FormLayout.Section
        title="Identificação"
        description="Razão social e CNPJ aparecem em emissões fiscais — confira antes de salvar."
      >
        <FormLayout.Field label="CNPJ" required htmlFor="sp-cnpj">
          <Input placeholder="00.000.000/0000-00" />
        </FormLayout.Field>
        <FormLayout.Field label="Razão social" required htmlFor="sp-rs">
          <Input />
        </FormLayout.Field>
      </FormLayout.Section>
      <FormLayout.Divider />
      <FormLayout.Section
        title="Contato"
        description="Email principal e telefone para alertas operacionais."
      >
        <FormLayout.Field label="Email" required htmlFor="sp-em">
          <Input type="email" />
        </FormLayout.Field>
        <FormLayout.Field
          label="Telefone"
          optional
          labelAside="WhatsApp aceito"
          htmlFor="sp-tel"
        >
          <Input placeholder="(11) 9 9999-9999" />
        </FormLayout.Field>
        <FormLayout.Field label="Plano" required htmlFor="sp-plano">
          <Select options={PLANOS} placeholder="Selecione o plano" />
        </FormLayout.Field>
      </FormLayout.Section>
      <FormLayout.Actions align="end">
        <button className="rounded-md border border-border px-3 py-2 text-sm">
          Cancelar
        </button>
        <button className="rounded-md bg-guardia-purple-500 px-3 py-2 text-sm text-white">
          Salvar alterações
        </button>
      </FormLayout.Actions>
    </FormLayout>
  );
}

export function InlineRow() {
  return (
    <FormLayout
      variant="inline"
      density="compact"
      as="div"
      className="rounded-lg border border-border bg-card p-5"
    >
      <FormLayout.Header
        title="Notificações"
        description="Defina quando e como você quer ser avisado"
      />
      <FormLayout.Section>
        <FormLayout.Field label="Frequência" htmlFor="il-f">
          <Select options={FREQ} />
        </FormLayout.Field>
        <FormLayout.Field
          label="Canal"
          hint="Email é o fallback quando push falha"
          htmlFor="il-c"
        >
          <Select options={CANAL} />
        </FormLayout.Field>
        <FormLayout.Field label="Horário silencioso" optional htmlFor="il-q">
          <Input placeholder="22:00 — 07:00" />
        </FormLayout.Field>
      </FormLayout.Section>
    </FormLayout>
  );
}

export function ErrorsRow() {
  return (
    <FormLayout variant="stacked" as="div" className="rounded-lg border border-border bg-card p-5">
      <FormLayout.Section title="Validação inline">
        <FormLayout.Row cols={12}>
          <FormLayout.Field
            label="CNPJ"
            required
            span={6}
            htmlFor="er-cnpj"
            error="CNPJ inválido — verifique os dígitos"
          >
            <Input defaultValue="00.000.000/0001-X" />
          </FormLayout.Field>
          <FormLayout.Field
            label="Email"
            required
            span={6}
            htmlFor="er-em"
            hint="Será usado para login"
          >
            <Input type="email" />
          </FormLayout.Field>
        </FormLayout.Row>
      </FormLayout.Section>
    </FormLayout>
  );
}

export function CompactFiltersRow() {
  return (
    <FormLayout
      variant="stacked"
      density="compact"
      as="div"
      className="rounded-lg border border-border bg-card p-4"
    >
      <FormLayout.Header
        title="Filtros"
        description="Refine os resultados da busca"
      />
      <FormLayout.Section>
        <FormLayout.Row cols={4}>
          <FormLayout.Field label="Status" htmlFor="cf-st">
            <Select size="sm" options={STATUS} />
          </FormLayout.Field>
          <FormLayout.Field label="Plano" htmlFor="cf-pl">
            <Select size="sm" options={PLANOS} placeholder="Todos" />
          </FormLayout.Field>
          <FormLayout.Field label="Período" htmlFor="cf-per">
            <Select size="sm" options={PERIODOS} placeholder="Todos" />
          </FormLayout.Field>
          <FormLayout.Field label="Busca" htmlFor="cf-q">
            <Input size="sm" placeholder="nome / cnpj" />
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
  );
}
