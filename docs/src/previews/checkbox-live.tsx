import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { CodeEditor } from "@ds/components/code-editor";
import { Checkbox } from "@ds/components/checkbox";

const DEFAULT_CODE = `const items = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio"];

function App() {
  const [checked, setChecked] = useState({
    Janeiro: true,
    Fevereiro: true,
    Março: true,
    Abril: false,
    Maio: false,
  });

  const selectedCount = Object.values(checked).filter(Boolean).length;
  const total = items.length;
  const allChecked = selectedCount === total;
  const noneChecked = selectedCount === 0;
  const parentState = allChecked
    ? true
    : noneChecked
      ? false
      : "indeterminate";

  const toggleAll = (next) => {
    const value = next === true;
    setChecked(
      items.reduce((acc, item) => ({ ...acc, [item]: value }), {}),
    );
  };

  const label = allChecked
    ? "Janeiro a Maio (todos selecionados)"
    : noneChecked
      ? "Janeiro a Maio (nenhum selecionado)"
      : "Janeiro a Maio (" + selectedCount + " de " + total + " selecionados)";

  return (
    <div className="flex flex-col gap-3">
      <Checkbox
        label="Aceito os termos"
        description="Você concorda com a política de privacidade da Guardia."
      />
      <Checkbox label="Conciliação automática" defaultChecked />

      <div>
        <Checkbox
          label={label}
          checked={parentState}
          onCheckedChange={toggleAll}
        />
        <div className="ml-6 mt-2 flex flex-col gap-1">
          {items.map((item) => (
            <Checkbox
              key={item}
              label={item}
              checked={checked[item]}
              onCheckedChange={(next) =>
                setChecked((prev) => ({ ...prev, [item]: next === true }))
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

render(<App />);`;

const scope = { Checkbox, useState };

export function LiveCheckboxSnippet() {
  const [code, setCode] = useState(DEFAULT_CODE);
  return (
    <LiveProvider code={code} scope={scope} noInline>
      <div className="grid gap-3 md:grid-cols-2">
        <CodeEditor
          value={code}
          onChange={setCode}
          language="tsx"
          filename="playground.tsx"
          minHeight="220px"
          maxHeight="480px"
        />
        <div className="flex min-h-[220px] flex-col overflow-hidden rounded-md border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Preview ao vivo</span>
            <span className="font-mono normal-case tracking-normal">
              react-live
            </span>
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-center gap-3 p-6">
            <LivePreview />
          </div>
          <LiveError className="m-3 rounded-md border border-destructive/20 bg-destructive/5 p-3 font-mono text-[12px] text-destructive" />
        </div>
      </div>
    </LiveProvider>
  );
}
