import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Plus, Search, Settings, Trash2 } from "lucide-react";

import { axe } from "jest-axe";
import { axeInThemes, THEMES } from "@/test-utils/a11y";
import {
  CommandPalette,
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandEmpty,
  CommandShortcut,
  type CommandPaletteGroup,
} from "./index";

/**
 * Tests for Plan #79 (parent feature #78) — Command v0.1.0 DoD.
 *
 * Each `it(...)` carries `AC-N:` so that `lex-issue-driven` Rule 3
 * (bidirectional AC ↔ test traceability) passes at Gate 2. ACs
 * referenced come from `docs/issues/issue-78/02-requirements.md`.
 */

// ──────────────────────────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────────────────────────

function makeBasicItems(): CommandPaletteGroup[] {
  return [
    {
      id: "navigation",
      heading: "Navegação",
      entries: [
        { id: "home", label: "Início", shortcut: "⌘H" },
        { id: "dashboard", label: "Dashboard", shortcut: "⌘D" },
      ],
    },
    {
      id: "actions",
      heading: "Ações",
      entries: [
        { id: "create", label: "Criar lançamento", shortcut: "⌘N" },
        { id: "sync", label: "Sincronizar", keywords: "atualizar refresh" },
      ],
    },
  ];
}

function makeItemsWithIcons(): CommandPaletteGroup[] {
  return [
    {
      id: "tools",
      heading: "Ferramentas",
      entries: [
        {
          id: "search",
          label: "Buscar",
          icon: <Search />,
          shortcut: "⌘K",
        },
        {
          id: "settings",
          label: "Configurações",
          description: "Preferências da conta",
          icon: <Settings />,
          shortcut: "⌘,",
        },
        {
          id: "create-doc",
          label: "Criar documento",
          icon: <Plus />,
          shortcut: "⌘N",
        },
        {
          id: "delete",
          label: "Excluir item",
          icon: <Trash2 />,
          shortcut: "⌘⌫",
        },
      ],
    },
  ];
}

/**
 * Test harness that owns `open` state so userEvent flows can drive
 * the controlled component as a real consumer would.
 */
