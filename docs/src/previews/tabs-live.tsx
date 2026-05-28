import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { CodeEditor } from "@ds/components/code-editor";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsBadge,
} from "@ds/components/tabs";

const DEFAULT_CODE = `function App() {
  const [tab, setTab] = useState("lanc");
  const counts = { lanc: 248, extr: 0, conf: 3 };

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList>
        <TabsTrigger value="lanc">
          Lançamentos <TabsBadge>{counts.lanc}</TabsBadge>
        </TabsTrigger>
        <TabsTrigger value="extr">Extratos</TabsTrigger>
        <TabsTrigger value="conf">
          Configurações
          {counts.conf > 0 ? <TabsBadge>{counts.conf}</TabsBadge> : null}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="lanc">
        <div className="mt-2 rounded-md border border-border p-4 text-sm">
          <p className="font-medium text-foreground">
            {counts.lanc} lançamentos em abril
          </p>
        </div>
      </TabsContent>
      <TabsContent value="extr">
        <div className="mt-2 rounded-md border border-border p-4 text-sm">
          <p className="font-medium text-foreground">Sem extratos no período.</p>
        </div>
      </TabsContent>
      <TabsContent value="conf">
        <div className="mt-2 rounded-md border border-border p-4 text-sm">
          <p className="font-medium text-foreground">3 ajustes pendentes.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}

render(<App />);`;

const scope = {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsBadge,
  useState,
};

export function LiveTabsSnippet() {
  const [code, setCode] = useState(DEFAULT_CODE);
  return (
    <LiveProvider code={code} scope={scope} noInline>
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
          <div className="flex flex-1 flex-col gap-3 p-6">
            <LivePreview />
          </div>
          <LiveError className="m-3 rounded-md border border-destructive/20 bg-destructive/5 p-3 font-mono text-[12px] text-destructive" />
        </div>
      </div>
    </LiveProvider>
  );
}
