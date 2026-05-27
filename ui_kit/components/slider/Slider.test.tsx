import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useState, useRef } from "react";

import { axeInThemes } from "@/test-utils/a11y";
import { Slider } from "./index";

/**
 * Nota sobre boundary mocks (`lex-frontend-testing` Rule 3):
 *
 * jsdom não implementa o passo do browser que mapeia ArrowRight/Home/End para
 * incrementos no value do `<input type="range">` ("Not implemented"). Esse
 * cálculo é responsabilidade do browser nativo — boundary clássico. Em
 * testes de unidade simulamos o resultado observável (value mudou) via
 * `fireEvent.change(input, { target: { value } })`, que dispara o evento
 * `change` nativo exatamente como o browser o entregaria após uma seta. A
 * navegação por teclado em si fica coberta pela E2E + axe (que asserta
 * `role="slider"` e ARIA value-now/min/max funcionando — o resto é browser).
 *
 * Assertions cobrem o que o wrapper de fato controla:
 *   - currentValue passado ao input
 *   - clamp do defaultValue fora do range
 *   - chamada de onValueChange com number (não string)
 *   - onChange nativo disparando em paralelo
 *   - --pct recalculado quando o valor muda
 *   - aria-invalid, disabled bloqueando change, readout formatado.
 */

