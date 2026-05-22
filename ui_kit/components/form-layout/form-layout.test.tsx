import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
