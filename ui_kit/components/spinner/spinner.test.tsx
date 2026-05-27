import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Spinner, SPINNER_PX } from "./index";
import { axeInThemes } from "@/test-utils/a11y";

describe("Spinner", () => {
  // AC-3 — accessible queries; baseline role contract
  it("AC-3: renderiza com role status por default", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  // AC-3 — default accessible name (pt-BR per project guidelines)
  it("AC-3: anuncia 'Carregando' por default", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "Carregando",
    );
  });

  // AC-3 — custom accessible name override
  it("AC-3: aceita label customizado", () => {
    render(<Spinner label="Conciliando lançamentos" />);
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "Conciliando lançamentos",
    );
  });

  // AC-3 — accessible queries can locate the spinner by name (preferred path)
  it("AC-3: getByRole('status', { name }) localiza pelo accessible name", () => {
    render(<Spinner label="Sincronizando" />);
    expect(
      screen.getByRole("status", { name: "Sincronizando" }),
    ).toBeInTheDocument();
  });

  // AC-3 — SVG is decorative (aria-hidden)
  it("AC-3: renderiza um SVG decorativo (aria-hidden)", () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  // AC-3 — size variant: md (default) renders 20×20
  it("AC-3: size=md (default) gera SVG 20×20", () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe(String(SPINNER_PX.md));
    expect(svg.getAttribute("height")).toBe(String(SPINNER_PX.md));
  });

  // AC-3 — size variant: xs
  it("AC-3: size=xs gera SVG 12×12", () => {
    const { container } = render(<Spinner size="xs" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe(String(SPINNER_PX.xs));
    expect(svg.getAttribute("height")).toBe(String(SPINNER_PX.xs));
  });

  // AC-3 — size variant: sm
  it("AC-3: size=sm gera SVG 16×16", () => {
    const { container } = render(<Spinner size="sm" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe(String(SPINNER_PX.sm));
  });

  // AC-3 — size variant: lg
  it("AC-3: size=lg gera SVG 28×28", () => {
    const { container } = render(<Spinner size="lg" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe(String(SPINNER_PX.lg));
  });

  // AC-3 — size variant: xl
  it("AC-3: size=xl gera SVG 40×40", () => {
    const { container } = render(<Spinner size="xl" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe(String(SPINNER_PX.xl));
  });

  // AC-3 — size variant: each size also applies the matching wrapper width class.
  // `it.each` per Gemini suggestion (PR #194 review): each row reports as an
  // independent test case in Vitest and gets native isolation (no manual unmount),
  // honoring lex-test-isolation (Rule 4 — order independence) and improving the
  // failure surface when one width regresses.
  it.each([
    { size: "xs", cls: "w-3" },
    { size: "sm", cls: "w-4" },
    { size: "md", cls: "w-5" },
    { size: "lg", cls: "w-7" },
    { size: "xl", cls: "w-10" },
  ] as const)(
    "AC-3: size=$size aplica a classe $cls no wrapper",
    ({ size, cls }) => {
      render(<Spinner size={size} label={`spin-${size}`} />);
      expect(
        screen.getByRole("status", { name: `spin-${size}` }),
      ).toHaveClass(cls);
    },
  );

  // AC-3 — color variant: brand
  it("AC-3: color=brand aplica purple-500", () => {
    render(<Spinner color="brand" />);
    expect(screen.getByRole("status")).toHaveClass("text-guardia-purple-500");
  });

  // AC-3 — color variant: accent
  it("AC-3: color=accent aplica orange-500", () => {
    render(<Spinner color="accent" />);
    expect(screen.getByRole("status")).toHaveClass("text-guardia-orange-500");
  });

  // AC-3 — color variant: white (for dark backgrounds)
  it("AC-3: color=white aplica text-white", () => {
    render(<Spinner color="white" />);
    expect(screen.getByRole("status")).toHaveClass("text-white");
  });

  // AC-3 — color variant: current inherits, no color class
  it("AC-3: color=current não aplica nenhuma classe de cor", () => {
    render(<Spinner color="current" />);
    const el = screen.getByRole("status");
    expect(el).not.toHaveClass("text-guardia-purple-500");
    expect(el).not.toHaveClass("text-guardia-orange-500");
    expect(el).not.toHaveClass("text-white");
  });

  // AC-3 — motion: respects prefers-reduced-motion (motion-safe wrapper)
  it("AC-3: aplica animação motion-safe", () => {
    render(<Spinner />);
    expect(screen.getByRole("status").className).toMatch(
      /motion-safe:animate-\[spin_900ms_linear_infinite\]/,
    );
  });

  // AC-4 — decorative variant suppresses role + label (and stays axe-clean)
  it("AC-3: aria-hidden=true suprime role + label (decorativo)", () => {
    const { container } = render(<Spinner aria-hidden />);
    const span = container.querySelector("span");
    expect(span).not.toHaveAttribute("role");
    expect(span).not.toHaveAttribute("aria-label");
    expect(span).toHaveAttribute("aria-hidden", "true");
  });

  // AC-3 — composability: forwards extra className
  it("AC-3: respeita className customizado", () => {
    render(<Spinner className="my-extra" />);
    expect(screen.getByRole("status")).toHaveClass("my-extra");
  });

  // AC-3 — anti-wobble baseline neutralization (visual contract pinned)
  it("AC-3: renderiza como inline-block com baseline neutro (anti-wobble)", () => {
    render(<Spinner />);
    const el = screen.getByRole("status");
    expect(el).toHaveClass("inline-block");
    expect(el).toHaveClass("leading-none");
    expect(el).toHaveClass("align-middle");
    expect(el).toHaveClass("origin-center");
  });

  // AC-3 — SVG geometry pinned (270° arc from wip parity)
  it("AC-3: path do SVG bate com wip (arco 270°)", () => {
    const { container } = render(<Spinner />);
    const path = container.querySelector("path");
    expect(path).toHaveAttribute("d", "M21 12a9 9 0 1 1-6.3-8.57");
  });

  // AC-3 — non-interactive: spinner is not in the tab order
  it("AC-3: não é focável (não entra na tab order)", () => {
    render(<Spinner />);
    const el = screen.getByRole("status");
    expect(el).not.toHaveAttribute("tabindex");
    expect(el.tagName).toBe("SPAN");
  });

  // AC-3 — ref is forwarded to the underlying span
  it("AC-3: forwarda ref para o span", () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(<Spinner ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  // AC-3 — composition: works inline inside a button (real consumption pattern)
  it("AC-3: compõe inline dentro de um <button> sem quebrar o role do botão", () => {
    render(
      <button type="button" disabled>
        <Spinner size="sm" color="white" aria-hidden /> Salvando…
      </button>,
    );
    // Button keeps its role + accessible name (from text content).
    expect(
      screen.getByRole("button", { name: /salvando/i }),
    ).toBeInTheDocument();
    // Spinner inside is suppressed (aria-hidden) — no extra status role leaks.
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  // AC-4 — jest-axe: Default render is axe-clean in light + dark
  it("AC-4: jest-axe — Default é WCAG AA clean em light + dark", async () => {
    const { container } = render(<Spinner />);
    await axeInThemes(container);
  });

  // AC-4 — jest-axe: primary color states (brand/accent/current) axe-clean in both themes
  it("AC-4: jest-axe — tons primários (brand/accent/current) são axe-clean em light + dark", async () => {
    const { container } = render(
      <div>
        <Spinner color="current" label="current" />
        <Spinner color="brand" label="brand" />
        <Spinner color="accent" label="accent" />
      </div>,
    );
    await axeInThemes(container);
  });

  // AC-4 — jest-axe: white-on-dark composition stays clean in both themes
  it("AC-4: jest-axe — color=white sobre fundo escuro é axe-clean em light + dark", async () => {
    const { container } = render(
      <div className="rounded-md bg-guardia-purple-900 p-6">
        <Spinner color="white" label="processando" />
      </div>,
    );
    await axeInThemes(container);
  });

  // AC-4 — jest-axe: decorative (aria-hidden) variant replaces the "disabled"
  // axis from the AC template. Spinner is non-interactive, so the relevant
  // ARIA change is suppressing the role — verify it does not introduce misuse.
  it("AC-4: jest-axe — variante decorativa (aria-hidden) é axe-clean em light + dark", async () => {
    const { container } = render(
      <button type="button" disabled>
        <Spinner aria-hidden size="sm" color="white" /> Enviando…
      </button>,
    );
    await axeInThemes(container);
  });

  // AC-4 — jest-axe: custom label override is axe-clean in both themes
  it("AC-4: jest-axe — label customizado é axe-clean em light + dark", async () => {
    const { container } = render(
      <Spinner label="Gerando relatório fiscal" size="lg" color="brand" />,
    );
    await axeInThemes(container);
  });
});