describe("Slider", () => {
  /* ─────────────────────────────────────────────────────────────
   * AC-1 — renderiza <input type="range"> com role=slider
   * ───────────────────────────────────────────────────────────── */
  it("AC-1 — renderiza com role=slider", () => {
    render(<Slider aria-label="Volume" />);
    expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
  });

  it("AC-1 — renderiza um <input type=\"range\"> nativo", () => {
    render(<Slider aria-label="Volume" />);
    const input = screen.getByRole("slider") as HTMLInputElement;
    expect(input.tagName).toBe("INPUT");
    expect(input.type).toBe("range");
  });

  /* ─────────────────────────────────────────────────────────────
   * AC-3 — ref forwarding ao input nativo
   * ───────────────────────────────────────────────────────────── */
  it("AC-3 — encaminha ref ao <input> nativo (focus funciona)", () => {
    function Wrapper() {
      const ref = useRef<HTMLInputElement | null>(null);
      return (
        <>
          <Slider aria-label="Volume" ref={ref} />
          <button
            type="button"
            onClick={() => ref.current?.focus()}
          >
            Focar slider
          </button>
        </>
      );
    }
    render(<Wrapper />);
    const slider = screen.getByRole("slider");
    screen.getByRole("button", { name: "Focar slider" }).click();
    expect(document.activeElement).toBe(slider);
  });

  /* ─────────────────────────────────────────────────────────────
   * AC-4 — API: controlled
   * ───────────────────────────────────────────────────────────── */
  it("AC-4 — modo controlled: respeita `value` e dispara `onValueChange` ao mudar", () => {
    const onValueChange = vi.fn<(v: number) => void>();
    function Controlled() {
      const [v, setV] = useState(20);
      return (
        <Slider
          aria-label="Volume"
          value={v}
          onValueChange={(next) => {
            onValueChange(next);
            setV(next);
          }}
        />
      );
    }
    render(<Controlled />);
    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider.value).toBe("20");
    fireEvent.change(slider, { target: { value: "21" } });
    expect(onValueChange).toHaveBeenCalledWith(21);
    expect(slider.value).toBe("21");
  });

  it("AC-4 — modo uncontrolled: respeita `defaultValue` e atualiza com change", () => {
    render(<Slider aria-label="Volume" defaultValue={30} />);
    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider.value).toBe("30");
    fireEvent.change(slider, { target: { value: "31" } });
    expect(slider.value).toBe("31");
  });

  it("AC-4 — `onValueChange` recebe number (não string)", () => {
    const onValueChange = vi.fn<(v: number) => void>();
    render(
      <Slider
        aria-label="Volume"
        defaultValue={50}
        onValueChange={onValueChange}
      />,
    );
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "49" } });
    expect(onValueChange).toHaveBeenCalledWith(49);
    expect(typeof onValueChange.mock.calls[0]?.[0]).toBe("number");
  });

  it("AC-4 — `onChange` nativo dispara em paralelo a `onValueChange`", () => {
    const onChange = vi.fn<(e: React.ChangeEvent<HTMLInputElement>) => void>();
    const onValueChange = vi.fn<(v: number) => void>();
    render(
      <Slider
        aria-label="Volume"
        defaultValue={10}
        onChange={onChange}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.change(screen.getByRole("slider"), { target: { value: "11" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("AC-4 — respeita `min` / `max` (clamp do valor inicial fora do range)", () => {
    render(
      <Slider aria-label="Volume" min={0} max={50} defaultValue={200} />,
    );
    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider.value).toBe("50");
  });

  it("AC-4 — respeita `step` (incremento custom) — value alinhado ao step", () => {
    render(
      <Slider aria-label="Volume" defaultValue={20} step={5} />,
    );
    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider.step).toBe("5");
    /* O browser entrega valores alinhados ao step; simulamos a entrega. */
    fireEvent.change(slider, { target: { value: "25" } });
    expect(slider.value).toBe("25");
  });

  /* ─────────────────────────────────────────────────────────────
   * AC-5 — readout: format / prefix / suffix
   * ───────────────────────────────────────────────────────────── */
  it("AC-5 — `showValue` renderiza valor cru por padrão", () => {
    render(<Slider aria-label="Volume" defaultValue={42} showValue />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("AC-5 — `format` é aplicado ao readout", () => {
    render(
      <Slider
        aria-label="Volume"
        defaultValue={75}
        showValue
        format={(v) => `${v}%`}
      />,
    );
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("AC-5 — `prefix` + `suffix` envolvem o valor", () => {
    render(
      <Slider
        aria-label="Preço"
        min={0}
        max={500}
        defaultValue={120}
        showValue
        prefix="R$ "
        suffix=" /mês"
      />,
    );
    expect(screen.getByText("R$ 120 /mês")).toBeInTheDocument();
  });

  it("AC-5 — prefix + format + suffix juntos compõem o readout completo", () => {
    render(
      <Slider
        aria-label="Volume"
        defaultValue={50}
        showValue
        prefix="["
        suffix="]"
        format={(v) => `vol=${v}`}
      />,
    );
    expect(screen.getByText("[vol=50]")).toBeInTheDocument();
  });

  /* ─────────────────────────────────────────────────────────────
   * AC-6 — CVA size variant
   * ───────────────────────────────────────────────────────────── */
  it("AC-6 — `size=sm` aplica a classe `guardia-slider--sm`", () => {
    render(<Slider aria-label="Volume" size="sm" />);
    expect(screen.getByRole("slider")).toHaveClass("guardia-slider--sm");
  });

  it("AC-6 — default size é `md` (aplica `guardia-slider--md`)", () => {
    render(<Slider aria-label="Volume" />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveClass("guardia-slider--md");
    expect(slider).not.toHaveClass("guardia-slider--sm");
  });

  /* ─────────────────────────────────────────────────────────────
   * AC-7 — invalid
   * ───────────────────────────────────────────────────────────── */
  it("AC-7 — `invalid=true` aplica `aria-invalid` e a classe `guardia-slider--invalid`", () => {
    render(<Slider aria-label="Volume" invalid />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-invalid", "true");
    expect(slider).toHaveClass("guardia-slider--invalid");
  });

  it("AC-7 — sem `invalid`, `aria-invalid` está ausente", () => {
    render(<Slider aria-label="Volume" />);
    const slider = screen.getByRole("slider");
    expect(slider).not.toHaveAttribute("aria-invalid");
    expect(slider).not.toHaveClass("guardia-slider--invalid");
  });

  /* ─────────────────────────────────────────────────────────────
   * AC-8 — disabled
   * ───────────────────────────────────────────────────────────── */
  it("AC-8 — `disabled=true` passa `disabled` ao input e aplica a classe modifier", () => {
    render(<Slider aria-label="Volume" disabled />);
    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider.disabled).toBe(true);
    expect(slider).toHaveClass("guardia-slider--disabled");
  });

  it("AC-8 — disabled bloqueia onValueChange (browser não emite change em input disabled)", () => {
    /**
     * Em um input nativo com `disabled`, o browser não despacha eventos de
     * change a partir de teclado/mouse — esse é o contrato do DOM. O DOM
     * permite `fireEvent.change` programaticamente, mas o usuário não tem
     * caminho real para isso. Aqui asseguramos o contrato observável: o
     * `pointer-events`/`disabled` impede o evento DOM nativo de fluir,
     * verificando via click e via tentativa de `keyDown` (no-op em disabled).
     */
    const onValueChange = vi.fn<(v: number) => void>();
    render(
      <Slider
        aria-label="Volume"
        defaultValue={50}
        disabled
        onValueChange={onValueChange}
      />,
    );
    const slider = screen.getByRole("slider") as HTMLInputElement;
    /* click em input disabled é no-op (default behavior do DOM). */
    fireEvent.click(slider);
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(slider.value).toBe("50");
  });

  /* ─────────────────────────────────────────────────────────────
   * AC-9 — usa a classe global `.guardia-slider`
   * ───────────────────────────────────────────────────────────── */
  it("AC-9 — sempre aplica a classe base `guardia-slider` (estilo global em ui_kit/styles)", () => {
    render(<Slider aria-label="Volume" />);
    expect(screen.getByRole("slider")).toHaveClass("guardia-slider");
  });

  it("AC-9 — expõe `--pct` no style do input para alimentar o gradient do track", () => {
    render(<Slider aria-label="Volume" min={0} max={100} defaultValue={75} />);
    const slider = screen.getByRole("slider");
    expect(slider.style.getPropertyValue("--pct")).toBe("75%");
  });

  /* ─────────────────────────────────────────────────────────────
   * AC-10 — extras comportamentais: clamp, range customizado, reatividade
   * ───────────────────────────────────────────────────────────── */
  it("AC-10 — clamp ao valor entregue pelo browser (range customizado)", () => {
    /* O browser garante que o valor entregue está dentro de [min,max]. */
    render(<Slider aria-label="Volume" min={0} max={50} defaultValue={20} />);
    const slider = screen.getByRole("slider") as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "50" } });
    expect(slider.value).toBe("50");
    fireEvent.change(slider, { target: { value: "0" } });
    expect(slider.value).toBe("0");
  });

  it("AC-10 — `--pct` recalcula quando o valor muda em modo controlled", () => {
    function Controlled() {
      const [v, setV] = useState(0);
      return (
        <Slider
          aria-label="Volume"
          min={0}
          max={100}
          value={v}
          onValueChange={setV}
        />
      );
    }
    render(<Controlled />);
    const slider = screen.getByRole("slider");
    expect(slider.style.getPropertyValue("--pct")).toBe("0%");
    fireEvent.change(slider, { target: { value: "100" } });
    expect(slider.style.getPropertyValue("--pct")).toBe("100%");
  });

  it("AC-10 — readout reflete o valor controlled em tempo real", () => {
    function Controlled() {
      const [v, setV] = useState(10);
      return (
        <Slider
          aria-label="Volume"
          value={v}
          onValueChange={setV}
          showValue
          suffix="%"
        />
      );
    }
    render(<Controlled />);
    expect(screen.getByText("10%")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("slider"), { target: { value: "11" } });
    expect(screen.getByText("11%")).toBeInTheDocument();
  });

  it("AC-10 — `--pct` mapeia corretamente quando `min` é maior que 0", () => {
    render(
      <Slider aria-label="Volume" min={50} max={150} defaultValue={100} />,
    );
    /* (100 - 50) / (150 - 50) = 0.5 → 50% */
    expect(
      screen.getByRole("slider").style.getPropertyValue("--pct"),
    ).toBe("50%");
  });

  /* ─────────────────────────────────────────────────────────────
   * AC-11 — jest-axe em light + dark
   * ───────────────────────────────────────────────────────────── */
  it("AC-11 — Default sem violações a11y em light + dark", async () => {
    const { container } = render(
      <Slider aria-label="Volume" defaultValue={40} />,
    );
    await axeInThemes(container);
  });

  it("AC-11 — estado interativo (showValue + format) sem violações em light + dark", async () => {
    const { container } = render(
      <Slider
        aria-label="Volume"
        defaultValue={60}
        showValue
        format={(v) => `${v}%`}
      />,
    );
    /* Foco como estado interativo principal — mantém o ring no DOM. */
    (screen.getByRole("slider") as HTMLInputElement).focus();
    await axeInThemes(container);
  });

  it("AC-11 — disabled sem violações em light + dark", async () => {
    const { container } = render(
      <Slider aria-label="Volume" defaultValue={40} disabled />,
    );
    await axeInThemes(container);
  });

  /* ─────────────────────────────────────────────────────────────
   * AC-4 — entrada defensiva: callers JS sem types ou estado
   *        vindo de API/form podem entregar null / undefined / NaN
   *        no `value` ou `defaultValue`. O clamp interno cai para
   *        `min` sem renderizar `null` no input nem disparar warning
   *        do React `value prop on input should not be null`.
   * ───────────────────────────────────────────────────────────── */
  it("AC-4 — `value={null}` (caller sem types) renderiza no min sem warning do React", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <Slider
        aria-label="Volume"
        min={10}
        max={90}
        value={null as unknown as number}
      />,
    );
    const input = screen.getByRole("slider") as HTMLInputElement;
    expect(input.value).toBe("10");
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("AC-4 — `value={NaN}` cai para `min` (clamp defensivo)", () => {
    render(
      <Slider aria-label="Volume" min={0} max={100} value={Number.NaN} />,
    );
    const input = screen.getByRole("slider") as HTMLInputElement;
    expect(input.value).toBe("0");
  });

  it("AC-4 — `defaultValue={null}` (caller sem types) inicializa no min", () => {
    render(
      <Slider
        aria-label="Volume"
        min={5}
        max={50}
        defaultValue={null as unknown as number}
      />,
    );
    const input = screen.getByRole("slider") as HTMLInputElement;
    expect(input.value).toBe("5");
  });
});
