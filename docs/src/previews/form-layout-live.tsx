import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { CodeEditor } from "@ds/components/code-editor";
import { FormLayout } from "@ds/components/form-layout";
import { Input } from "@ds/components/input";
import { Select } from "@ds/components/select";

const DEFAULT_CODE = `<FormLayout variant="stacked" as="div" className="rounded-lg border border-border bg-card p-5">
  <FormLayout.Header
    title="Cadastrar empresa"
    description="Preencha os dados básicos para criar a conta"
  />
  <FormLayout.Section title="Identificação">
    <FormLayout.Row cols={12}>
      <FormLayout.Field label="CNPJ" required span={6} htmlFor="cnpj">
        <Input placeholder="00.000.000/0000-00" />
      </FormLayout.Field>
      <FormLayout.Field label="Razão social" required span={6} htmlFor="rs">
        <Input />
      </FormLayout.Field>
      <FormLayout.Field label="Plano" span={12} htmlFor="plano">
        <Select
          options={[
            { value: "starter", label: "Starter" },
            { value: "pro", label: "Pro" },
            { value: "enterprise", label: "Enterprise" },
          ]}
          placeholder="Selecione"
        />
      </FormLayout.Field>
    </FormLayout.Row>
  </FormLayout.Section>
</FormLayout>`;

const scope = { FormLayout, Input, Select };

export function LiveFormLayoutSnippet() {
  const [code, setCode] = useState(DEFAULT_CODE);
  return (
    <LiveProvider code={code} scope={scope}>
      <div className="grid gap-3 md:grid-cols-2">
        <CodeEditor
          value={code}
          onChange={setCode}
          language="tsx"
          filename="playground.tsx"
          minHeight="320px"
          maxHeight="540px"
        />
        <div className="flex min-h-[320px] flex-col overflow-hidden rounded-md border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Preview ao vivo</span>
            <span className="font-mono normal-case tracking-normal">
              react-live
            </span>
          </div>
          <div className="flex flex-1 items-start justify-center overflow-auto p-6">
            <LivePreview />
          </div>
          <LiveError className="m-3 rounded-md border border-destructive/20 bg-destructive/5 p-3 font-mono text-[12px] text-destructive" />
        </div>
      </div>
    </LiveProvider>
  );
}
