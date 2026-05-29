"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/dialog";
import { cn } from "@/lib/utils";

/**
 * Command — paleta de comandos (⌘K) com search + grupos + entries
 * keyboard-navegáveis.
 *
 * Para acesso rápido a ações conhecidas (navegar, criar, mudar
 * contexto, executar). Complementar ao chat com Isac: o chat absorve
 * intenção em linguagem natural; Command absorve intenção em ação
 * conhecida acelerada por teclado. Para confirmação modal bloqueante
 * prefira `<Dialog>` / `<AlertDialog>`; para conteúdo ancorado ao
 * trigger, `<Popover>` ou `<Menu>`.
 *
 * Base:
 *   `cmdk` (motor da paleta — filter heurístico, ARIA roles, keyboard
 *   navigation acessível) hospedado em `<Dialog>` (ADR-010 — overlay,
 *   focus trap, ESC, portal). Esta wrapper adiciona:
 *   - API imperativa canônica `<CommandPalette open onOpenChange items
 *     placeholder emptyText />` — paridade direta com a referência
 *     legacy em `ux_references/ui_kits/components/Command/`.
 *   - Primitivas declarativas re-exportadas (`Command`, `CommandInput`,
 *     `CommandList`, `CommandGroup`, `CommandItem`, `CommandSeparator`,
 *     `CommandEmpty`, `CommandShortcut`) para composição avançada
 *     (sugestões AI streaming do Isac, paleta inline, etc.).
 *   - Tokens semânticos canônicos (`--popover`, `--accent`, `--border`,
 *     `--fg-muted`) — sem expansão de tokens, sem cores hardcoded.
 *   - Mapeamento ARIA delegado: `combobox` no input, `listbox` na list,
 *     `option` em cada item — vêm de cmdk; `role="dialog"` +
 *     `aria-modal` vêm de Radix Dialog; `aria-label` no input via
 *     wrapper para garantir compliance com lex-frontend-accessibility
 *     Rule 4.1.
 *
 * Decisões registradas em
 * `docs/adr/ADR-017-command-v0.1.0-dod-migration.md`.
 *
 * Public surface (9 componentes + 3 tipos):
 *   CommandPalette, Command, CommandInput, CommandList, CommandGroup,
 *   CommandItem, CommandSeparator, CommandEmpty, CommandShortcut
 *   CommandPaletteProps, CommandPaletteGroup, CommandPaletteEntry
 */

// ──────────────────────────────────────────────────────────────────
// Primitivas declarativas — re-exports tokenizados de cmdk
// ──────────────────────────────────────────────────────────────────

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md",
      "bg-popover text-popover-foreground",
      className,
    )}
    {...props}
  />
));
Command.displayName = "Command";

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center gap-2 border-b border-border px-3 py-3">
    <Search className="h-4 w-4 shrink-0 text-fg-muted" aria-hidden="true" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-md bg-transparent py-2 text-sm outline-none",
        "placeholder:text-fg-muted",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
    <kbd
      aria-hidden="true"
      className={cn(
        "pointer-events-none hidden select-none items-center gap-1 rounded border border-border bg-bg-hover px-1.5",
        "font-mono text-[10px] font-semibold text-fg-muted sm:inline-flex",
      )}
    >
      ESC
    </kbd>
  </div>
));
CommandInput.displayName = "CommandInput";

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn(
      "max-h-[400px] overflow-y-auto overflow-x-hidden p-1",
      className,
    )}
    {...props}
  />
));
CommandList.displayName = "CommandList";

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={cn(
      "py-6 text-center text-sm text-fg-muted",
      className,
    )}
    {...props}
  />
));
CommandEmpty.displayName = "CommandEmpty";

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-popover-foreground",
      "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5",
      "[&_[cmdk-group-heading]]:text-[10.5px] [&_[cmdk-group-heading]]:font-bold",
      "[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.06em]",
      "[&_[cmdk-group-heading]]:text-fg-muted",
      className,
    )}
    {...props}
  />
));
CommandGroup.displayName = "CommandGroup";

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
));
CommandSeparator.displayName = "CommandSeparator";

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
      "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
      "[&_svg]:size-4 [&_svg]:shrink-0",
      className,
    )}
    {...props}
  />
));
CommandItem.displayName = "CommandItem";

function CommandShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>): React.ReactElement {
  // Kbd-style chip com chain semântico `--accent` / `--accent-foreground`:
  //   light → violet-500 + #FFFFFF (7.85:1 AAA) — "branco Guardia" sobre
  //           violeta canônico.
  //   dark  → orange-500 + mono-black (6.2:1 AA) — paridade com Button
  //           action no tema escuro, onde white-on-orange falha contraste
  //           (lex-brand-colors).
  // Resolve a queixa de a11y do tema light, onde `text-fg-muted` se
  // confunde com o label sob o eye-test.
  return (
    <span
      className={cn(
        "ml-auto inline-flex items-center rounded-md px-1.5 py-0.5",
        "bg-accent text-accent-foreground",
        "text-[10px] font-mono font-semibold tracking-wider",
        className,
      )}
      {...props}
    />
  );
}
CommandShortcut.displayName = "CommandShortcut";

