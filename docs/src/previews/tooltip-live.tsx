import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ds/components/tooltip";
import { Button } from "@ds/components/button";
import { CodeEditor } from "@ds/components/code-editor";

const DEFAULT_CODE = `<Tooltip delayDuration={200}>
  <TooltipTrigger asChild>
    <Button variant="outline">Passe o mouse</Button>
  </TooltipTrigger>
  <TooltipContent size="md">
    <p>Atalho contextual.</p>
  </TooltipContent>
</Tooltip>`;

const scope = {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Button,
};

export function LiveTooltipSnippet() {
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
