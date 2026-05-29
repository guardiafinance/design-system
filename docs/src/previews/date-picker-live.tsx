import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { CodeEditor } from "@ds/components/code-editor";
import { DatePicker } from "@ds/components/date-picker";

/* Upgraded post Plan #220 to the noInline + useState interactive pattern
   used by LiveCheckboxSnippet (PR #217). The controlled state lets users
   experiment with the trigger behavior (clear, today, controlled vs
   uncontrolled) in the playground, mirroring real consumer code. */

const DEFAULT_CODE = `function App() {
  const [date, setDate] = useState(new Date(2025, 2, 15));

  const label = date
    ? "Selecionado: " + date.toLocaleDateString("pt-BR")
    : "Nenhuma data selecionada";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 320 }}>
      <DatePicker
        value={date}
        onChange={setDate}
        placeholder="dd/mm/aaaa"
        clearable
      />
      <p style={{ fontSize: 13 }}>{label}</p>
      <button
        type="button"
        onClick={() => setDate(null)}
        disabled={!date}
        style={{
          alignSelf: "flex-start",
          padding: "6px 10px",
          fontSize: 12,
          borderRadius: 6,
          border: "1px solid currentColor",
          background: "transparent",
          cursor: date ? "pointer" : "not-allowed",
          opacity: date ? 1 : 0.5,
        }}
      >
        Reset
      </button>
    </div>
  );
}

render(<App />);`;

const scope = { DatePicker, useState };

export function LiveDatePickerSnippet() {
  const [code, setCode] = useState(DEFAULT_CODE);
  return (
    <LiveProvider code={code} scope={scope} noInline>
      <div className="grid gap-3 md:grid-cols-2">
        <CodeEditor
          value={code}
          onChange={setCode}
          language="tsx"
          filename="playground.tsx"
          minHeight="260px"
          maxHeight="480px"
        />
        <div className="flex min-h-[260px] flex-col overflow-hidden rounded-md border border-border bg-background">
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
