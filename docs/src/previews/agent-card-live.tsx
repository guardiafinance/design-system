import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { CodeEditor } from "@ds/components/code-editor";
import { AgentCard } from "@ds/components/agent-card";

const DEFAULT_CODE = `<AgentCard status="working" variant="elevated" className="w-80">
  <AgentCard.Header>
    <AgentCard.Avatar name="Isac" />
    <div>
      <AgentCard.Name>Isac</AgentCard.Name>
      <AgentCard.Role>Assistente contábil</AgentCard.Role>
    </div>
    <AgentCard.Status />
  </AgentCard.Header>
  <AgentCard.Description>
    Concilia lançamentos e audita movimentações.
  </AgentCard.Description>
  <AgentCard.Capabilities>
    <AgentCard.Capability>Conciliação</AgentCard.Capability>
    <AgentCard.Capability>Auditoria</AgentCard.Capability>
  </AgentCard.Capabilities>
</AgentCard>`;

const scope = { AgentCard };

export function LiveAgentCardSnippet() {
  const [code, setCode] = useState(DEFAULT_CODE);
  return (
    <LiveProvider code={code} scope={scope}>
      <div className="grid gap-3 md:grid-cols-2">
        <CodeEditor
          value={code}
          onChange={setCode}
          language="tsx"
          filename="playground.tsx"
          minHeight="260px"
          maxHeight="520px"
        />
        <div className="flex min-h-[260px] flex-col overflow-hidden rounded-md border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Preview ao vivo</span>
            <span className="font-mono normal-case tracking-normal">
              react-live
            </span>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-3 p-6">
            <LivePreview />
          </div>
          <LiveError className="m-3 rounded-md border border-destructive/20 bg-destructive/5 p-3 font-mono text-[12px] text-destructive" />
        </div>
      </div>
    </LiveProvider>
  );
}
