import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { Textarea } from "./index";
import { axeInThemes } from "@/test-utils/a11y";

// Cobertura do Plan #55 (Textarea v0.1.0 DoD migration). Cada teste carrega
// uma anotação AC-N apontando para docs/issues/issue-54/02-requirements.md.
// O DoD exige >= 20 testes comportamentais com queries acessíveis e jest-axe
// em light + dark; este arquivo cumpre ambos no mesmo conjunto, sem mockar
// colaboradores internos (consumidor real do <textarea> nativo via ...rest).

describe("Textarea", () => {
  // AC-1 (estrutura) — wrap em <div> para acomodar wrapper + counter.
  it("renderiza um <textarea> dentro de um wrapper <div>", () => {
    const { container } = render(<Textarea aria-label="t" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.tagName).toBe("DIV");
    expect(container.querySelector("textarea")).toBeInTheDocument();
  });

  // AC-1 (ref forwarding) — confirma que ref aponta para o <textarea> interno.
  it("ref aponta para o <textarea> (não pro wrapper) — compat com legado", () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<Textarea ref={ref} aria-label="ref" />);
    expect(ref.current?.tagName).toBe("TEXTAREA");
  });

  // AC-1 (ref.focus) — exercita ref.focus() e valida activeElement.
  it("ref.focus() move o foco para o textarea (document.activeElement)", () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<Textarea ref={ref} aria-label="campo" />);
    ref.current?.focus();
    expect(document.activeElement).toBe(ref.current);
  });

  // AC-10 (text typing + placeholder + uncontrolled) — caminho mais básico.
  it("aceita placeholder e digitação uncontrolled", async () => {
    render(<Textarea placeholder="Digite uma observação" />);
    const textarea = screen.getByPlaceholderText("Digite uma observação");
    await userEvent.type(textarea, "abc");
    expect(textarea).toHaveValue("abc");
  });

  // AC-10 (controlled) — value + onChange controlados pelo pai.
  it("controlled: value + onChange refletem o estado do pai", async () => {
    function Wrapper() {
      const [v, setV] = useState("");
      return (
        <Textarea
          aria-label="controlled"
          value={v}
          onChange={(e) => setV(e.target.value)}
        />
      );
    }
    render(<Wrapper />);
    const textarea = screen.getByRole("textbox", { name: "controlled" });
    await userEvent.type(textarea, "olá");
    expect(textarea).toHaveValue("olá");
  });

  // AC-10 (uncontrolled defaultValue) — DOM mantém estado próprio.
  it("uncontrolled: defaultValue inicializa e digitação avança o valor", async () => {
    render(<Textarea aria-label="uncontrolled" defaultValue="seed" />);
    const textarea = screen.getByRole("textbox", { name: "uncontrolled" });
    expect(textarea).toHaveValue("seed");
    await userEvent.type(textarea, "+x");
    expect(textarea).toHaveValue("seed+x");
  });

  // AC-2 (size variant sm) — classe utilitária distinta por tamanho.
  it("size=sm aplica min-h-[60px]", () => {
    const { container } = render(<Textarea size="sm" aria-label="sm" />);
    expect(container.firstChild).toHaveClass("min-h-[60px]");
  });

  // AC-2 (size variant md default).
  it("size=md (default) aplica min-h-[84px]", () => {
    const { container } = render(<Textarea aria-label="md" />);
    expect(container.firstChild).toHaveClass("min-h-[84px]");
  });

  // AC-2 (size variant lg).
  it("size=lg aplica min-h-[112px]", () => {
    const { container } = render(<Textarea size="lg" aria-label="lg" />);
    expect(container.firstChild).toHaveClass("min-h-[112px]");
  });

  // AC-3 (invalid shortcut) — `invalid` aplica state=error + aria-invalid.
  it("invalid=true aplica border destructive + aria-invalid no textarea", () => {
    const { container } = render(<Textarea invalid aria-label="inv" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/border-destructive/);
    expect(container.querySelector("textarea")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  // AC-3 (state=error explícito) — sem invalid também aplica.
  it("state=error sem invalid também aplica border destructive", () => {
    const { container } = render(<Textarea state="error" aria-label="err" />);
    expect(container.firstChild).toHaveClass("border-destructive");
  });

  // AC-3 (state=success).
  it("state=success aplica border signal-green", () => {
    const { container } = render(<Textarea state="success" aria-label="ok" />);
    expect(container.firstChild).toHaveClass("border-signal-green");
  });

  // AC-7 (disabled) — propaga para o textarea + marca data-disabled.
  it("disabled propaga para o textarea + marca data-disabled no wrapper", () => {
    const { container } = render(<Textarea disabled aria-label="d" />);
    expect(container.firstChild).toHaveAttribute("data-disabled", "true");
    expect(container.querySelector("textarea")).toBeDisabled();
  });

  // AC-10 (readOnly) — impede digitação, foco preservado.
  it("readOnly impede digitação mas mantém foco", async () => {
    render(<Textarea aria-label="ro" readOnly defaultValue="lock" />);
    const textarea = screen.getByRole("textbox", { name: "ro" });
    expect(textarea).toHaveAttribute("readonly");
    await userEvent.type(textarea, "abc");
    expect(textarea).toHaveValue("lock");
  });

  // AC-10 (required) — atributo nativo propagado.
  it("required propaga e marca o textarea como obrigatório", () => {
    render(<Textarea aria-label="req" required />);
    const textarea = screen.getByRole("textbox", { name: "req" });
    expect(textarea).toBeRequired();
  });

  // AC-10 (rows) — passa via ...rest.
  it("rows propaga para o <textarea>", () => {
    render(<Textarea aria-label="rows" rows={6} />);
    const textarea = screen.getByRole("textbox", { name: "rows" });
    expect(textarea).toHaveAttribute("rows", "6");
  });

  // AC-10 (maxLength) — limita digitação via atributo nativo.
  it("maxLength limita o número de caracteres digitados", async () => {
    render(<Textarea aria-label="ml" maxLength={3} />);
    const textarea = screen.getByRole("textbox", { name: "ml" });
    await userEvent.type(textarea, "abcdef");
    expect(textarea).toHaveValue("abc");
  });

  // AC-10 (name + autoComplete) — atributos nativos via ...rest.
  it("name e autoComplete passam para o textarea", () => {
    render(<Textarea aria-label="n" name="bio" autoComplete="off" />);
    const textarea = screen.getByRole("textbox", { name: "n" });
    expect(textarea).toHaveAttribute("name", "bio");
    expect(textarea).toHaveAttribute("autocomplete", "off");
  });

  // AC-10 (FormData integration) — name habilita serialização via FormData.
  it("integra com formulário via name + FormData", () => {
    let captured: FormData | null = null;
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          captured = new FormData(e.currentTarget);
        }}
      >
        <label htmlFor="fd-bio">Bio</label>
        <Textarea id="fd-bio" name="bio" defaultValue="contador" />
        <button type="submit">enviar</button>
      </form>,
    );
    screen.getByRole("button", { name: "enviar" }).click();
    expect(captured).not.toBeNull();
    expect((captured as unknown as FormData).get("bio")).toBe("contador");
  });

  // AC-10 (aria-describedby external) — não sobrescreve valor do consumidor.
  it("aria-describedby preserva valores externos", () => {
    render(<Textarea aria-label="d" aria-describedby="external" />);
    expect(screen.getByRole("textbox", { name: "d" })).toHaveAttribute(
      "aria-describedby",
      "external",
    );
  });

  // AC-10 (onChange) — handler dispara em cada mudança.
  it("onChange dispara nas mudanças", async () => {
    const onChange = vi.fn();
    render(<Textarea aria-label="oc" onChange={onChange} />);
    await userEvent.type(screen.getByRole("textbox", { name: "oc" }), "ab");
    expect(onChange).toHaveBeenCalled();
  });

  // AC-10 (onFocus + onBlur) — handlers via ...rest.
  it("onFocus e onBlur disparam quando o textarea ganha/perde foco", async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(
      <>
        <Textarea aria-label="fb" onFocus={onFocus} onBlur={onBlur} />
        <button type="button">outro</button>
      </>,
    );
    const textarea = screen.getByRole("textbox", { name: "fb" });
    await userEvent.click(textarea);
    expect(onFocus).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  // AC-10 (onKeyDown) — handler nativo via ...rest.
  it("onKeyDown dispara em teclas pressionadas", async () => {
    const onKeyDown = vi.fn();
    render(<Textarea aria-label="kd" onKeyDown={onKeyDown} />);
    const textarea = screen.getByRole("textbox", { name: "kd" });
    await userEvent.click(textarea);
    await userEvent.keyboard("a");
    expect(onKeyDown).toHaveBeenCalled();
  });

  // AC-6 (resize default vertical) — style.resize via prop default.
  it("resize default é 'vertical'", () => {
    const { container } = render(<Textarea aria-label="r" />);
    const textarea = container.querySelector("textarea")!;
    expect(textarea.style.resize).toBe("vertical");
  });

  // AC-6 (resize=none) — sobrescreve default.
  it("resize='none' aplica style.resize=none", () => {
    const { container } = render(<Textarea aria-label="rn" resize="none" />);
    expect(container.querySelector("textarea")!.style.resize).toBe("none");
  });

  // AC-6 (resize=both) — sobrescreve default.
  it("resize='both' aplica style.resize=both", () => {
    const { container } = render(<Textarea aria-label="rb" resize="both" />);
    expect(container.querySelector("textarea")!.style.resize).toBe("both");
  });

  // AC-5 + AC-6 (autoSize default desliga resize) — handle manual conflita.
  it("autoSize=true desliga resize por default (style.resize=none)", () => {
    const { container } = render(<Textarea aria-label="as" autoSize />);
    expect(container.querySelector("textarea")!.style.resize).toBe("none");
  });

  // AC-5 + AC-6 (autoSize + resize explícito) — consumidor sobrescreve.
  it("autoSize=true respeita resize explícito do consumidor", () => {
    const { container } = render(
      <Textarea aria-label="aso" autoSize resize="vertical" />,
    );
    expect(container.querySelector("textarea")!.style.resize).toBe("vertical");
  });

  // AC-5 (autoSize ajusta style.height) — mede scrollHeight e escreve.
  it("autoSize define style.height após render (jsdom: medida finita)", () => {
    const { container } = render(
      <Textarea aria-label="ash" autoSize defaultValue="linha 1\nlinha 2" />,
    );
    const textarea = container.querySelector("textarea")!;
    // jsdom retorna scrollHeight 0 — verificamos que `style.height` foi
    // tocado (a string não fica vazia após o useLayoutEffect rodar).
    expect(textarea.style.height).not.toBe("");
  });

  // AC-5 (autoSize cap não soma padding do wrapper) — Argos round 1 fix.
  // O cap deve ser exatamente lines × line-height; o wrapper padding não
  // entra (scrollHeight é medido no <textarea> que tem p-0).
  it("autoSize com maxRows usa cap = scrollHeight quando dentro do limite (sem padding)", () => {
    // Mock scrollHeight para um valor conhecido (40px = 2 linhas md de 22px,
    // bem abaixo do cap de maxRows=5 → cap=110). O resultado deve ser 40px,
    // NÃO 40+16 (sem somar VERTICAL_PADDING_BY_SIZE).
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "scrollHeight",
    );
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      get() {
        return 40;
      },
    });
    try {
      const { container } = render(
        <Textarea aria-label="cap" autoSize maxRows={5} defaultValue="ab" />,
      );
      const textarea = container.querySelector("textarea")!;
      expect(textarea.style.height).toBe("40px");
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(
          HTMLElement.prototype,
          "scrollHeight",
          originalDescriptor,
        );
      } else {
        delete (HTMLElement.prototype as unknown as Record<string, unknown>)
          .scrollHeight;
      }
    }
  });

  // AC-5 (autoSize cleanup ao desligar) — Argos round 1 fix. Ao alternar
  // autoSize de true → false o style inline (height + overflowY) deve ser
  // zerado para que o render seguinte comece limpo.
  it("autoSize ao desligar limpa style.height/overflowY inline", () => {
    function Toggle({ on }: { on: boolean }) {
      return (
        <Textarea
          aria-label="toggle"
          autoSize={on}
          maxRows={3}
          defaultValue="ab"
        />
      );
    }
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "scrollHeight",
    );
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      get() {
        return 50;
      },
    });
    try {
      const { container, rerender } = render(<Toggle on={true} />);
      const textarea = container.querySelector("textarea")!;
      // Com autoSize on, height inline foi gravado.
      expect(textarea.style.height).toBe("50px");
      expect(textarea.style.overflowY).toBe("hidden");
      // Desliga autoSize: cleanup deve limpar os inline styles.
      rerender(<Toggle on={false} />);
      expect(textarea.style.height).toBe("");
      expect(textarea.style.overflowY).toBe("");
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(
          HTMLElement.prototype,
          "scrollHeight",
          originalDescriptor,
        );
      } else {
        delete (HTMLElement.prototype as unknown as Record<string, unknown>)
          .scrollHeight;
      }
    }
  });

  // AC-4 (showCount sem maxLength) — exibe apenas o valor atual.
  it("showCount sem maxLength exibe apenas o count atual", async () => {
    function Wrapper() {
      const [v, setV] = useState("ab");
      return (
        <Textarea
          aria-label="c"
          showCount
          value={v}
          onChange={(e) => setV(e.target.value)}
        />
      );
    }
    const { container } = render(<Wrapper />);
    expect(container.textContent).toContain("2");
    await userEvent.type(screen.getByRole("textbox", { name: "c" }), "cd");
    expect(container.textContent).toContain("4");
  });

  // AC-4 (showCount + maxLength) — formato "n / max".
  it("showCount com maxLength exibe 'n / max'", () => {
    const { container } = render(
      <Textarea
        aria-label="cm"
        showCount
        maxLength={10}
        defaultValue="hello"
      />,
    );
    expect(container.textContent).toContain("5 / 10");
  });

  // AC-4 (counter é aria-hidden) — feedback puramente visual.
  it("contador renderiza com aria-hidden=true (feedback visual)", () => {
    const { container } = render(
      <Textarea aria-label="ah" showCount maxLength={5} defaultValue="abc" />,
    );
    const counter = container.querySelector("[aria-hidden='true']");
    expect(counter).not.toBeNull();
    expect(counter?.textContent).toContain("3 / 5");
  });

  // AC-8 (className wrapper + textareaClassName).
  it("className vai no wrapper, textareaClassName no textarea", () => {
    const { container } = render(
      <Textarea
        aria-label="cn"
        className="my-wrap"
        textareaClassName="my-ta"
      />,
    );
    expect(container.firstChild).toHaveClass("my-wrap");
    expect(container.querySelector("textarea")).toHaveClass("my-ta");
  });

  // AC-8 (wrapperClassName alias).
  it("wrapperClassName é alias de className (ambos somam)", () => {
    const { container } = render(
      <Textarea aria-label="al" className="a" wrapperClassName="b" />,
    );
    expect(container.firstChild).toHaveClass("a");
    expect(container.firstChild).toHaveClass("b");
  });

  // AC-11 — Cobertura a11y per Tech Task #125 e Plan #55 — todo componente
  // do design system valida `toHaveNoViolations()` em light + dark via
  // axeInThemes, que alterna data-theme no <html> antes de cada checagem.
  describe("a11y", () => {
    // AC-11 (default empty com label) — caso mínimo.
    it("não tem violações WCAG em light + dark (default empty, com label)", async () => {
      const { container } = render(
        <>
          <label htmlFor="ta-empty">Observação</label>
          <Textarea id="ta-empty" placeholder="Digite uma observação…" />
        </>,
      );
      await axeInThemes(container);
    });

    // AC-11 (default filled) — campo com conteúdo digitado.
    it("não tem violações WCAG em light + dark (default com valor)", async () => {
      const { container } = render(
        <>
          <label htmlFor="ta-filled">Bio</label>
          <Textarea
            id="ta-filled"
            defaultValue="Contador técnico com foco em conciliação."
          />
        </>,
      );
      await axeInThemes(container);
    });

    // AC-11 (with description) — wiring recomendado para hint via
    // aria-describedby (caminho recomendado por FormLayout.Field).
    it("não tem violações WCAG em light + dark (com descrição via aria-describedby)", async () => {
      const { container } = render(
        <>
          <label htmlFor="ta-desc">Bio</label>
          <Textarea
            id="ta-desc"
            aria-describedby="ta-desc-hint"
            defaultValue="texto"
          />
          <span id="ta-desc-hint">Use até 240 caracteres.</span>
        </>,
      );
      await axeInThemes(container);
    });

    // AC-11 (error + aria-invalid + describedby).
    it("não tem violações WCAG em light + dark (state=error, aria-invalid)", async () => {
      const { container } = render(
        <>
          <label htmlFor="ta-err">Bio</label>
          <Textarea
            id="ta-err"
            state="error"
            aria-invalid="true"
            aria-describedby="ta-err-msg"
            defaultValue="x"
          />
          <span id="ta-err-msg">Texto inválido.</span>
        </>,
      );
      await axeInThemes(container);
    });

    // AC-11 (success).
    it("não tem violações WCAG em light + dark (state=success)", async () => {
      const { container } = render(
        <>
          <label htmlFor="ta-ok">Revisão</label>
          <Textarea
            id="ta-ok"
            state="success"
            defaultValue="Revisado e aprovado pelo contador."
          />
        </>,
      );
      await axeInThemes(container);
    });

    // AC-11 (disabled) — estado não-interativo.
    it("não tem violações WCAG em light + dark (disabled)", async () => {
      const { container } = render(
        <>
          <label htmlFor="ta-disabled">Travado</label>
          <Textarea
            id="ta-disabled"
            disabled
            defaultValue="Campo travado durante exportação."
          />
        </>,
      );
      await axeInThemes(container);
    });

    // AC-11 (readOnly) — atributo nativo não deve quebrar a a11y.
    it("não tem violações WCAG em light + dark (readOnly)", async () => {
      const { container } = render(
        <>
          <label htmlFor="ta-ro">Conteúdo</label>
          <Textarea id="ta-ro" readOnly defaultValue="leitura apenas" />
        </>,
      );
      await axeInThemes(container);
    });

    // AC-11 (showCount + maxLength) — contador aria-hidden não deve
    // introduzir violação.
    it("não tem violações WCAG em light + dark (showCount + maxLength)", async () => {
      const { container } = render(
        <>
          <label htmlFor="ta-count">Bio</label>
          <Textarea
            id="ta-count"
            showCount
            maxLength={240}
            defaultValue="Contador técnico."
          />
        </>,
      );
      await axeInThemes(container);
    });
  });
});
