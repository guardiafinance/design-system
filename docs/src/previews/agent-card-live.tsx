import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { ArrowLeftRight } from "lucide-react";
import { CodeEditor } from "@ds/components/code-editor";
import { AgentCard } from "@ds/components/agent-card";

const DEFAULT_CODE = `<AgentCard accent="violet" status="active" variant="elevated" className="w-80">
  <AgentCard.Header>
    <AgentCard.Avatar icon={<ArrowLeftRight aria-hidden />} />
    <div>
      <AgentCard.Name>Bia</AgentCard.Name>
      <AgentCard.Role>Conciliação Bancária</AgentCard.Role>
    </div>
    <AgentCard.Status label="Conciliando" />
  </AgentCard.Header>
  <AgentCard.Metrics>
    <AgentCard.Metric label="conciliado hoje" value="248" />
    <AgentCard.Metric label="taxa match" value="97%" />
    <AgentCard.Metric label="pendentes" value="3" />
  </AgentCard.Metrics>
  <AgentCard.Footer>
    <AgentCard.LastRun>há 2 min</AgentCard.LastRun>
  </AgentCard.Footer>
</AgentCard>`;

const scope = { AgentCard, ArrowLeftRight };

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
          minHeight="320px"
          maxHeight="560px"
        />
        <div className="flex min-h-[320px] flex-col overflow-hidden rounded-md border border-border bg-background">
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
