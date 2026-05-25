import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { axeInThemes } from "@/test-utils/a11y";
import { Select, type SelectOption } from "./index";

const PLANOS: SelectOption[] = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "business", label: "Business" },
  { value: "enterprise", label: "Enterprise" },
  { value: "legacy", label: "Legacy", disabled: true },
];

describe("Select", () => {
  it("renderiza trigger com placeholder padrão", () => {
    render(<Select options={PLANOS} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Selecione…");
  });

  it("placeholder customizado é respeitado", () => {
    render(<Select options={PLANOS} placeholder="Escolha um plano" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Escolha um plano");
  });

  it("trigger expõe role=combobox + aria-haspopup=listbox", () => {
    render(<Select options={PLANOS} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("clique no trigger abre o listbox", async () => {
    render(<Select options={PLANOS} />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("listbox renderiza todos os options", async () => {
    render(<Select options={PLANOS} />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getAllByRole("option")).toHaveLength(PLANOS.length);
  });

  it("clique em option seleciona e fecha (uncontrolled)", async () => {
    const onChange = vi.fn();
    render(<Select options={PLANOS} onChange={onChange} />);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByText("Pro"));
    expect(onChange).toHaveBeenCalledWith("pro", PLANOS[1]);
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });
    /* trigger reflete a label do selecionado */
    expect(screen.getByRole("combobox")).toHaveTextContent("Pro");
  });

  it("defaultValue exibe label do option correspondente no trigger", () => {
    render(<Select options={PLANOS} defaultValue="business" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Business");
  });

  it("modo controlled respeita value externo", () => {
    const { rerender } = render(<Select options={PLANOS} value="starter" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Starter");
    rerender(<Select options={PLANOS} value="enterprise" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Enterprise");
  });

  it("option disabled não pode ser selecionada", async () => {
    const onChange = vi.fn();
    render(<Select options={PLANOS} onChange={onChange} />);
    await userEvent.click(screen.getByRole("combobox"));
    const legacy = screen.getByText("Legacy").closest("button")!;
    expect(legacy).toBeDisabled();
    await userEvent.click(legacy);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ArrowDown navega entre opções (atualiza aria-activedescendant)", async () => {
    const user = userEvent.setup();
    render(<Select options={PLANOS} />);
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    /* O listbox abre com activeIndex = índice do selecionado (default 0) */
    const listbox = await screen.findByRole("listbox");
    listbox.focus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => {
      const id = trigger.getAttribute("aria-activedescendant");
      expect(id).toMatch(/-opt-1$/);
    });
  });

  it("Enter no listbox seleciona o option ativo", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select options={PLANOS} onChange={onChange} />);
    await user.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    listbox.focus();
    /* activeIndex inicial = 0 (Starter) */
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("starter", PLANOS[0]);
  });

  it("invalid aplica aria-invalid", () => {
    render(<Select options={PLANOS} invalid />);
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("disabled bloqueia abertura", async () => {
    render(<Select options={PLANOS} disabled />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("size=sm aplica h-8", () => {
    render(<Select options={PLANOS} size="sm" />);
    expect(screen.getByRole("combobox")).toHaveClass("h-8");
  });

  it("size=lg aplica h-[46px]", () => {
    render(<Select options={PLANOS} size="lg" />);
    expect(screen.getByRole("combobox")).toHaveClass("h-[46px]");
  });

  it("name renderiza input hidden para form submission", () => {
    const { container } = render(
      <Select options={PLANOS} defaultValue="pro" name="plano" />,
    );
    const hidden = container.querySelector("input[type='hidden']");
    expect(hidden).toHaveAttribute("name", "plano");
    expect(hidden).toHaveAttribute("value", "pro");
  });

  it("required no Select aplica required no input hidden", () => {
    const { container } = render(
      <Select options={PLANOS} name="plano" required />,
    );
    /* hidden input não satisfaz toBeRequired() do jest-dom (hidden ignora
     * required); checamos o atributo diretamente */
    expect(
      container.querySelector("input[type='hidden']"),
    ).toHaveAttribute("required");
  });

  it("leftIcon renderiza no trigger", () => {
    render(
      <Select options={PLANOS} leftIcon={<svg data-testid="li" />} />,
    );
    expect(screen.getByTestId("li")).toBeInTheDocument();
  });

  it("listbox tem accessible name via aria-labelledby (aponta para o trigger)", async () => {
    render(<Select options={PLANOS} aria-label="Plano" />);
    const trigger = screen.getByRole("combobox");
    await userEvent.click(trigger);
    const listbox = await screen.findByRole("listbox");
    expect(listbox).toHaveAttribute("aria-labelledby", trigger.id);
  });

  it("Popover.Content tem accessible name via aria-labelledby (aponta para o trigger)", async () => {
    render(<Select options={PLANOS} aria-label="Plano" />);
    const trigger = screen.getByRole("combobox");
    await userEvent.click(trigger);
    await screen.findByRole("listbox");
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-labelledby",
      trigger.id,
    );
  });

  it("aria-controls aponta para o listbox", async () => {
    render(<Select options={PLANOS} />);
    const trigger = screen.getByRole("combobox");
    const listId = trigger.getAttribute("aria-controls");
    expect(listId).toBeTruthy();
    await userEvent.click(trigger);
    expect(screen.getByRole("listbox")).toHaveAttribute("id", listId!);
  });

  it("option selecionada expõe aria-selected=true", async () => {
    render(<Select options={PLANOS} defaultValue="pro" />);
    await userEvent.click(screen.getByRole("combobox"));
    const proOpt = screen
      .getAllByText("Pro")
      .map((el) => el.closest("[role=option]"))
      .find((el): el is Element => el != null);
    expect(proOpt).toHaveAttribute("aria-selected", "true");
  });

  it("Escape fecha o listbox (Radix)", async () => {
    const user = userEvent.setup();
    render(<Select options={PLANOS} />);
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

  it("activeIndex inicia no selecionado quando o popover abre", async () => {
    const user = userEvent.setup();
    render(<Select options={PLANOS} defaultValue="business" />);
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    /* business está no índice 2 */
    await waitFor(() => {
      const id = trigger.getAttribute("aria-activedescendant");
      expect(id).toMatch(/-opt-2$/);
    });
  });

  it("ArrowDown pula option disabled", async () => {
    /* Coloca um disabled no meio: posições 0=A 1=B(disabled) 2=C */
    const opts: SelectOption[] = [
      { value: "a", label: "A" },
      { value: "b", label: "B", disabled: true },
      { value: "c", label: "C" },
    ];
    const user = userEvent.setup();
    render(<Select options={opts} />);
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    const listbox = await screen.findByRole("listbox");
    listbox.focus();
    /* activeIndex = 0 (A); ArrowDown deve pular para 2 (C), não 1 */
    await user.keyboard("{ArrowDown}");
    await waitFor(() => {
      const id = trigger.getAttribute("aria-activedescendant");
      expect(id).toMatch(/-opt-2$/);
    });
  });

  describe("brand-aware tokens (Tech Task #125)", () => {
    it("trigger usa border-action no hover (sem guardia-violet hardcoded)", () => {
      render(<Select options={PLANOS} />);
      const trigger = screen.getByRole("combobox");
      expect(trigger.className).toMatch(/hover:border-action/);
      expect(trigger.className).not.toMatch(/hover:border-guardia-violet-500/);
    });

    it("trigger usa border-action quando aberto (data-state=open)", () => {
      render(<Select options={PLANOS} />);
      const trigger = screen.getByRole("combobox");
      expect(trigger.className).toMatch(/data-\[state=open\]:border-action/);
      expect(trigger.className).not.toMatch(
        /data-\[state=open\]:border-guardia-violet-500/,
      );
    });

    it("option selecionada usa bg-bg-hover + text-action (sem guardia-violet hardcoded)", async () => {
      render(<Select options={PLANOS} defaultValue="pro" />);
      await userEvent.click(screen.getByRole("combobox"));
      const proOpt = screen
        .getAllByText("Pro")
        .map((el) => el.closest("[role=option]"))
        .find((el): el is HTMLElement => el != null)!;
      expect(proOpt.className).toMatch(/bg-bg-hover/);
      expect(proOpt.className).toMatch(/text-action/);
      expect(proOpt.className).not.toMatch(/bg-guardia-violet-100/);
      expect(proOpt.className).not.toMatch(/text-guardia-violet-700/);
    });

    it("option ativa (não selecionada) usa bg-bg-hover/50 (sem guardia-violet hardcoded)", async () => {
      const user = userEvent.setup();
      /* defaultValue=pro mantém Starter como ativo via hover/keyboard */
      render(<Select options={PLANOS} defaultValue="pro" />);
      const trigger = screen.getByRole("combobox");
      await user.click(trigger);
      const listbox = await screen.findByRole("listbox");
      listbox.focus();
      /* Move o foco ativo para Starter (índice 0) — não-selecionado */
      await user.keyboard("{Home}");
      await waitFor(() => {
        const id = trigger.getAttribute("aria-activedescendant");
        expect(id).toMatch(/-opt-0$/);
      });
      const starter = screen
        .getAllByText("Starter")
        .map((el) => el.closest("[role=option]"))
        .find((el): el is HTMLElement => el != null)!;
      expect(starter.className).toMatch(/bg-bg-hover\/50/);
      expect(starter.className).not.toMatch(/bg-guardia-violet-100\/50/);
    });
  });

  describe("a11y", () => {
    it("has no WCAG 2.1 AA violations in light + dark (trigger fechado)", async () => {
      const { container } = render(<Select options={PLANOS} />);
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (trigger com valor selecionado)", async () => {
      const { container } = render(
        <Select options={PLANOS} defaultValue="pro" />,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (listbox aberto + selecionado)", async () => {
      render(<Select options={PLANOS} defaultValue="business" />);
      await userEvent.click(screen.getByRole("combobox"));
      /* Scope no Popover.Content (dialog wrapper do Radix) — tem o
       * `bg-background` necessário para axe computar contraste real
       * dos options. Ambos o dialog e o listbox interno ganharam
       * `aria-labelledby={triggerId}` no index.tsx, satisfazendo
       * `aria-dialog-name`. */
      await screen.findByRole("listbox");
      const popoverContent = screen.getByRole("dialog");
      await axeInThemes(popoverContent);
    });

    it("has no WCAG 2.1 AA violations in light + dark (invalid)", async () => {
      const { container } = render(
        <Select options={PLANOS} invalid aria-label="Plano" />,
      );
      await axeInThemes(container);
    });

    it("has no WCAG 2.1 AA violations in light + dark (disabled)", async () => {
      const { container } = render(
        <Select options={PLANOS} disabled aria-label="Plano" />,
      );
      await axeInThemes(container);
    });
  });
});
