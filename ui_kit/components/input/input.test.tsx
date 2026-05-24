import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Input } from "./index";
import { axeInThemes } from "@/test-utils/a11y";

describe("Input", () => {
  it("renderiza um <input> dentro de um wrapper <div>", () => {
    const { container } = render(<Input data-testid="i" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.tagName).toBe("DIV");
    expect(container.querySelector("input")).toBeInTheDocument();
  });

  it("ref aponta para o <input> (não pro wrapper) — compat com legado", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={ref} placeholder="x" />);
    expect(ref.current?.tagName).toBe("INPUT");
  });

  it("aceita placeholder e valor controlado", async () => {
    render(<Input placeholder="Buscar" />);
    const input = screen.getByPlaceholderText("Buscar");
    await userEvent.type(input, "abc");
    expect(input).toHaveValue("abc");
  });

  it("size=sm aplica h-8", () => {
    const { container } = render(<Input size="sm" />);
    expect(container.firstChild).toHaveClass("h-8");
  });

  it("size=md (default) aplica h-[38px]", () => {
    const { container } = render(<Input />);
    expect(container.firstChild).toHaveClass("h-[38px]");
  });

  it("size=lg aplica h-[46px]", () => {
    const { container } = render(<Input size="lg" />);
    expect(container.firstChild).toHaveClass("h-[46px]");
  });

  it("invalid=true aplica border destructive + aria-invalid no input", () => {
    const { container } = render(<Input invalid />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/border-destructive/);
    expect(container.querySelector("input")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("state=error sem invalid também aplica border destructive", () => {
    const { container } = render(<Input state="error" />);
    expect(container.firstChild).toHaveClass("border-destructive");
  });

  it("state=success aplica border signal-green", () => {
    const { container } = render(<Input state="success" />);
    expect(container.firstChild).toHaveClass("border-signal-green");
  });

  it("disabled propaga para o input + marca data-disabled no wrapper", () => {
    const { container } = render(<Input disabled />);
    expect(container.firstChild).toHaveAttribute("data-disabled", "true");
    expect(container.querySelector("input")).toBeDisabled();
  });

  it("leftIcon renderiza no wrapper antes do input", () => {
    render(
      <Input leftIcon={<svg data-testid="li" />} placeholder="busca" />,
    );
    expect(screen.getByTestId("li")).toBeInTheDocument();
  });

  it("rightIcon renderiza no wrapper depois do input", () => {
    render(
      <Input rightIcon={<svg data-testid="ri" />} placeholder="busca" />,
    );
    expect(screen.getByTestId("ri")).toBeInTheDocument();
  });

  it("prefix renderiza com separator border-right", () => {
    render(<Input prefix="R$" />);
    const prefix = screen.getByText("R$");
    expect(prefix.className).toMatch(/border-r/);
  });

  it("suffix renderiza com separator border-left", () => {
    render(<Input suffix=".com" />);
    const suffix = screen.getByText(".com");
    expect(suffix.className).toMatch(/border-l/);
  });

  it("name e autocomplete passam para o input", () => {
    render(<Input name="email" autoComplete="email" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveAttribute("autocomplete", "email");
  });

  it("aria-describedby preserva valores externos", () => {
    render(<Input aria-describedby="external" />);
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "aria-describedby",
      "external",
    );
  });

  it("respeita type=email/number/password", () => {
    const { rerender, container } = render(<Input type="email" />);
    expect(container.querySelector("input")).toHaveAttribute("type", "email");
    rerender(<Input type="number" />);
    expect(container.querySelector("input")).toHaveAttribute("type", "number");
    rerender(<Input type="password" />);
    expect(container.querySelector("input")).toHaveAttribute("type", "password");
  });

  it("onChange dispara nas mudanças", async () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    await userEvent.type(screen.getByRole("textbox"), "ab");
    expect(onChange).toHaveBeenCalled();
  });

  it("className vai no wrapper, inputClassName no input", () => {
    const { container } = render(
      <Input className="my-wrap" inputClassName="my-input" />,
    );
    expect(container.firstChild).toHaveClass("my-wrap");
    expect(container.querySelector("input")).toHaveClass("my-input");
  });

  it("wrapperClassName é alias de className (ambos somam)", () => {
    const { container } = render(
      <Input className="a" wrapperClassName="b" />,
    );
    expect(container.firstChild).toHaveClass("a");
    expect(container.firstChild).toHaveClass("b");
  });

  // Cobertura a11y per Tech Task #125 — todo componente do design system
  // valida `toHaveNoViolations()` em light + dark. O helper `axeInThemes`
  // alterna `data-theme` no <html> antes de cada checagem.
  describe("a11y", () => {
    it("nao tem violacoes WCAG em light + dark (default state, com label)", async () => {
      // Form input requer label associado per lex-frontend-accessibility §4.1.
      // <Input> nao injeta label sozinho — o consumidor sempre embala em
      // FormLayout/<Label>. Replicamos a embalagem minima aqui.
      const { container } = render(
        <>
          <label htmlFor="name">Nome</label>
          <Input id="name" placeholder="Seu nome" />
        </>,
      );
      await axeInThemes(container);
    });

    it("nao tem violacoes WCAG em light + dark (state=error, aria-invalid)", async () => {
      const { container } = render(
        <>
          <label htmlFor="email">E-mail</label>
          <Input
            id="email"
            type="email"
            state="error"
            aria-invalid="true"
            aria-describedby="email-err"
          />
          <span id="email-err">E-mail inválido</span>
        </>,
      );
      await axeInThemes(container);
    });

    it("nao tem violacoes WCAG em light + dark (state=success)", async () => {
      const { container } = render(
        <>
          <label htmlFor="code">Código</label>
          <Input id="code" state="success" defaultValue="OK" />
        </>,
      );
      await axeInThemes(container);
    });
  });
});
