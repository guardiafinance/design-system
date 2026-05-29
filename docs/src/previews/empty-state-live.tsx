import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";

import { EmptyState } from "@ds/components/empty-state";
import { Button } from "@ds/components/button";
import { CodeEditor } from "@ds/components/code-editor";

function InboxIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" />
      <path d="M3 12h6l2 3h2l2-3h6" />
      <path d="M3 12v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}

const DEFAULT_CODE = `<EmptyState>
  <EmptyState.Icon>
    <InboxIcon />
  </EmptyState.Icon>
  <EmptyState.Title>Nenhum lançamento</EmptyState.Title>
  <EmptyState.Description>
    Conecte um banco para começar a conciliar.
  </EmptyState.Description>
  <EmptyState.Actions>
    <Button>Conectar banco</Button>
    <Button variant="outline">Importar CSV</Button>
  </EmptyState.Actions>
</EmptyState>`;

const scope = { EmptyState, Button, InboxIcon, useState };

export function LiveEmptyStateSnippet() {
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
          maxHeight="520px"
        />
        <div className="flex min-h-[320px] flex-col overflow-hidden rounded-md border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Preview ao vivo</span>
            <span className="font-mono normal-case tracking-normal">
              react-live
            </span>
          </div>
          <div className="flex flex-1 items-center justify-center p-6">
            <LivePreview />
          </div>
          <LiveError className="m-3 rounded-md border border-destructive/20 bg-destructive/5 p-3 font-mono text-[12px] text-destructive" />
        </div>
      </div>
    </LiveProvider>
  );
}