// ──────────────────────────────────────────────────────────────────
// Imperative API — paridade com a referência legacy
// ──────────────────────────────────────────────────────────────────

export interface CommandPaletteEntry {
  /** Identificador estável usado pelo cmdk para o item e como `key` no render. */
  id: string;
  /** Conteúdo principal da entry — string ou ReactNode. */
  label: React.ReactNode;
  /** Texto secundário renderizado abaixo do label. */
  description?: React.ReactNode;
  /** Ícone à esquerda do label (qualquer ReactNode — recomenda-se lucide). */
  icon?: React.ReactNode;
  /** Atalho de teclado renderizado à direita (e.g. `"⌘K"`, `"⇧⌘P"`). */
  shortcut?: string;
  /** Termos extras para o filter heurístico (ex.: sinônimos, traduções). */
  keywords?: string;
  /** Callback disparado ao selecionar a entry. A paleta fecha em seguida. */
  onSelect?: () => void;
  /** Entry visível mas não selecionável. */
  disabled?: boolean;
}

export interface CommandPaletteGroup {
  /** Identificador estável usado como `key` no render. */
  id: string;
  /** Heading visível acima do grupo (uppercase, monospace ladder). */
  heading: React.ReactNode;
  entries: CommandPaletteEntry[];
}

export interface CommandPaletteProps {
  /** Controla a visibilidade da paleta. */
  open: boolean;
  /** Callback de mudança — chamado pelo Dialog (ESC, click fora) e após `onSelect`. */
  onOpenChange: (open: boolean) => void;
  /** Grupos de entries renderizados na lista. */
  items: CommandPaletteGroup[];
  /** Placeholder do input de busca. Default `"Buscar comando…"`. */
  placeholder?: string;
  /** Texto exibido quando o filter retorna zero entries. Default `"Nenhum resultado"`. */
  emptyText?: React.ReactNode;
  /**
   * Label semântica do dialog para tecnologias assistivas. Default
   * `"Paleta de comandos"`. Renderizada via `DialogTitle` com
   * `sr-only` para preservar o visual minimalista da paleta.
   */
  ariaLabel?: string;
  /**
   * Descrição semântica do dialog (opcional). Quando presente, é
   * renderizada via `DialogDescription` com `sr-only`.
   */
  ariaDescription?: string;
  /**
   * Override do filter heurístico do cmdk. Recebe `value` (label
   * concatenado com keywords) e `search`; retorna 0 (não match) a 1
   * (match perfeito). Default é o filter nativo do cmdk.
   */
  filter?: (value: string, search: string) => number;
}

/**
 * `<CommandPalette>` — superfície imperativa canônica que monta
 * Dialog + Command + items mapping. Paridade com a referência legacy
 * `<Command open onClose items={...} />`.
 *
 * Para casos avançados (paleta inline sem Dialog, sugestões streaming,
 * renderer custom), use as primitivas declarativas re-exportadas.
 */
function CommandPalette({
  open,
  onOpenChange,
  items,
  placeholder = "Buscar comando…",
  emptyText = "Nenhum resultado",
  ariaLabel = "Paleta de comandos",
  ariaDescription,
  filter,
}: CommandPaletteProps): React.ReactElement {
  const handleSelect = React.useCallback(
    (entry: CommandPaletteEntry) => {
      if (entry.disabled) return;
      entry.onSelect?.();
      onOpenChange(false);
    },
    [onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        width={580}
        className={cn(
          "overflow-hidden p-0",
          // Hide the canonical Dialog close button — the paleta uses
          // an `ESC` kbd hint in the input row instead, paridade with
          // the legacy reference.
          "[&>button[aria-label='Close']]:hidden",
        )}
      >
        <DialogTitle className="sr-only">{ariaLabel}</DialogTitle>
        {ariaDescription ? (
          <DialogDescription className="sr-only">
            {ariaDescription}
          </DialogDescription>
        ) : null}
        <Command filter={filter}>
          <CommandInput placeholder={placeholder} aria-label={ariaLabel} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {items.map((group) => (
              <CommandGroup key={group.id} heading={group.heading}>
                {group.entries.map((entry) => (
                  <CommandItem
                    key={entry.id}
                    value={[
                      typeof entry.label === "string" ? entry.label : entry.id,
                      typeof entry.description === "string"
                        ? entry.description
                        : "",
                      entry.keywords ?? "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    disabled={entry.disabled}
                    onSelect={() => handleSelect(entry)}
                  >
                    {entry.icon ? (
                      <span className="text-fg-muted" aria-hidden="true">
                        {entry.icon}
                      </span>
                    ) : null}
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium">{entry.label}</span>
                      {entry.description ? (
                        <span className="truncate text-xs text-fg-muted">
                          {entry.description}
                        </span>
                      ) : null}
                    </span>
                    {entry.shortcut ? (
                      <CommandShortcut>{entry.shortcut}</CommandShortcut>
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
CommandPalette.displayName = "CommandPalette";

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export {
  CommandPalette,
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandEmpty,
  CommandShortcut,
};

export { formatShortcut } from "./format-shortcut";
export type { FormatShortcutOptions } from "./format-shortcut";
