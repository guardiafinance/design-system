import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";

import { CodeEditor } from "@ds/components/code-editor";
import { ChatMessage } from "@ds/components/chat-message";
import { Avatar, AvatarFallback } from "@ds/components/avatar";
import { IconButton } from "@ds/components/icon-button";

const DEFAULT_CODE = `function Demo() {
  return (
    <ChatMessage variant="assistant" status="sent">
      <ChatMessage.Avatar>
        <Avatar size="sm"><AvatarFallback color="purple">IS</AvatarFallback></Avatar>
      </ChatMessage.Avatar>
      <ChatMessage.Bubble>
        <ChatMessage.Header>
          <ChatMessage.Author>Isac</ChatMessage.Author>
          <ChatMessage.Time dateTime="2026-05-27T14:32:00Z">14:32</ChatMessage.Time>
        </ChatMessage.Header>
        <ChatMessage.Content>
          Conciliei 127 lançamentos. Restam 3 exceções.
        </ChatMessage.Content>
        <ChatMessage.Actions>
          <IconButton aria-label="Copiar" size="sm" variant="ghost">⧉</IconButton>
        </ChatMessage.Actions>
      </ChatMessage.Bubble>
    </ChatMessage>
  );
}

render(<Demo />);`;

const scope = { ChatMessage, Avatar, AvatarFallback, IconButton, useState };

export function LiveChatMessageSnippet() {
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
