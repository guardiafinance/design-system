import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { CodeEditor } from "@ds/components/code-editor";
import { Switch } from "@ds/components/switch";

const DEFAULT_CODE = `function Preferencias() {
  const [auto, setAuto] = useState(true);
  const [resumo, setResumo] = useState(false);

  return (
    <div className="flex flex-col gap-3" style={{ width: 360 }}>
      <Switch
        label="Autopilot de conciliacao"
        description={"Matches com confianca > 95% sao aprovados sem revisao"}
        checked={auto}
        onCheckedChange={setAuto}
      />
      <Switch
        label="Resumo diario as 18h"
        description={resumo ? "ativo" : "inativo"}
        checked={resumo}
        onCheckedChange={setResumo}
      />
    </div>
  );
}

render(<Preferencias />);`;

const scope = { Switch, useState };

export function LiveSwitchSnippet() {
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
