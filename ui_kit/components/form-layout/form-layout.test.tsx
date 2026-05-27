import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { axeInThemes } from "@/test-utils/a11y";

import { FormLayout } from "./index";

describe("FormLayout — root", () => {
  it("renderiza como <form> por default", () => {
    const { container } = render(<FormLayout>x</FormLayout>);
    expect(container.querySelector("form")).toBeInTheDocument();
  });

  it("aceita as=\"div\"", () => {
    const { container } = render(<FormLayout as="div">x</FormLayout>);
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("expõe data-form-variant e data-form-density", () => {
    const { container } = render(
      <FormLayout variant="split" density="compact">
        x
      </FormLayout>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute("data-form-variant", "split");
    expect(root).toHaveAttribute("data-form-density", "compact");
  });

  it("comfy aplica gap-8 (32px), compact aplica gap-5 (20px)", () => {
    const { rerender, container } = render(<FormLayout>x</FormLayout>);
    expect(container.firstChild).toHaveClass("gap-8");
    rerender(<FormLayout density="compact">x</FormLayout>);
    expect(container.firstChild).toHaveClass("gap-5");
  });

  it("encaminha props nativas de form (onSubmit, name)", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <FormLayout name="empresa" onSubmit={onSubmit}>
        <button type="submit">Enviar</button>
      </FormLayout>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onSubmit).toHaveBeenCalled();
  });
});

describe("FormLayout.Header", () => {
  it("renderiza title como h2 e description como p", () => {
    render(
      <FormLayout>
        <FormLayout.Header
          title="Editar empresa"
          description="Atualize os dados de cadastro"
        />
      </FormLayout>,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Editar empresa",
    );
    expect(screen.getByText("Atualize os dados de cadastro")).toBeInTheDocument();
  });

  it("renderiza actions slot quando passado", () => {
    render(
      <FormLayout>
        <FormLayout.Header
          title="X"
          actions={<button type="button">Ajuda</button>}
        />
      </FormLayout>,
    );
    expect(screen.getByRole("button", { name: "Ajuda" })).toBeInTheDocument();
  });

  it("aceita children adicional dentro do header text", () => {
    render(
      <FormLayout>
        <FormLayout.Header title="X">
          <span data-testid="custom">extra</span>
        </FormLayout.Header>
      </FormLayout>,
    );
    expect(screen.getByTestId("custom")).toHaveTextContent("extra");
  });
});

describe("FormLayout.Section", () => {
  it("renderiza title como h3 e description", () => {
    render(
      <FormLayout>
        <FormLayout.Section
          title="Dados gerais"
          description="Informações fiscais e cadastrais"
        >
          <div>x</div>
        </FormLayout.Section>
      </FormLayout>,
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Dados gerais",
    );
    expect(
      screen.getByText("Informações fiscais e cadastrais"),
    ).toBeInTheDocument();
  });

  it("variant=split renderiza grid 2-coluna no desktop", () => {
    const { container } = render(
      <FormLayout variant="split">
        <FormLayout.Section title="A">
          <div>x</div>
        </FormLayout.Section>
      </FormLayout>,
    );
    const section = container.querySelector("section")!;
    expect(section.className).toMatch(/grid/);
    /* split usa grid-cols-[minmax(180px,280px)_minmax(0,1fr)] no md+ */
    expect(section.className).toMatch(/md:grid-cols/);
  });

  it("aside aparece no canto da seção", () => {
    render(
      <FormLayout>
        <FormLayout.Section title="X" aside={<a href="/aside-link">link</a>}>
          <div>y</div>
        </FormLayout.Section>
      </FormLayout>,
    );
    expect(screen.getByRole("link", { name: "link" })).toBeInTheDocument();
  });
});

describe("FormLayout.Row", () => {
  it("aplica grid-template-columns conforme cols", () => {
    const { container } = render(
      <FormLayout>
        <FormLayout.Row cols={3}>x</FormLayout.Row>
      </FormLayout>,
    );
    const row = container.querySelector("[data-form-row-cols='3']") as HTMLElement;
    expect(row.style.gridTemplateColumns).toMatch(/repeat\(3/);
  });

  it("default = 12 colunas", () => {
    const { container } = render(
      <FormLayout>
        <FormLayout.Row>x</FormLayout.Row>
      </FormLayout>,
    );
    const row = container.querySelector("[data-form-row-cols='12']") as HTMLElement;
    expect(row.style.gridTemplateColumns).toMatch(/repeat\(12/);
  });

  it("gap explícito sobrescreve o default da densidade", () => {
    const { container } = render(
      <FormLayout>
        <FormLayout.Row gap={24}>x</FormLayout.Row>
      </FormLayout>,
    );
    const row = container.querySelector("[data-form-row-cols]") as HTMLElement;
    expect(row.style.gap).toBe("24px");
  });
});

describe("FormLayout.Field", () => {
  it("renderiza label clicável associada ao input via htmlFor", async () => {
    render(
      <FormLayout>
        <FormLayout.Field label="Nome" htmlFor="nome-input">
          <input type="text" />
        </FormLayout.Field>
      </FormLayout>,
    );
    const label = screen.getByText("Nome");
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", "nome-input");
    /* Field deve injetar id no child input */
    expect(screen.getByRole("textbox")).toHaveAttribute("id", "nome-input");
  });

  it("required mostra asterisco e mantém label clicável", () => {
    render(
      <FormLayout>
        <FormLayout.Field label="CNPJ" required htmlFor="cnpj">
          <input />
        </FormLayout.Field>
      </FormLayout>,
    );
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  });

  it("optional mostra (opcional) quando required=false", () => {
    render(
      <FormLayout>
        <FormLayout.Field label="Nome fantasia" optional htmlFor="x">
          <input />
        </FormLayout.Field>
      </FormLayout>,
    );
    expect(screen.getByText("(opcional)")).toBeInTheDocument();
  });

  it("required esconde optional mesmo se ambos passados", () => {
    render(
      <FormLayout>
        <FormLayout.Field label="X" required optional htmlFor="x">
          <input />
        </FormLayout.Field>
      </FormLayout>,
    );
    expect(screen.queryByText("(opcional)")).not.toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("hint renderiza com aria-describedby ligado ao child", () => {
    render(
      <FormLayout>
        <FormLayout.Field label="X" hint="Apenas dígitos" htmlFor="x">
          <input />
        </FormLayout.Field>
      </FormLayout>,
    );
    const input = screen.getByRole("textbox");
    const hintId = input.getAttribute("aria-describedby");
    expect(hintId).toBeTruthy();
    expect(document.getElementById(hintId!)).toHaveTextContent("Apenas dígitos");
  });

  it("error sobrescreve o hint e adiciona aria-invalid no child", () => {
    render(
      <FormLayout>
        <FormLayout.Field
          label="X"
          hint="Apenas dígitos"
          error="Campo obrigatório"
          htmlFor="x"
        >
          <input />
        </FormLayout.Field>
      </FormLayout>,
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    /* aria-describedby deve apontar pro errId, não pro hintId */
    const id = input.getAttribute("aria-describedby");
    expect(document.getElementById(id!)).toHaveTextContent("Campo obrigatório");
    expect(screen.queryByText("Apenas dígitos")).not.toBeInTheDocument();
  });

  it("error renderiza com role=alert", () => {
    render(
      <FormLayout>
        <FormLayout.Field label="X" error="Erro!" htmlFor="x">
          <input />
        </FormLayout.Field>
      </FormLayout>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Erro!");
  });

  it("Field com error injeta `invalid` no child (compat com Input/Combobox)", () => {
    function FakeInput(props: { invalid?: boolean }) {
      return (
        <input
          data-invalid={props.invalid ? "true" : undefined}
          data-testid="fake"
        />
      );
    }
    render(
      <FormLayout>
        <FormLayout.Field label="X" error="bad" htmlFor="x">
          <FakeInput />
        </FormLayout.Field>
      </FormLayout>,
    );
    expect(screen.getByTestId("fake")).toHaveAttribute("data-invalid", "true");
  });

  it("preserva aria-describedby pré-existente do child", () => {
    render(
      <FormLayout>
        <FormLayout.Field label="X" hint="dica" htmlFor="x">
          <input aria-describedby="external" />
        </FormLayout.Field>
      </FormLayout>,
    );
    const ids = screen.getByRole("textbox").getAttribute("aria-describedby")!;
    expect(ids.split(/\s+/)).toContain("external");
  });

  it("não injeta nada quando há múltiplos children", () => {
    render(
      <FormLayout>
        <FormLayout.Field label="X" htmlFor="x">
          <input />
          <span>extra</span>
        </FormLayout.Field>
      </FormLayout>,
    );
    /* Sem injection: o input não tem id auto */
    expect(screen.getByRole("textbox").id).toBe("");
  });

  it("span aplica gridColumn span", () => {
    const { container } = render(
      <FormLayout>
        <FormLayout.Row cols={12}>
          <FormLayout.Field label="X" span={6} htmlFor="x">
            <input />
          </FormLayout.Field>
        </FormLayout.Row>
      </FormLayout>,
    );
    const field = container.querySelector("[data-form-field-error]") || container.querySelectorAll("div")[3];
    /* Buscar a div do field — vai ter style gridColumn */
    const fields = Array.from(container.querySelectorAll("div")).filter((d) =>
      (d as HTMLElement).style.gridColumn?.includes("span 6"),
    );
    expect(fields.length).toBeGreaterThan(0);
  });

  it("labelAside aparece à direita do label", () => {
    render(
      <FormLayout>
        <FormLayout.Field
          label="Descrição"
          labelAside="Máx. 80 caracteres"
          htmlFor="x"
        >
          <input />
        </FormLayout.Field>
      </FormLayout>,
    );
    expect(screen.getByText("Máx. 80 caracteres")).toBeInTheDocument();
  });
});

describe("FormLayout.Actions", () => {
  it("renderiza botões com align=end por default", () => {
    const { container } = render(
      <FormLayout>
        <FormLayout.Actions>
          <button>Cancelar</button>
          <button>Salvar</button>
        </FormLayout.Actions>
      </FormLayout>,
    );
    const actions = container.querySelector(".justify-end");
    expect(actions).toBeInTheDocument();
  });

  it("align=between aplica justify-between", () => {
    const { container } = render(
      <FormLayout>
        <FormLayout.Actions align="between">
          <button>A</button>
          <button>B</button>
        </FormLayout.Actions>
      </FormLayout>,
    );
    expect(container.querySelector(".justify-between")).toBeInTheDocument();
  });

  it("sticky aplica position sticky bottom", () => {
    const { container } = render(
      <FormLayout>
        <FormLayout.Actions sticky>
          <button>X</button>
        </FormLayout.Actions>
      </FormLayout>,
    );
    const actions = container.querySelector(".sticky") as HTMLElement;
    expect(actions).toBeInTheDocument();
    expect(actions.className).toMatch(/bottom-0/);
  });
});

describe("FormLayout.Divider", () => {
  it("renderiza <hr> com aria-hidden", () => {
    const { container } = render(
      <FormLayout>
        <FormLayout.Divider />
      </FormLayout>,
    );
    const hr = container.querySelector("hr");
    expect(hr).toBeInTheDocument();
    expect(hr).toHaveAttribute("aria-hidden", "true");
  });
});

/* ============================================================
 * AC-4 — Submissão de formulário e integração com atributos
 * nativos do <form>. FormLayout é layout primitive, mas envolve
 * um <form>: precisa propagar onSubmit, encaminhar atributos
 * nativos (noValidate, name) e suportar reset.
 * ========================================================== */
describe("FormLayout — submission + native form integration (AC-4)", () => {
  it("AC-4: submissão via clique em <button type=\"submit\"> dispara onSubmit do form", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const user = userEvent.setup();
    render(
      <FormLayout onSubmit={onSubmit}>
        <FormLayout.Field label="Nome" htmlFor="s-nome">
          <input name="nome" defaultValue="ACME" />
        </FormLayout.Field>
        <button type="submit">Salvar</button>
      </FormLayout>,
    );
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("AC-4: submissão via Enter em um input dispara onSubmit do form (implicit submission)", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const user = userEvent.setup();
    render(
      <FormLayout onSubmit={onSubmit}>
        <FormLayout.Field label="Email" htmlFor="s-email">
          <input type="email" defaultValue="x@guardia.com" />
        </FormLayout.Field>
        <button type="submit">Entrar</button>
      </FormLayout>,
    );
    await user.type(screen.getByLabelText("Email"), "{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("AC-4: encaminha noValidate para o <form> nativo", () => {
    const { container } = render(
      <FormLayout noValidate>
        <input type="email" />
      </FormLayout>,
    );
    const form = container.querySelector("form") as HTMLFormElement;
    expect(form).toBeInTheDocument();
    expect(form.noValidate).toBe(true);
  });

  it("AC-4: encaminha action + method ao <form> nativo", () => {
    const { container } = render(
      <FormLayout action="/api/empresas" method="post">
        x
      </FormLayout>,
    );
    const form = container.querySelector("form") as HTMLFormElement;
    expect(form).toHaveAttribute("action", "/api/empresas");
    expect(form).toHaveAttribute("method", "post");
  });

  it("AC-4: as=\"div\" não cria <form>; onSubmit não é encaminhado", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <FormLayout as="div" onSubmit={onSubmit}>
        <button type="submit">Enviar</button>
      </FormLayout>,
    );
    expect(container.querySelector("form")).toBeNull();
    await user.click(screen.getByRole("button"));
    /* O div não submete; clicar no botão type=submit fora de <form> é no-op */
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

/* ============================================================
 * AC-4 — Composição com <fieldset>/<legend> e cascade de disabled.
 * FormLayout é layout primitive; consumidores agrupam campos via
 * <fieldset><legend>...</legend>...</fieldset> nativo. Este bloco
 * confirma que (i) o agrupamento expõe role="group" com nome
 * acessível derivado do <legend>; (ii) fieldset[disabled] cascateia
 * disabled aos controles nativos descendentes via comportamento
 * nativo do browser (jsdom respeita HTML5 form-associated semantics).
 * ========================================================== */
describe("FormLayout — fieldset/legend grouping + disabled cascade (AC-4)", () => {
  it("AC-4: <fieldset><legend> em volta de Fields renderiza role=group com nome acessível", () => {
    render(
      <FormLayout>
        <FormLayout.Section>
          <fieldset>
            <legend>Endereço comercial</legend>
            <FormLayout.Field label="CEP" htmlFor="g-cep">
              <input />
            </FormLayout.Field>
            <FormLayout.Field label="Logradouro" htmlFor="g-log">
              <input />
            </FormLayout.Field>
          </fieldset>
        </FormLayout.Section>
      </FormLayout>,
    );
    const group = screen.getByRole("group", { name: "Endereço comercial" });
    expect(group).toBeInTheDocument();
    /* Campos do grupo permanecem acessíveis via label */
    expect(within(group).getByLabelText("CEP")).toBeInTheDocument();
    expect(within(group).getByLabelText("Logradouro")).toBeInTheDocument();
  });

  it("AC-4: <fieldset disabled> cascateia disabled aos inputs descendentes (HTML nativo)", () => {
    render(
      <FormLayout>
        <fieldset disabled>
          <legend>Dados bancários</legend>
          <FormLayout.Field label="Banco" htmlFor="d-banco">
            <input />
          </FormLayout.Field>
          <FormLayout.Field label="Agência" htmlFor="d-ag">
            <input />
          </FormLayout.Field>
        </fieldset>
      </FormLayout>,
    );
    /* Cada input descendente deve estar :disabled via cascade do fieldset */
    expect(screen.getByLabelText("Banco")).toBeDisabled();
    expect(screen.getByLabelText("Agência")).toBeDisabled();
  });

  it("AC-4: input dentro de fieldset disabled não responde a userEvent.type", async () => {
    const user = userEvent.setup();
    render(
      <FormLayout>
        <fieldset disabled>
          <legend>Bloqueado</legend>
          <FormLayout.Field label="Campo" htmlFor="dc-x">
            <input />
          </FormLayout.Field>
        </fieldset>
      </FormLayout>,
    );
    const input = screen.getByLabelText("Campo") as HTMLInputElement;
    await user.type(input, "abc");
    expect(input.value).toBe("");
  });
});

/* ============================================================
 * AC-4 — Pass-through controlado vs não-controlado para o child.
 * FormLayout.Field injeta id/aria-describedby/aria-invalid no único
 * child, mas DEVE preservar value, defaultValue, onChange, e o
 * próprio id do child quando passado explicitamente.
 * ========================================================== */
describe("FormLayout.Field — pass-through controlado vs não-controlado (AC-4)", () => {
  it("AC-4: defaultValue do child (uncontrolled) é preservado após injection", () => {
    render(
      <FormLayout>
        <FormLayout.Field label="Razão social" htmlFor="u-rs">
          <input defaultValue="ACME LTDA" />
        </FormLayout.Field>
      </FormLayout>,
    );
    const input = screen.getByLabelText("Razão social") as HTMLInputElement;
    expect(input.value).toBe("ACME LTDA");
  });

  it("AC-4: value + onChange do child (controlled) são preservados; digitação atualiza o estado", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [v, setV] = React.useState("");
      return (
        <FormLayout>
          <FormLayout.Field label="Email" htmlFor="c-email">
            <input value={v} onChange={(e) => setV(e.target.value)} />
          </FormLayout.Field>
        </FormLayout>
      );
    }
    render(<Controlled />);
    const input = screen.getByLabelText("Email") as HTMLInputElement;
    await user.type(input, "ana@guardia.com");
    expect(input.value).toBe("ana@guardia.com");
  });

  it("AC-4: child com id explícito tem o id preservado (não é sobrescrito pelo htmlFor)", () => {
    render(
      <FormLayout>
        <FormLayout.Field label="Externo" htmlFor="ignored-id">
          <input id="my-own-id" />
        </FormLayout.Field>
      </FormLayout>,
    );
    /* Label aponta para o htmlFor; child mantém seu próprio id */
    const input = document.getElementById("my-own-id") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    /* Sanity: input ainda é alcançável via tagName */
    expect(input.tagName).toBe("INPUT");
  });
});

/* ============================================================
 * AC-5 — A11y (jest-axe) em light + dark.
 *
 * Matriz de cenários cobrindo as superfícies acessíveis do layout
 * primitive: empty Default, fields filled, erro visível, fieldset
 * disabled, fieldset/legend grouping, required-field semantics.
 * Cada cenário corre `axeInThemes(container)` que alterna
 * `data-theme={light|dark}` e roda `toHaveNoViolations()` em cada
 * tema (per Tech Task #125 + lex-frontend-accessibility).
 * ========================================================== */
describe("a11y (jest-axe — light + dark) (AC-5)", () => {
  it("AC-5: sem violações WCAG 2.1 AA no Default vazio (Header + Section + Field)", async () => {
    const { container } = render(
      <FormLayout>
        <FormLayout.Header
          title="Cadastrar empresa"
          description="Preencha os dados básicos"
        />
        <FormLayout.Section title="Identificação">
          <FormLayout.Field label="CNPJ" htmlFor="a-cnpj">
            <input />
          </FormLayout.Field>
        </FormLayout.Section>
      </FormLayout>,
    );
    await axeInThemes(container);
  });

  it("AC-5: sem violações WCAG 2.1 AA com campos preenchidos (Row 12-col)", async () => {
    const { container } = render(
      <FormLayout>
        <FormLayout.Header title="Editar empresa" />
        <FormLayout.Section title="Dados gerais">
          <FormLayout.Row cols={12}>
            <FormLayout.Field label="CNPJ" span={6} htmlFor="a-cnpj2">
              <input defaultValue="12.345.678/0001-90" />
            </FormLayout.Field>
            <FormLayout.Field label="Razão social" span={6} htmlFor="a-rs">
              <input defaultValue="ACME LTDA" />
            </FormLayout.Field>
          </FormLayout.Row>
        </FormLayout.Section>
      </FormLayout>,
    );
    await axeInThemes(container);
  });

  it("AC-5: sem violações WCAG 2.1 AA com erro visível (role=alert + aria-invalid)", async () => {
    const { container } = render(
      <FormLayout>
        <FormLayout.Field
          label="CNPJ"
          required
          htmlFor="a-cnpj-err"
          error="CNPJ inválido — verifique os dígitos"
        >
          <input defaultValue="00.000.000/0001-X" />
        </FormLayout.Field>
      </FormLayout>,
    );
    await axeInThemes(container);
  });

  it("AC-5: sem violações WCAG 2.1 AA com fieldset disabled cascade", async () => {
    const { container } = render(
      <FormLayout>
        <fieldset disabled>
          <legend>Dados bancários</legend>
          <FormLayout.Field label="Banco" htmlFor="a-banco">
            <input />
          </FormLayout.Field>
          <FormLayout.Field label="Agência" htmlFor="a-ag">
            <input />
          </FormLayout.Field>
        </fieldset>
      </FormLayout>,
    );
    await axeInThemes(container);
  });

  it("AC-5: sem violações WCAG 2.1 AA com fieldset/legend grouping (role=group)", async () => {
    const { container } = render(
      <FormLayout>
        <FormLayout.Section title="Endereço">
          <fieldset>
            <legend>Endereço comercial</legend>
            <FormLayout.Field label="CEP" htmlFor="a-cep">
              <input />
            </FormLayout.Field>
            <FormLayout.Field label="Logradouro" htmlFor="a-log">
              <input />
            </FormLayout.Field>
          </fieldset>
        </FormLayout.Section>
      </FormLayout>,
    );
    await axeInThemes(container);
  });

  it("AC-5: sem violações WCAG 2.1 AA na variante split com Section description", async () => {
    const { container } = render(
      <FormLayout variant="split">
        <FormLayout.Section
          title="Contato"
          description="Email principal para alertas operacionais"
        >
          <FormLayout.Field label="Email" required hint="Usado em login" htmlFor="a-email">
            <input type="email" />
          </FormLayout.Field>
        </FormLayout.Section>
      </FormLayout>,
    );
    await axeInThemes(container);
  });
});
