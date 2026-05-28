import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { Input } from "./index";
import { axeInThemes } from "@/test-utils/a11y";

// Cobertura do Plan #47 (review Input contra DoD v0.1.0). Cada teste carrega
// uma anotacao AC-N apontando para `docs/issues/issue-47/02-requirements.md`.
// O DoD exige >= 20 testes comportamentais com queries acessiveis e jest-axe
// em light + dark; este arquivo cumpre ambos no mesmo conjunto, sem mockar
// colaboradores internos (consumidor real do `<input>` nativo via ...rest).

describe("Input", () => {
  // AC-7 (estrutura) — wrap em <div> para acomodar slots; ref no <input>.
  it("renderiza um <input> dentro de um wrapper <div>", () => {
    const { container } = render(<Input data-testid="i" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.tagName).toBe("DIV");
    expect(container.querySelector("input")).toBeInTheDocument();
  });

  // AC-7 (ref forwarding) — confirma que ref aponta para o <input> interno.
  it("ref aponta para o <input> (nao pro wrapper) — compat com legado", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={ref} placeholder="x" />);
    expect(ref.current?.tagName).toBe("INPUT");
  });

  // AC-7 (ref.focus) — exercita ref.focus() e valida activeElement (acoes
  // imperativas reais de codigo legado).
  it("ref.focus() move o foco para o input (document.activeElement)", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={ref} aria-label="campo" />);
    ref.current?.focus();
    expect(document.activeElement).toBe(ref.current);
  });

  // AC-7 (text typing + placeholder + uncontrolled default) — caminho mais
  // basico (consumidor digita; nao passa value).
  it("aceita placeholder e valor controlado", async () => {
    render(<Input placeholder="Buscar" />);
    const input = screen.getByPlaceholderText("Buscar");
    await userEvent.type(input, "abc");
    expect(input).toHaveValue("abc");
  });

  // AC-7 (controlled) — value + onChange controlados pelo pai.
  it("controlled: value + onChange refletem o estado do pai", async () => {
    function Wrapper() {
      const [v, setV] = useState("");
      return (
        <Input
          aria-label="controlled"
          value={v}
          onChange={(e) => setV(e.target.value)}
        />
      );
    }
    render(<Wrapper />);
    const input = screen.getByRole("textbox", { name: "controlled" });
    await userEvent.type(input, "ola");
    expect(input).toHaveValue("ola");
  });

  // AC-7 (uncontrolled defaultValue) — DOM mantem estado proprio quando o
  // pai nao passa value.
  it("uncontrolled: defaultValue inicializa e digitacao avanca o valor", async () => {
    render(<Input aria-label="uncontrolled" defaultValue="seed" />);
    const input = screen.getByRole("textbox", { name: "uncontrolled" });
    expect(input).toHaveValue("seed");
    await userEvent.type(input, "+x");
    expect(input).toHaveValue("seed+x");
  });

  // AC-2/AC-7 (size variant sm) — classe utilitaria distinta por tamanho.
  it("size=sm aplica h-8", () => {
    const { container } = render(<Input size="sm" />);
    expect(container.firstChild).toHaveClass("h-8");
  });

  // AC-2/AC-7 (size variant md default).
  it("size=md (default) aplica h-[38px]", () => {
    const { container } = render(<Input />);
    expect(container.firstChild).toHaveClass("h-[38px]");
  });

  // AC-2/AC-7 (size variant lg).
  it("size=lg aplica h-[46px]", () => {
    const { container } = render(<Input size="lg" />);
    expect(container.firstChild).toHaveClass("h-[46px]");
  });

  // AC-7 (invalid shortcut) — `invalid` aplica state=error + aria-invalid.
  it("invalid=true aplica border destructive + aria-invalid no input", () => {
    const { container } = render(<Input invalid />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/border-destructive/);
    expect(container.querySelector("input")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  // AC-7 (state=error explicito).
  it("state=error sem invalid tambem aplica border destructive", () => {
    const { container } = render(<Input state="error" />);
    expect(container.firstChild).toHaveClass("border-destructive");
  });

  // AC-7 (state=success).
  it("state=success aplica border signal-green", () => {
    const { container } = render(<Input state="success" />);
    expect(container.firstChild).toHaveClass("border-signal-green");
  });

  // AC-7 (disabled) — propaga para o input + marca data-disabled no wrapper.
  it("disabled propaga para o input + marca data-disabled no wrapper", () => {
    const { container } = render(<Input disabled />);
    expect(container.firstChild).toHaveAttribute("data-disabled", "true");
    expect(container.querySelector("input")).toBeDisabled();
  });

  // AC-7 (readOnly) — atributo nativo passa via ...rest; o usuario nao
  // consegue alterar o valor mas o input continua focavel.
  it("readOnly impede digitacao mas mantem foco", async () => {
    render(<Input aria-label="ro" readOnly defaultValue="lock" />);
    const input = screen.getByRole("textbox", { name: "ro" });
    expect(input).toHaveAttribute("readonly");
    await userEvent.type(input, "abc");
    expect(input).toHaveValue("lock");
  });

  // AC-7 (required) — atributo nativo propagado; necessario para HTML5
  // validation em forms.
  it("required propaga e marca o input como obrigatorio", () => {
    render(<Input aria-label="req" required />);
    const input = screen.getByRole("textbox", { name: "req" });
    expect(input).toBeRequired();
  });

  // AC-7 (leftIcon) — slot esquerdo aceita qualquer ReactNode (aria-hidden
  // no wrapper de icone).
  it("leftIcon renderiza no wrapper antes do input", () => {
    render(
      <Input leftIcon={<svg data-testid="li" />} placeholder="busca" />,
    );
    expect(screen.getByTestId("li")).toBeInTheDocument();
  });

  // AC-7 (rightIcon) — slot direito.
  it("rightIcon renderiza no wrapper depois do input", () => {
    render(
      <Input rightIcon={<svg data-testid="ri" />} placeholder="busca" />,
    );
    expect(screen.getByTestId("ri")).toBeInTheDocument();
  });

  // AC-7 (prefix slot) — separator border-right diferencia prefix de icone.
  it("prefix renderiza com separator border-right", () => {
    render(<Input prefix="R$" />);
    const prefix = screen.getByText("R$");
    expect(prefix.className).toMatch(/border-r/);
  });

  // AC-7 (suffix slot) — separator border-left.
  it("suffix renderiza com separator border-left", () => {
    render(<Input suffix=".com" />);
    const suffix = screen.getByText(".com");
    expect(suffix.className).toMatch(/border-l/);
  });

  // AC-7 (name + autocomplete) — atributos nativos via ...rest.
  it("name e autocomplete passam para o input", () => {
    render(<Input name="email" autoComplete="email" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveAttribute("autocomplete", "email");
  });

  // AC-7 (FormData integration) — name habilita serializacao via FormData,
  // caminho real de integracao com formularios nativos.
  it("integra com formulario via name + FormData", () => {
    let captured: FormData | null = null;
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          captured = new FormData(e.currentTarget);
        }}
      >
        <label htmlFor="fd-email">Email</label>
        <Input id="fd-email" name="email" defaultValue="ana@guardia.finance" />
        <button type="submit">enviar</button>
      </form>,
    );
    screen.getByRole("button", { name: "enviar" }).click();
    expect(captured).not.toBeNull();
    expect((captured as unknown as FormData).get("email")).toBe(
      "ana@guardia.finance",
    );
  });

  // AC-7 (aria-describedby external) — agente nao sobrescreve aria-describedby
  // passado pelo consumidor.
  it("aria-describedby preserva valores externos", () => {
    render(<Input aria-describedby="external" />);
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "aria-describedby",
      "external",
    );
  });

  // AC-7 (aria-describedby wiring real) — aponta para descricao concreta
  // (caminho recomendado por FormLayout.Field).
  it("aria-describedby aponta para descricao concreta no DOM", () => {
    render(
      <>
        <label htmlFor="age">Idade</label>
        <Input id="age" type="number" aria-describedby="age-hint" />
        <span id="age-hint">Entre 18 e 120</span>
      </>,
    );
    const input = screen.getByRole("spinbutton", { name: "Idade" });
    const hintId = input.getAttribute("aria-describedby");
    expect(hintId).toBe("age-hint");
    expect(document.getElementById(hintId!)?.textContent).toBe(
      "Entre 18 e 120",
    );
  });

  // AC-7 (type variants basicos) — email/number/password.
  it("respeita type=email/number/password", () => {
    const { rerender, container } = render(<Input type="email" />);
    expect(container.querySelector("input")).toHaveAttribute("type", "email");
    rerender(<Input type="number" />);
    expect(container.querySelector("input")).toHaveAttribute("type", "number");
    rerender(<Input type="password" />);
    expect(container.querySelector("input")).toHaveAttribute(
      "type",
      "password",
    );
  });

  // AC-7 (type variants adicionais) — tel/url/search exigidos pelo DoD.
  it("respeita type=tel/url/search", () => {
    const { rerender, container } = render(<Input type="tel" />);
    expect(container.querySelector("input")).toHaveAttribute("type", "tel");
    rerender(<Input type="url" />);
    expect(container.querySelector("input")).toHaveAttribute("type", "url");
    rerender(<Input type="search" />);
    expect(container.querySelector("input")).toHaveAttribute("type", "search");
  });

  // AC-7 (maxLength) — limita digitacao via atributo nativo.
  it("maxLength limita o numero de caracteres digitados", async () => {
    render(<Input aria-label="ml" maxLength={3} />);
    const input = screen.getByRole("textbox", { name: "ml" });
    await userEvent.type(input, "abcdef");
    expect(input).toHaveValue("abc");
  });

  // AC-7 (minLength + pattern) — atributos nativos para HTML5 validation.
  it("minLength e pattern propagam ao input para HTML5 validation", () => {
    render(<Input aria-label="mp" minLength={3} pattern="[a-z]+" />);
    const input = screen.getByRole("textbox", { name: "mp" });
    expect(input).toHaveAttribute("minlength", "3");
    expect(input).toHaveAttribute("pattern", "[a-z]+");
  });

  // AC-7 (onChange) — handler dispara em cada mudanca.
  it("onChange dispara nas mudancas", async () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    await userEvent.type(screen.getByRole("textbox"), "ab");
    expect(onChange).toHaveBeenCalled();
  });

  // AC-7 (onFocus) — handler dispara quando o input recebe foco.
  it("onFocus dispara quando o input ganha foco", async () => {
    const onFocus = vi.fn();
    render(<Input aria-label="f" onFocus={onFocus} />);
    await userEvent.click(screen.getByRole("textbox", { name: "f" }));
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  // AC-7 (onBlur) — handler dispara quando o input perde foco (Tab).
  it("onBlur dispara quando o input perde foco", async () => {
    const onBlur = vi.fn();
    render(
      <>
        <Input aria-label="b" onBlur={onBlur} />
        <button type="button">outro</button>
      </>,
    );
    const input = screen.getByRole("textbox", { name: "b" });
    await userEvent.click(input);
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  // AC-7 (className wrapper) — className no wrapper, inputClassName no input.
  it("className vai no wrapper, inputClassName no input", () => {
    const { container } = render(
      <Input className="my-wrap" inputClassName="my-input" />,
    );
    expect(container.firstChild).toHaveClass("my-wrap");
    expect(container.querySelector("input")).toHaveClass("my-input");
  });

  // AC-7 (wrapperClassName alias).
  it("wrapperClassName e alias de className (ambos somam)", () => {
    const { container } = render(
      <Input className="a" wrapperClassName="b" />,
    );
    expect(container.firstChild).toHaveClass("a");
    expect(container.firstChild).toHaveClass("b");
  });

  // Cobertura a11y per Tech Task #125 e Plan #47 (AC-8) — todo componente
  // do design system valida `toHaveNoViolations()` em light + dark via
  // `axeInThemes`, que alterna `data-theme` no <html> antes de cada checagem.
  // Este Plan extende a matriz para incluir: default empty + filled, com
  // descricao, disabled, readOnly e variante de type (email), alem dos
  // estados ja cobertos por Tech Task #125 (default+label, error+aria-invalid,
  // success).
  describe("a11y", () => {
    // AC-8 (default with label) — caso minimo: input + label associado.
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

    // AC-8 (default filled) — campo com conteudo digitado (alguns checks
    // axe so disparam quando ha valor).
    it("nao tem violacoes WCAG em light + dark (default com valor digitado)", async () => {
      const { container } = render(
        <>
          <label htmlFor="city">Cidade</label>
          <Input id="city" defaultValue="Sao Paulo" />
        </>,
      );
      await axeInThemes(container);
    });

    // AC-8 (with description via aria-describedby) — wiring recomendado
    // para hint/description em formularios.
    it("nao tem violacoes WCAG em light + dark (com descricao via aria-describedby)", async () => {
      const { container } = render(
        <>
          <label htmlFor="age2">Idade</label>
          <Input
            id="age2"
            type="number"
            aria-describedby="age2-hint"
            defaultValue="30"
          />
          <span id="age2-hint">Entre 18 e 120 anos</span>
        </>,
      );
      await axeInThemes(container);
    });

    // AC-8 (error) — estado de erro com aria-invalid + mensagem associada.
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
          <span id="email-err">E-mail invalido</span>
        </>,
      );
      await axeInThemes(container);
    });

    // AC-8 (success) — mantido como cobertura adicional.
    it("nao tem violacoes WCAG em light + dark (state=success)", async () => {
      const { container } = render(
        <>
          <label htmlFor="code">Codigo</label>
          <Input id="code" state="success" defaultValue="OK" />
        </>,
      );
      await axeInThemes(container);
    });

    // AC-8 (disabled) — estado nao-interativo; verifica que o desabilitado
    // visual nao introduz violacao em nenhum dos temas.
    it("nao tem violacoes WCAG em light + dark (disabled)", async () => {
      const { container } = render(
        <>
          <label htmlFor="locked">Chave</label>
          <Input id="locked" disabled defaultValue="readonly-value" />
        </>,
      );
      await axeInThemes(container);
    });

    // AC-8 (readOnly) — atributo nativo readOnly nao deve quebrar a a11y.
    it("nao tem violacoes WCAG em light + dark (readOnly)", async () => {
      const { container } = render(
        <>
          <label htmlFor="ro-field">Codigo de barras</label>
          <Input id="ro-field" readOnly defaultValue="123-456-789" />
        </>,
      );
      await axeInThemes(container);
    });

    // AC-8 (type=email) — variante semantica de type passa sem violacao.
    it("nao tem violacoes WCAG em light + dark (type=email)", async () => {
      const { container } = render(
        <>
          <label htmlFor="email2">E-mail</label>
          <Input
            id="email2"
            type="email"
            autoComplete="email"
            defaultValue="ana@guardia.finance"
          />
        </>,
      );
      await axeInThemes(container);
    });
  });
});
