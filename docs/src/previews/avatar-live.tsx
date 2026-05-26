import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { CodeEditor } from "@ds/components/code-editor";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarStatus,
  initials,
} from "@ds/components/avatar";

const DEFAULT_CODE = `<Avatar size="lg">
  <AvatarImage
    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop"
    alt="Fernando"
  />
  <AvatarFallback color="purple">
    {initials("Fernando Seguim")}
  </AvatarFallback>
  <AvatarStatus status="online" />
</Avatar>`;

const scope = {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarStatus,
  initials,
};

export function LiveAvatarSnippet() {
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
