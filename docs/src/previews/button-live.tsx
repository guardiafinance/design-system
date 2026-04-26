import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { CodeEditor } from "@ds/components/code-editor";
import { Button } from "@ds/components/button";
import {
  Save,
  UserPlus,
  ArrowRight,
  Download,
  RefreshCw,
  Trash2,
  Sparkles,
} from "lucide-react";

const DEFAULT_CODE = `<Button variant="default" leadingIcon={<Save />}>
  Salvar
</Button>`;

const scope = {
  Button,
  Save,
  UserPlus,
  ArrowRight,
  Download,
  RefreshCw,
  Trash2,
  Sparkles,
};

export function LiveButtonSnippet() {
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
          <div className="flex flex-1 flex-wrap items-center justify-center gap-3 p-6">
            <LivePreview />
          </div>
          <LiveError className="m-3 rounded-md border border-destructive/20 bg-destructive/5 p-3 font-mono text-[12px] text-destructive" />
        </div>
      </div>
    </LiveProvider>
  );
}
