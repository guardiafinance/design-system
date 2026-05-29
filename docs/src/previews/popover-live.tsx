import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";

import {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@ds/components/popover";
import { Button } from "@ds/components/button";
import { CodeEditor } from "@ds/components/code-editor";

const DEFAULT_CODE = `<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Abrir popover</Button>
  </PopoverTrigger>
  <PopoverContent size="md">
    <div className="grid gap-2">
      <h4 className="text-sm font-medium text-fg">Filtro</h4>
      <p className="text-[13px] text-fg-muted">
        Conteúdo curto, ancorado ao trigger.
      </p>
      <PopoverClose asChild>
        <Button variant="outline" size="sm">Fechar</Button>
      </PopoverClose>
    </div>
  </PopoverContent>
</Popover>`;

const scope = {
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverContent,
  PopoverClose,
  Button,
};

export function LivePopoverSnippet() {
  const [code, setCode] = useState(DEFAULT_CODE);
  return (
    <LiveProvider code={code} scope={scope}>
      <div className="grid gap-3 md:grid-cols-2">
        <CodeEditor
          value={code}
          onChange={setCode}
          language="tsx"
          filename="playground.tsx"
          minHeight="240px"
          maxHeight="480px"
        />
        <div className="flex min-h-[260px] flex-col overflow-hidden rounded-md border border-border bg-background">
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
