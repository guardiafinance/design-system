import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";

import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuGroup,
  MenuLabel,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
} from "@ds/components/menu";
import { Button } from "@ds/components/button";
import { CodeEditor } from "@ds/components/code-editor";

const DEFAULT_CODE = `<Menu>
  <MenuTrigger asChild>
    <Button variant="outline">Abrir menu</Button>
  </MenuTrigger>
  <MenuContent size="md">
    <MenuLabel>Ações</MenuLabel>
    <MenuItem>
      Editar <MenuShortcut>⌘E</MenuShortcut>
    </MenuItem>
    <MenuItem>Duplicar</MenuItem>
    <MenuSeparator />
    <MenuItem destructive>Excluir</MenuItem>
  </MenuContent>
</Menu>`;

const scope = {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuGroup,
  MenuLabel,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
  Button,
};

export function LiveMenuSnippet() {
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
