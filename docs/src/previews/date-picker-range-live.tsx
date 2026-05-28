import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { CodeEditor } from "@ds/components/code-editor";
import { DatePicker } from "@ds/components/date-picker";

const DEFAULT_CODE = `function App() {
  const [range, setRange] = useState(null);

  const span = range
    ? Math.round(
        (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1
    : null;

  const label = range
    ? range.from.toLocaleDateString("pt-BR") +
      " — " +
      range.to.toLocaleDateString("pt-BR") +
      " (" + span + " dia" + (span === 1 ? "" : "s") + ")"
    : "Selecione um intervalo";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 320 }}>
      <DatePicker
        mode="range"
        value={range}
        onChange={setRange}
        placeholder="dd/mm/aaaa — dd/mm/aaaa"
        aria-label="Selecionar intervalo"
      />
      <p style={{ fontSize: 13 }}>{label}</p>
      <button
        type="button"
        onClick={() => setRange(null)}
        disabled={!range}
        style={{
          alignSelf: "flex-start",
          padding: "6px 10px",
          fontSize: 12,
          borderRadius: 6,
          border: "1px solid currentColor",
          background: "transparent",
          cursor: range ? "pointer" : "not-allowed",
          opacity: range ? 1 : 0.5,
        }}
      >
        Reset
      </button>
    </div>
  );
}

render(<App />);`;

const scope = { DatePicker, useState };

export function LiveDateRangeSnippet() {
  const [code, setCode] = useState(DEFAULT_CODE);
  return (
    <LiveProvider code={code} scope={scope} noInline>
      <div className="grid gap-3 md:grid-cols-2">
        <CodeEditor
          value={code}
          onChange={setCode}
          language="tsx"
          filename="playground.tsx"
          minHeight="280px"
          maxHeight="520px"
        />
        <div className="flex min-h-[280px] flex-col overflow-hidden rounded-md border border-border bg-background">
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