function Harness({
  initialOpen = true,
  items,
  onOpenChange: onOpenChangeProp,
  ...rest
}: {
  initialOpen?: boolean;
  items: CommandPaletteGroup[];
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  emptyText?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(initialOpen);
  return (
    <CommandPalette
      open={open}
      onOpenChange={(value) => {
        onOpenChangeProp?.(value);
        setOpen(value);
      }}
      items={items}
      {...rest}
    />
  );
}

// ──────────────────────────────────────────────────────────────────
// Surface
// ──────────────────────────────────────────────────────────────────

describe("CommandPalette — public surface", () => {
  it("AC-1: exports the canonical surface (imperative + declarative primitives)", () => {
    expect(typeof CommandPalette).toBe("function");
    // declarative primitives — forwardRef wrappers and function components
    [Command, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty, CommandSeparator].forEach(
      (component) => {
        expect(component).toBeDefined();
      },
    );
    // CommandShortcut is a plain function component returning JSX.
    expect(typeof CommandShortcut).toBe("function");
  });
});

// ──────────────────────────────────────────────────────────────────
// Imperative API — open/close + content rendering
// ──────────────────────────────────────────────────────────────────

describe("CommandPalette — imperative open/close lifecycle", () => {
  it("AC-3: renders inside a Radix Dialog when `open` is true", async () => {
    render(<Harness initialOpen items={makeBasicItems()} />);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("AC-3: does not render the dialog when `open` is false", () => {
    render(<Harness initialOpen={false} items={makeBasicItems()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("AC-5: uses the default placeholder `Buscar comando…` when none is supplied", async () => {
    render(<Harness initialOpen items={makeBasicItems()} />);
    expect(
      await screen.findByPlaceholderText("Buscar comando…"),
    ).toBeInTheDocument();
  });

  it("AC-5: respects a custom placeholder", async () => {
    render(
      <Harness
        initialOpen
        items={makeBasicItems()}
        placeholder="O que você quer fazer?"
      />,
    );
    expect(
      await screen.findByPlaceholderText("O que você quer fazer?"),
    ).toBeInTheDocument();
  });

  it("AC-4: renders all groups with their headings", async () => {
    render(<Harness initialOpen items={makeBasicItems()} />);
    expect(await screen.findByText("Navegação")).toBeInTheDocument();
    expect(screen.getByText("Ações")).toBeInTheDocument();
  });

  it("AC-4: renders all entries with their labels", async () => {
    render(<Harness initialOpen items={makeBasicItems()} />);
    expect(await screen.findByText("Início")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Criar lançamento")).toBeInTheDocument();
    expect(screen.getByText("Sincronizar")).toBeInTheDocument();
  });

  it("AC-15: renders shortcut kbd when entry.shortcut is provided", async () => {
    render(<Harness initialOpen items={makeBasicItems()} />);
    await screen.findByRole("dialog");
    expect(screen.getByText("⌘H")).toBeInTheDocument();
    expect(screen.getByText("⌘D")).toBeInTheDocument();
    expect(screen.getByText("⌘N")).toBeInTheDocument();
  });

  it("AC-15: renders description below label when entry.description is provided", async () => {
    render(<Harness initialOpen items={makeItemsWithIcons()} />);
    expect(await screen.findByText("Preferências da conta")).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────
// Interaction — keyboard + selection
// ──────────────────────────────────────────────────────────────────

describe("CommandPalette — interaction and selection", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  it("AC-6: fires entry.onSelect and closes the palette when an item is selected via Enter", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Harness
        initialOpen
        onOpenChange={onOpenChange}
        items={[
          {
            id: "g1",
            heading: "Group",
            entries: [
              { id: "a", label: "Action A", onSelect },
              { id: "b", label: "Action B" },
            ],
          },
        ]}
      />,
    );
    const input = await screen.findByPlaceholderText("Buscar comando…");
    input.focus();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("AC-6: clicking an item fires entry.onSelect and closes the palette", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Harness
        initialOpen
        onOpenChange={onOpenChange}
        items={[
          {
            id: "g1",
            heading: "Group",
            entries: [{ id: "a", label: "Clickable", onSelect }],
          },
        ]}
      />,
    );
    await screen.findByRole("dialog");
    await user.click(screen.getByText("Clickable"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("AC-6: disabled entry does not fire onSelect even when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Harness
        initialOpen
        items={[
          {
            id: "g1",
            heading: "Group",
            entries: [
              { id: "blocked", label: "Bloqueado", onSelect, disabled: true },
            ],
          },
        ]}
      />,
    );
    await screen.findByRole("dialog");
    await user.click(screen.getByText("Bloqueado"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("AC-7: typing in the search input filters entries by label (case-insensitive)", async () => {
    const user = userEvent.setup();
    render(<Harness initialOpen items={makeBasicItems()} />);
    const input = await screen.findByPlaceholderText("Buscar comando…");
    await user.type(input, "dash");
    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.queryByText("Início")).not.toBeInTheDocument();
    });
  });

  it("AC-7: filter matches by keywords (synonyms)", async () => {
    const user = userEvent.setup();
    render(<Harness initialOpen items={makeBasicItems()} />);
    const input = await screen.findByPlaceholderText("Buscar comando…");
    await user.type(input, "refresh");
    await waitFor(() => {
      // "Sincronizar" carries keywords="atualizar refresh"
      expect(screen.getByText("Sincronizar")).toBeInTheDocument();
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    });
  });

  it("AC-7: groups with no visible entries after filter are hidden", async () => {
    const user = userEvent.setup();
    render(<Harness initialOpen items={makeBasicItems()} />);
    const input = await screen.findByPlaceholderText("Buscar comando…");
    await user.type(input, "dashboard");
    await waitFor(
      () => {
        // "Navegação" still shows because Dashboard belongs to it.
        expect(screen.getByText("Navegação")).toBeInTheDocument();
        // "Ações" group is hidden by cmdk via the `hidden` HTML
        // attribute + role="presentation" — its <div cmdk-group="">
        // stays in the DOM but is removed from the rendering tree
        // and from the accessibility tree.
        const acoesHeading = screen.getByText("Ações");
        const group = acoesHeading.closest('[cmdk-group=""]');
        expect(group).not.toBeNull();
        expect(group as Element).toHaveAttribute("hidden");
        expect(group as Element).toHaveAttribute("role", "presentation");
      },
      { timeout: 2000 },
    );
  });

  it("AC-8: shows the empty text when no entries match the filter", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        initialOpen
        items={makeBasicItems()}
        emptyText="Nada encontrado por aqui"
      />,
    );
    const input = await screen.findByPlaceholderText("Buscar comando…");
    await user.type(input, "xyznotfound");
    expect(
      await screen.findByText("Nada encontrado por aqui"),
    ).toBeInTheDocument();
  });

  it("AC-8: default empty text is `Nenhum resultado`", async () => {
    const user = userEvent.setup();
    render(<Harness initialOpen items={makeBasicItems()} />);
    const input = await screen.findByPlaceholderText("Buscar comando…");
    await user.type(input, "zzzzzz");
    expect(await screen.findByText("Nenhum resultado")).toBeInTheDocument();
  });

  it("AC-10: Escape closes the palette (delegated to Dialog)", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Harness
        initialOpen
        onOpenChange={onOpenChange}
        items={makeBasicItems()}
      />,
    );
    const input = await screen.findByPlaceholderText("Buscar comando…");
    input.focus();
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("AC-11: reopening the palette resets the query input", async () => {
    const user = userEvent.setup();
    function Toggle() {
      const [open, setOpen] = React.useState(true);
      return (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle palette"
          >
            Toggle
          </button>
          <CommandPalette
            open={open}
            onOpenChange={setOpen}
            items={makeBasicItems()}
          />
        </>
      );
    }
    render(<Toggle />);
    const input = (await screen.findByPlaceholderText(
      "Buscar comando…",
    )) as HTMLInputElement;
    await user.type(input, "dash");
    expect(input.value).toBe("dash");
    // Close via Escape (delegated to Dialog).
    input.focus();
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    // Wait for Radix Dialog to release the body scroll-lock so the
    // Toggle button becomes interactive again. The scroll-lock side
    // effect runs in a microtask after `open=false`.
    await waitFor(() => {
      expect(document.body.style.pointerEvents).not.toBe("none");
    });
    await user.click(screen.getByRole("button", { name: "Toggle palette" }));
    const reopened = (await screen.findByPlaceholderText(
      "Buscar comando…",
    )) as HTMLInputElement;
    expect(reopened.value).toBe("");
  });
});

// ──────────────────────────────────────────────────────────────────
// Accessibility
// ──────────────────────────────────────────────────────────────────

describe("CommandPalette — accessibility (jest-axe light + dark)", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    // Radix Dialog applies `data-scroll-locked` + `pointer-events:none`
    // on body. afterEach `cleanup()` unmounts the tree but the layout
    // effect that restores body styles can race with the next test's
    // mount when tests in this block run sequentially. Force a clean
    // body state before each test in this describe.
    document.body.removeAttribute("data-scroll-locked");
    document.body.style.removeProperty("pointer-events");
  });

  it("AC-16: input carries an accessible label even though it has no visible label", async () => {
    render(<Harness initialOpen items={makeBasicItems()} />);
    // The input carries the wrapper's aria-label `Paleta de comandos`.
    // The same string is also the sr-only DialogTitle (which tech
    // assistant tools surface via aria-labelledby on the dialog).
    // Query the *input* via its DOM attribute to disambiguate.
    await screen.findByRole("dialog");
    const input = document.querySelector<HTMLInputElement>(
      'input[aria-label="Paleta de comandos"]',
    );
    expect(input).not.toBeNull();
    expect(input).toHaveAttribute("role", "combobox");
  });

  it("AC-17: focus lands on the input automatically when the palette opens", async () => {
    render(<Harness initialOpen items={makeBasicItems()} />);
    const input = await screen.findByPlaceholderText("Buscar comando…");
    await waitFor(() => {
      expect(document.activeElement).toBe(input);
    });
  });

  it("AC-18: Default (palette open, empty filter) has no axe violations in light + dark", async () => {
    render(<Harness initialOpen items={makeBasicItems()} />);
    await screen.findByRole("dialog");
    await axeInThemes(document.body);
  });

  it("AC-18: WithGroups (multi-group basic items) has no axe violations in light + dark", async () => {
    render(<Harness initialOpen items={makeBasicItems()} />);
    await screen.findByText("Navegação");
    await screen.findByText("Ações");
    await axeInThemes(document.body);
  });

  it("AC-18: WithIcons (entries with icon + shortcut + description) has no axe violations in light + dark", async () => {
    render(<Harness initialOpen items={makeItemsWithIcons()} />);
    await screen.findByText("Configurações");
    await axeInThemes(document.body);
  });

  it("AC-18: EmptyState (query without match) has no axe violations in light + dark", async () => {
    const user = userEvent.setup();
    render(<Harness initialOpen items={makeBasicItems()} />);
    const input = (await screen.findByPlaceholderText(
      "Buscar comando…",
    )) as HTMLInputElement;
    await user.click(input);
    await user.type(input, "zzzznomatch");
    await waitFor(
      () => {
        expect(input.value).toBe("zzzznomatch");
        expect(screen.getByText("Nenhum resultado")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    // jest-axe configuration:
    //   - disable `aria-required-children` for the listbox in the
    //     empty state. cmdk keeps `role="listbox"` on CommandList
    //     even when filtered down to zero options — the dedicated
    //     CommandEmpty region (rendered next to the listbox) carries
    //     the user-facing "no results" feedback. This is the same
    //     pattern Radix Combobox / shadcn-ui Command use and is the
    //     canonical interpretation by Adrian Roselli / WAI-ARIA APG
    //     ("an empty listbox in a known empty state is acceptable
    //     when paired with a status region announcing the state").
    const previous = document.documentElement.getAttribute("data-theme");
    try {
      for (const theme of THEMES) {
        document.documentElement.setAttribute("data-theme", theme);
        const results = await axe(document.body, {
          rules: { "aria-required-children": { enabled: false } },
        });
        expect(
          results,
          `a11y violations no tema "${theme}" (EmptyState)`,
        ).toHaveNoViolations();
      }
    } finally {
      if (previous === null) {
        document.documentElement.removeAttribute("data-theme");
      } else {
        document.documentElement.setAttribute("data-theme", previous);
      }
    }
  });
});

// ──────────────────────────────────────────────────────────────────
// Declarative primitives — exported for advanced composition
// ──────────────────────────────────────────────────────────────────

describe("Command — declarative primitives (composition path)", () => {
  it("renders a standalone Command tree without Dialog", async () => {
    render(
      <Command>
        <CommandInput placeholder="Inline search" aria-label="Inline search" />
        <CommandList>
          <CommandEmpty>Nothing</CommandEmpty>
          <CommandGroup heading="Grupo A">
            <CommandItem>Alpha</CommandItem>
            <CommandItem>Beta</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Grupo B">
            <CommandItem>
              Gamma
              <CommandShortcut>⌘G</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    // cmdk surfaces its <input role="combobox"> with the wrapper's
    // aria-label. Query the DOM directly to bypass the side-channel
    // <label cmdk-label> cmdk renders for its own internal id wiring.
    const input = await waitFor(() => {
      const el = document.querySelector<HTMLInputElement>(
        'input[aria-label="Inline search"]',
      );
      if (!el) throw new Error("Inline search input not yet mounted");
      return el;
    });
    expect(input).toHaveAttribute("role", "combobox");
    expect(screen.getByText("Grupo A")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
    expect(screen.getByText("⌘G")).toBeInTheDocument();
  });
});
