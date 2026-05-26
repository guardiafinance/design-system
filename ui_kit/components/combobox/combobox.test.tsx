import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { axeInThemes } from "@/test-utils/a11y";
import { Combobox, type ComboboxOption } from "./index";

const PLANOS: ComboboxOption[] = [
  { value: "starter", label: "Starter", meta: "Até 1k transações/mês" },
  { value: "pro", label: "Pro", meta: "Até 10k transações/mês" },
  { value: "enterprise", label: "Enterprise", meta: "Personalizado" },
  { value: "legacy", label: "Legacy", meta: "Descontinuado", disabled: true },
];

describe("Combobox", () => {
  it("renderiza com role=combobox e placeholder padrão", () => {
    render(<Combobox options={PLANOS} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Selecione…");
  });

  it("aceita placeholder customizado", () => {
    render(<Combobox options={PLANOS} placeholder="Escolha um plano" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Escolha um plano");
  });

  it("trigger expõe aria-haspopup=listbox e aria-expanded=false fechado", () => {
    render(<Combobox options={PLANOS} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("clique no trigger abre o popup", async () => {
    render(<Combobox options={PLANOS} />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("popup mostra todas as options inicialmente", async () => {
    render(<Combobox options={PLANOS} />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getAllByRole("option")).toHaveLength(PLANOS.length);
  });

  it("digitar filtra a lista por label", async () => {
    render(<Combobox options={PLANOS} />);
    await userEvent.click(screen.getByRole("combobox"));
    const search = screen.getByPlaceholderText("Buscar…");
    await userEvent.type(search, "pro");
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("Pro");
  });

  it("filtro também busca em meta (string)", async () => {
    render(<Combobox options={PLANOS} />);
    await userEvent.click(screen.getByRole("combobox"));
    const search = screen.getByPlaceholderText("Buscar…");
    await userEvent.type(search, "personalizado");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option")).toHaveTextContent("Enterprise");
  });

  it("empty state quando filtro não acha nada", async () => {
    render(<Combobox options={PLANOS} emptyText="Nada encontrado" />);
    await userEvent.click(screen.getByRole("combobox"));
    const search = screen.getByPlaceholderText("Buscar…");
    await userEvent.type(search, "xyzqwerty");
    expect(screen.getByText("Nada encontrado")).toBeInTheDocument();
  });

  it("clique em option seleciona e fecha (uncontrolled)", async () => {
    const onChange = vi.fn();
    render(<Combobox options={PLANOS} onChange={onChange} />);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByText("Pro"));
    expect(onChange).toHaveBeenCalledWith("pro", PLANOS[1]);
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });
  });

  it("trigger reflete a label do option selecionado", async () => {
    render(<Combobox options={PLANOS} defaultValue="pro" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Pro");
  });

  it("modo controlled respeita value externo", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Combobox options={PLANOS} value="starter" onChange={onChange} />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Starter");
    rerender(<Combobox options={PLANOS} value="pro" onChange={onChange} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Pro");
  });

  it("option disabled não pode ser selecionada", async () => {
    const onChange = vi.fn();
    render(<Combobox options={PLANOS} onChange={onChange} />);
    await userEvent.click(screen.getByRole("combobox"));
    const legacy = screen.getByText("Legacy").closest("button")!;
    expect(legacy).toBeDisabled();
  });

  it("ArrowDown / ArrowUp navega entre opções", async () => {
    const user = userEvent.setup();
    render(<Combobox options={PLANOS} />);
    await user.click(screen.getByRole("combobox"));
    const search = screen.getByPlaceholderText("Buscar…");
    await user.click(search);
    await user.keyboard("{ArrowDown}");
    /* o aria-activedescendant deve apontar para o option de index 1 */
    await waitFor(() => {
      const id = search.getAttribute("aria-activedescendant");
      expect(id).toMatch(/-opt-1$/);
    });
  });

  it("Enter no search seleciona o option ativo", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox options={PLANOS} onChange={onChange} />);
    await user.click(screen.getByRole("combobox"));
    /* O search é auto-focado, mas vamos garantir que o evento dispare nele */
    const search = screen.getByPlaceholderText("Buscar…");
    await waitFor(() => expect(search).toHaveFocus());
    /* index 0 = Starter por default */
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("starter", PLANOS[0]);
  });

  it("invalid=true aplica aria-invalid", () => {
    render(<Combobox options={PLANOS} invalid />);
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("disabled bloqueia abertura", async () => {
    render(<Combobox options={PLANOS} disabled />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("clearable mostra X e limpa quando clicado", async () => {
    const onChange = vi.fn();
    render(
      <Combobox
        options={PLANOS}
        defaultValue="pro"
        clearable
        onChange={onChange}
      />,
    );
    const clearBtn = screen.getByLabelText("Limpar seleção");
    await userEvent.click(clearBtn);
    expect(onChange).toHaveBeenLastCalledWith("", undefined);
  });

  it("clearable não aparece sem valor", () => {
    render(<Combobox options={PLANOS} clearable />);
    expect(screen.queryByLabelText("Limpar seleção")).not.toBeInTheDocument();
  });

  it("name renderiza input hidden para form submission", () => {
    const { container } = render(
      <Combobox options={PLANOS} defaultValue="pro" name="plano" />,
    );
    const hidden = container.querySelector(
      "input[type='hidden'][name='plano']",
    );
    expect(hidden).toHaveAttribute("value", "pro");
  });

  it("size=sm aplica h-8", () => {
    render(<Combobox options={PLANOS} size="sm" />);
    expect(screen.getByRole("combobox")).toHaveClass("h-8");
  });

  it("size=lg aplica h-[46px]", () => {
    render(<Combobox options={PLANOS} size="lg" />);
    expect(screen.getByRole("combobox")).toHaveClass("h-[46px]");
  });

  it("aria-controls aponta para o listbox", async () => {
    render(<Combobox options={PLANOS} />);
    const trigger = screen.getByRole("combobox");
    const listId = trigger.getAttribute("aria-controls");
    expect(listId).toBeTruthy();
    await userEvent.click(trigger);
    expect(screen.getByRole("listbox")).toHaveAttribute("id", listId!);
  });

  it("option selecionada expõe aria-selected=true", async () => {
    render(<Combobox options={PLANOS} defaultValue="pro" />);
    await userEvent.click(screen.getByRole("combobox"));
    /* "Pro" aparece também no trigger, então filtramos pelo role=option */
    const proOpt = screen
      .getAllByText("Pro")
      .map((el) => el.closest("[role=option]"))
      .find((el): el is Element => el != null);
    expect(proOpt).toHaveAttribute("aria-selected", "true");
  });

  it("Escape fecha o popup (Radix)", async () => {
    const user = userEvent.setup();
    render(<Combobox options={PLANOS} />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });
  });

  /* ────────────────────────────────────────────────────────────────
   * AC traceability — Issue #142 (parent Tech Task #125)
   *
   * Cada teste deste bloco cobre um AC numerado de
   * .ahrena/issues/142/02-requirements.md. A convenção `AC-N:` no
   * início do nome do `it()` satisfaz a regra de traçabilidade
   * AC↔teste de `lex-issue-driven` (regra 3).
   * ──────────────────────────────────────────────────────────────── */
  describe("AC traceability", () => {
    it("AC-1: zero hardcoded palette in interactive state classes", () => {
      /* Lê a source em runtime e roda a regex do parent #125 sobre o
         conteúdo. Falha imediata se algum estado interativo voltar
         a usar `guardia-{violet,orange,pink,yellow}-NNN`. */
      const here = dirname(fileURLToPath(import.meta.url));
      const src = readFileSync(resolve(here, "./index.tsx"), "utf-8");
      const matches = src.match(/guardia-(violet|orange|pink|yellow)-[0-9]+/g);
      expect(matches).toBeNull();
    });

    it("AC-2: trigger applies border-action in hover and data-state=open", () => {
      render(<Combobox options={PLANOS} />);
      const trigger = screen.getByRole("combobox");
      const cls = trigger.className;
      expect(cls).toContain("hover:border-action");
      expect(cls).toContain("data-[state=open]:border-action");
      expect(cls).not.toContain("guardia-purple");
    });

    it("trigger gates hover via `enabled:` modifier (no `disabled:hover:` override, per #169)", () => {
      // WHY: enabled:hover:border-action substitui o par verboso
      // hover:border-action + disabled:hover:border-border-strong. Ver #169.
      render(<Combobox options={PLANOS} />);
      const trigger = screen.getByRole("combobox");
      expect(trigger.className).toMatch(/enabled:hover:border-action/);
      expect(trigger.className).not.toMatch(/disabled:hover:/);
    });

    it("AC-3: selected option uses bg-action + text-button-fg", async () => {
      render(<Combobox options={PLANOS} defaultValue="pro" />);
      await userEvent.click(screen.getByRole("combobox"));
      const proOpt = screen
        .getAllByText("Pro")
        .map((el) => el.closest("[role=option]"))
        .find((el): el is Element => el != null);
      expect(proOpt).toBeDefined();
      const cls = proOpt!.className;
      expect(cls).toContain("bg-action");
      expect(cls).toContain("text-button-fg");
      expect(cls).not.toContain("guardia-purple");
    });

    it("AC-4: active-not-selected option uses bg-bg-hover/60", async () => {
      render(<Combobox options={PLANOS} />);
      await userEvent.click(screen.getByRole("combobox"));
      /* activeIndex inicia em 0 e nenhum item está selected → primeiro
         option está em estado active-not-selected, exibindo o halo
         token-driven. */
      const firstOpt = screen.getAllByRole("option")[0];
      expect(firstOpt).toBeDefined();
      const cls = firstOpt!.className;
      expect(cls).toContain("bg-bg-hover/60");
      expect(cls).not.toContain("bg-action");
    });
  });

  /* ────────────────────────────────────────────────────────────────
   * Acessibilidade — jest-axe em light + dark via axeInThemes
   *
   * Cobertura AC-6: 6 cenários canônicos definidos em
   * .ahrena/issues/142/02-requirements.md, cobrindo as variantes
   * que mais mudam paint state (closed, opened, opened+selected,
   * invalid, disabled, clearable).
   *
   * Espelha o padrão do Checkbox (#139/PR #152). Cada teste fecha o
   * Popover no teardown via unmount() implícito do Testing Library,
   * mantendo isolamento entre cenários (lex-test-isolation).
   * ──────────────────────────────────────────────────────────────── */
  describe("a11y", () => {
    it("AC-6: has no WCAG 2.1 AA violations in light + dark (default closed)", async () => {
      const { container } = render(
        <Combobox options={PLANOS} aria-label="Plano contratado" />,
      );
      await axeInThemes(container);
    });

    it("AC-6: has no WCAG 2.1 AA violations in light + dark (opened, no selection)", async () => {
      const { container } = render(
        <Combobox options={PLANOS} aria-label="Plano contratado" />,
      );
      await userEvent.click(screen.getByRole("combobox"));
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      await axeInThemes(container);
    });

    it("AC-6: has no WCAG 2.1 AA violations in light + dark (opened with selection)", async () => {
      const { container } = render(
        <Combobox
          options={PLANOS}
          defaultValue="pro"
          aria-label="Plano contratado"
        />,
      );
      await userEvent.click(screen.getByRole("combobox"));
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      await axeInThemes(container);
    });

    it("AC-6: has no WCAG 2.1 AA violations in light + dark (invalid)", async () => {
      const { container } = render(
        <Combobox options={PLANOS} invalid aria-label="Plano obrigatório" />,
      );
      await axeInThemes(container);
    });

    it("AC-6: has no WCAG 2.1 AA violations in light + dark (disabled)", async () => {
      const { container } = render(
        <Combobox options={PLANOS} disabled aria-label="Plano indisponível" />,
      );
      await axeInThemes(container);
    });

    it("AC-6: has no WCAG 2.1 AA violations in light + dark (clearable with value)", async () => {
      const { container } = render(
        <Combobox
          options={PLANOS}
          defaultValue="pro"
          clearable
          aria-label="Plano contratado"
        />,
      );
      await axeInThemes(container);
    });
  });
});
