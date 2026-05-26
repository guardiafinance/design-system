import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";

import { CodeEditor } from "@ds/components/code-editor";
import { Card } from "@ds/components/card";
import { Badge } from "@ds/components/badge";
import { Button } from "@ds/components/button";

const DEFAULT_CODE = `function Demo() {
  return (
    <Card variant="elevated" className="w-[360px]">
      <Card.Header>
        <Card.Title>NF-e #4720</Card.Title>
        <Card.Description>Fornecedor A · 12/01/2026</Card.Description>
      </Card.Header>
      <Card.Content>
        <Badge variant="warning">Pendente</Badge>
      </Card.Content>
      <Card.Footer className="justify-end gap-2">
        <Button variant="outline">Rejeitar</Button>
        <Button>Conciliar</Button>
      </Card.Footer>
    </Card>
  );
}

render(<Demo />);`;

const scope = { Card, Badge, Button, useState };

export function LiveCardSnippet() {
  const [code, setCode] = useState(DEFAULT_CODE);
  return (
    <LiveProvider code={code} scope={scope} noInline>
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
