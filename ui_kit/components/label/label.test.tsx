import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { axeInThemes } from "@/test-utils/a11y";
import { Label } from "./index";

describe("<Label />", () => {
  // ────────────────────────────────────────────────────────────────
  // AC-3 — Testes de unidade comportamentais (≥ 20 testes, queries
  // acessíveis, sem mocks de colaboradores internos).
  // ────────────────────────────────────────────────────────────────

  // AC-3: renderiza children dentro de um <label>
  it("renders its children as a <label>", () => {
    render(<Label>Email</Label>);
    const label = screen.getByText("Email");
    expect(label).toBeInTheDocument();
    // Radix LabelPrimitive renderiza um <label>
    expect(label.closest("label")).not.toBeNull();
  });

  // AC-3: associa-se a um input via htmlFor (semântica HTML)
  it("associates with an input via htmlFor", () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("id", "email");
  });

  // AC-3: aplica size sm por default
  it("applies default size (sm)", () => {
    render(<Label data-testid="lbl">Nome</Label>);
    expect(screen.getByTestId("lbl")).toHaveClass("text-[12.5px]");
  });

  // AC-3: aplica size md quando especificado
  it("applies md size", () => {
    render(
      <Label size="md" data-testid="lbl">
        Nome
      </Label>,
    );
    expect(screen.getByTestId("lbl")).toHaveClass("text-sm");
  });

  // AC-3: renderiza asterisco quando required=true
  it("renders required asterisk when required=true", () => {
    render(<Label required>Email</Label>);
    const star = screen.getByText("*");
    expect(star).toBeInTheDocument();
    expect(star).toHaveAttribute("aria-hidden", "true");
    expect(star).toHaveClass("text-destructive");
  });

  // AC-3: sem asterisco quando required ausente (negative guard)
  it("does not render asterisk without required", () => {
    render(<Label>Email</Label>);
    expect(screen.queryByText("*")).toBeNull();
  });

  // AC-3: renderiza "(opcional)" quando optional=true
  it("renders '(opcional)' when optional=true", () => {
    render(<Label optional>Telefone</Label>);
    expect(screen.getByText("(opcional)")).toBeInTheDocument();
  });

  // AC-3: aceita optionalLabel customizado
  it("accepts a custom optionalLabel", () => {
    render(
      <Label optional optionalLabel="(se preferir)">
        Telefone
      </Label>,
    );
    expect(screen.getByText("(se preferir)")).toBeInTheDocument();
  });

  // AC-3: data-required e data-optional refletem props
  it("exposes data-required and data-optional", () => {
    render(
      <Label required data-testid="r">
        Nome
      </Label>,
    );
    expect(screen.getByTestId("r")).toHaveAttribute("data-required", "true");
    expect(screen.getByTestId("r")).not.toHaveAttribute("data-optional");
  });

  // AC-3: className do consumidor é mesclado com as classes base
  it("merges className", () => {
    render(
      <Label className="uppercase" data-testid="lbl">
        X
      </Label>,
    );
    expect(screen.getByTestId("lbl")).toHaveClass("uppercase");
    expect(screen.getByTestId("lbl")).toHaveClass("font-semibold");
  });

  // AC-3: ref encaminhado para o elemento <label> real
  it("forwards the ref to the label element", () => {
    const ref = { current: null as HTMLLabelElement | null };
    render(<Label ref={ref}>X</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  // AC-3: getByText resolve mesmo quando children fica em <span>
  // interno do componente — guarda contra regressão na estrutura DOM.
  it("AC-3: child text is reachable via getByText regardless of internal span", () => {
    render(<Label>Senha</Label>);
    expect(screen.getByText("Senha")).toBeInTheDocument();
  });

  // AC-3: query acessível via getByLabelText alcança o input associado
  it("AC-3: getByLabelText reaches the associated input by visible label", () => {
    render(
      <>
        <Label htmlFor="pwd">Senha</Label>
        <input id="pwd" type="password" />
      </>,
    );
    const input = screen.getByLabelText("Senha") as HTMLInputElement;
    expect(input.type).toBe("password");
  });

  // AC-3: clicar no Label foca o input associado (interação real do
  // usuário, sem mock; semântica HTML <label htmlFor> + jsdom).
  it("AC-3: clicking the Label focuses the associated input", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Label htmlFor="username">Usuário</Label>
        <input id="username" />
      </>,
    );
    await user.click(screen.getByText("Usuário"));
    expect(document.activeElement).toBe(screen.getByLabelText("Usuário"));
  });

  // AC-3: required + optional simultâneos — ambos visíveis, sem colisão
  it("AC-3: required and optional render simultaneously without collision", () => {
    render(
      <Label required optional>
        Documento
      </Label>,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByText("(opcional)")).toBeInTheDocument();
  });

  // AC-3: optional=true sem optionalLabel customizado usa o default
  // "(opcional)" — guarda o valor canônico exibido para o usuário.
  it("AC-3: default optionalLabel is '(opcional)' when not provided", () => {
    render(<Label optional>Telefone</Label>);
    expect(screen.getByText("(opcional)")).toBeInTheDocument();
  });

  // AC-3: aceita ReactNode complexo como children (não apenas string)
  it("AC-3: accepts complex ReactNode children", () => {
    render(
      <Label>
        <strong>Importante</strong>
      </Label>,
    );
    const strong = screen.getByText("Importante");
    expect(strong.tagName).toBe("STRONG");
    expect(strong.closest("label")).not.toBeNull();
  });

  // AC-3: atributo data-slot="label" sempre presente (contrato com
  // CSS / DS — outros componentes podem alvejar [data-slot=label]).
  it("AC-3: always exposes data-slot='label' attribute", () => {
    render(<Label data-testid="lbl">X</Label>);
    expect(screen.getByTestId("lbl")).toHaveAttribute("data-slot", "label");
  });

  // AC-3: sem required E sem optional, nenhum sufixo nem asterisco no
  // DOM (negative guard que falha se alguém inverter o default das flags).
  it("AC-3: without required and without optional, no suffix nor asterisk", () => {
    render(<Label>Nome</Label>);
    expect(screen.queryByText("*")).toBeNull();
    expect(screen.queryByText("(opcional)")).toBeNull();
  });

  // AC-3: spread de props HTML extras (aria-describedby) sobrevive ao
  // Radix Root, garantindo composição com FormField / mensagens de erro.
  it("AC-3: forwards extra HTML props (aria-describedby) to the label root", () => {
    render(
      <Label aria-describedby="help" data-testid="lbl">
        Email
      </Label>,
    );
    expect(screen.getByTestId("lbl")).toHaveAttribute(
      "aria-describedby",
      "help",
    );
  });

  // ────────────────────────────────────────────────────────────────
  // AC-4 — A11y (jest-axe) em light + dark via axeInThemes().
  // Cenários: (a) Default, (b) interativo principal (required + focus),
  // (c) disabled (input associado disabled — Label propaga peer-disabled).
  // ────────────────────────────────────────────────────────────────

  // AC-4 (a) Default — Label associado a input simples
  it("AC-4: a11y — default Label associated with input — light + dark", async () => {
    const { container } = render(
      <>
        <Label htmlFor="email-axe-default">Email</Label>
        <input
          id="email-axe-default"
          type="email"
          placeholder="voce@dominio.com"
        />
      </>,
    );
    await axeInThemes(container);
  });

  // AC-4 (b) Estado interativo principal — Label com required + input focado
  it("AC-4: a11y — required Label with focused input — light + dark", async () => {
    const { container } = render(
      <>
        <Label htmlFor="name-axe-required" required>
          Nome completo
        </Label>
        <input id="name-axe-required" type="text" aria-required="true" />
      </>,
    );
    // Foca o input imperativamente — equivalente ao estado interativo
    // principal, sem usar `autoFocus` (bloqueado por jsx-a11y/no-autofocus
    // pois reduz usabilidade em produção; o foco aqui é controlado pelo teste).
    // Query por role evita a colisão do asterisco no nome acessível do label.
    (screen.getByRole("textbox") as HTMLInputElement).focus();
    await axeInThemes(container);
  });

  // AC-4 (c) disabled aplicável — input controlado disabled associado
  // ao Label. O Label propaga `peer-disabled:opacity-70` via tailwind
  // quando o input irmão tem a classe `peer` e está disabled.
  it("AC-4: a11y — Label associated with disabled input — light + dark", async () => {
    const { container } = render(
      <>
        <Label htmlFor="email-axe-disabled" optional>
          Email
        </Label>
        <input
          id="email-axe-disabled"
          type="email"
          className="peer"
          disabled
          aria-disabled="true"
        />
      </>,
    );
    await axeInThemes(container);
  });
});
