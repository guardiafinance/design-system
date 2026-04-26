import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { CodeEditor } from "@ds/components/code-editor";
import { FileUpload } from "@ds/components/file-upload";

const DEFAULT_CODE = `<FileUpload
  multiple
  accept=".pdf,.png,.jpg"
  hint="PDF/PNG/JPG · até 10 MB"
  files={[
    { name: "extrato.pdf", size: 425000, status: "done" },
    { name: "comprovante.png", size: 120000, status: "uploading", progress: 60 },
  ]}
  onRemove={() => {}}
/>`;

const scope = { FileUpload };

export function LiveFileUploadSnippet() {
  const [code, setCode] = useState(DEFAULT_CODE);
  return (
    <LiveProvider code={code} scope={scope}>
      <div className="grid gap-3 md:grid-cols-2">
        <CodeEditor
          value={code}
          onChange={setCode}
          language="tsx"
          filename="playground.tsx"
          minHeight="280px"
          maxHeight="540px"
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
