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

// ──────────────────────────────────────────────────────────────────
// Padrão — composição básica em dropdown mode
// ──────────────────────────────────────────────────────────────────

export function BasicRow() {
  return (
    <div className="flex items-center justify-center py-6">
      <Menu>
        <MenuTrigger asChild>
          <Button variant="outline">Abrir menu</Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem>Editar</MenuItem>
          <MenuItem>Duplicar</MenuItem>
          <MenuSeparator />
          <MenuItem destructive>Excluir</MenuItem>
        </MenuContent>
      </Menu>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Posicionamento (sides)
// ──────────────────────────────────────────────────────────────────

export function SidesRow() {
  return (
    <div className="grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <div className="flex justify-center" key={side}>
          <Menu>
            <MenuTrigger asChild>
              <Button variant="outline" size="sm">
                side={side}
              </Button>
            </MenuTrigger>
            <MenuContent side={side}>
              <MenuItem>{`Abre para ${side}`}</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Alinhamento (alignments)
// ──────────────────────────────────────────────────────────────────

export function AlignmentsRow() {
  return (
    <div className="flex flex-wrap justify-center gap-4 py-6">
      {(["start", "center", "end"] as const).map((align) => (
        <Menu key={align}>
          <MenuTrigger asChild>
            <Button variant="outline" size="sm">
              align={align}
            </Button>
          </MenuTrigger>
          <MenuContent align={align}>
            <MenuItem>{`Alinha ${align}`}</MenuItem>
          </MenuContent>
        </Menu>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Tamanhos (CVA size ladder)
// ──────────────────────────────────────────────────────────────────

export function SizesRow() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-4 py-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Menu key={size}>
          <MenuTrigger asChild>
            <Button variant="outline" size="sm">
              size={size}
            </Button>
          </MenuTrigger>
          <MenuContent size={size}>
            <MenuItem>Editar</MenuItem>
            <MenuItem>Duplicar</MenuItem>
            <MenuSeparator />
            <MenuItem destructive>Excluir</MenuItem>
          </MenuContent>
        </Menu>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Checkbox + Radio items
// ──────────────────────────────────────────────────────────────────

export function CheckboxRow() {
  return (
    <div className="flex justify-center py-6">
      <Menu>
        <MenuTrigger asChild>
          <Button variant="outline">View options</Button>
        </MenuTrigger>
        <MenuContent>
          <MenuLabel>Layers</MenuLabel>
          <MenuCheckboxItem checked>Mostrar grade</MenuCheckboxItem>
          <MenuCheckboxItem checked>Mostrar guias</MenuCheckboxItem>
          <MenuCheckboxItem>Mostrar régua</MenuCheckboxItem>
        </MenuContent>
      </Menu>
    </div>
  );
}

export function RadioRow() {
  return (
    <div className="flex justify-center py-6">
      <Menu>
        <MenuTrigger asChild>
          <Button variant="outline">Responsável</Button>
        </MenuTrigger>
        <MenuContent>
          <MenuLabel>Designar para</MenuLabel>
          <MenuRadioGroup value="ana">
            <MenuRadioItem value="pedro">Pedro</MenuRadioItem>
            <MenuRadioItem value="ana">Ana</MenuRadioItem>
            <MenuRadioItem value="maria">Maria</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Groups + Labels + Shortcuts
// ──────────────────────────────────────────────────────────────────

export function GroupsRow() {
  return (
    <div className="flex justify-center py-6">
      <Menu>
        <MenuTrigger asChild>
          <Button variant="outline">Arquivo</Button>
        </MenuTrigger>
        <MenuContent>
          <MenuGroup>
            <MenuLabel>Arquivo</MenuLabel>
            <MenuItem>
              Novo <MenuShortcut>⌘N</MenuShortcut>
            </MenuItem>
            <MenuItem>
              Abrir <MenuShortcut>⌘O</MenuShortcut>
            </MenuItem>
            <MenuItem>
              Salvar <MenuShortcut>⌘S</MenuShortcut>
            </MenuItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuGroup>
            <MenuLabel>Editar</MenuLabel>
            <MenuItem>
              Desfazer <MenuShortcut>⌘Z</MenuShortcut>
            </MenuItem>
            <MenuItem disabled>
              Refazer <MenuShortcut>⌘⇧Z</MenuShortcut>
            </MenuItem>
          </MenuGroup>
        </MenuContent>
      </Menu>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Submenu
// ──────────────────────────────────────────────────────────────────

export function SubmenuRow() {
  return (
    <div className="flex justify-center py-6">
      <Menu>
        <MenuTrigger asChild>
          <Button variant="outline">Compartilhar</Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem>Abrir</MenuItem>
          <MenuSub>
            <MenuSubTrigger>Compartilhar via</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>Slack</MenuItem>
              <MenuItem>E-mail</MenuItem>
              <MenuItem>Copiar link</MenuItem>
            </MenuSubContent>
          </MenuSub>
          <MenuSeparator />
          <MenuItem destructive>Excluir</MenuItem>
        </MenuContent>
      </Menu>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Modo contexto (right-click)
// ──────────────────────────────────────────────────────────────────

export function ContextModeRow() {
  return (
    <div className="flex justify-center py-6">
      <Menu mode="context">
        <MenuTrigger asChild>
          <div className="flex h-40 w-72 cursor-context-menu items-center justify-center rounded-md border border-dashed border-border-strong text-sm text-fg-muted">
            Clique com o botão direito aqui dentro
          </div>
        </MenuTrigger>
        <MenuContent>
          <MenuItem>Recortar</MenuItem>
          <MenuItem>Copiar</MenuItem>
          <MenuItem>Colar</MenuItem>
          <MenuSeparator />
          <MenuItem destructive>Remover</MenuItem>
        </MenuContent>
      </Menu>
    </div>
  );
}
