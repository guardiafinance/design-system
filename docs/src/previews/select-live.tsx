import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { CodeEditor } from "@ds/components/code-editor";
import { Select } from "@ds/components/select";

const DEFAULT_CODE = `<div style={{ width: 280 }}>
  <Select
    options={[
      { value: "starter", label: "Starter" },
      { value: "pro", label: "Pro" },
      { value: "enterprise", label: "Enterprise" },
    ]}
    placeholder="Selecione um plano"
  />
</div>`;

const scope = { Select };

export function LiveSelectSnippet() {
  const [code, setCode] = useState(DEFAULT_CODE);
  return (
    <LiveProvider code={code} scope={scope}>
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
          <div className="flex flex-1 items-start justify-center p-6">
            <LivePreview />
          </div>
          <LiveError className="m-3 rounded-md border border-destructive/20 bg-destructive/5 p-3 font-mono text-[12px] text-destructive" />
        </div>
      </div>
    </LiveProvider>
  );
}
