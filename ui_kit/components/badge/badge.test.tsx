import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Badge } from "./index";
import { axeInThemes } from "@/test-utils/a11y";

describe("<Badge />", () => {
  it("renders its children", () => {
    render(<Badge>Ativo</Badge>);
    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  it("defaults to neutral + soft + pill", () => {
    render(<Badge data-testid="b">Ativo</Badge>);
    const el = screen.getByTestId("b");
    expect(el).toHaveAttribute("data-variant", "neutral");
    expect(el).toHaveAttribute("data-appearance", "soft");
    expect(el).toHaveClass("rounded-full");
    expect(el).toHaveClass("bg-guardia-gray-100");
    expect(el).toHaveClass("text-guardia-gray-700");
  });

  it("applies each variant in soft appearance", () => {
    const cases = [
      { variant: "brand",    bg: "bg-guardia-purple-100",  fg: "text-guardia-purple-700" },
      { variant: "accent",   bg: "bg-guardia-orange-100",  fg: "text-guardia-orange-700" },
      { variant: "warning",  bg: "bg-guardia-yellow-100",  fg: "text-guardia-yellow-900" },
    ] as const;
    cases.forEach(({ variant, bg, fg }) => {
      const { unmount } = render(
        <Badge variant={variant} data-testid={`b-${variant}`}>X</Badge>,
      );
      const el = screen.getByTestId(`b-${variant}`);
      expect(el).toHaveClass(bg);
      expect(el).toHaveClass(fg);
      unmount();
    });
  });

  it("applies solid appearance with white text (brand: purple-500 + white = 12.47:1 AAA)", () => {
    render(<Badge appearance="solid" variant="brand" data-testid="b">X</Badge>);
    const el = screen.getByTestId("b");
    expect(el).toHaveClass("bg-guardia-purple-500");
    expect(el).toHaveClass("text-white");
  });

  // WCAG AA-Normal (4.5:1) fg overrides for solid variants where text-white
  // fails the §1.4.3 contrast threshold. Numbers come from sRGB luminance
  // recompute (see PR #175 / Issue #173). Locked here to detect any future
  // regression where someone reverts to the base `text-white` default.
  it.each([
    { variant: "accent",  bg: "bg-guardia-orange-500", fg: "text-guardia-gray-900",   reason: "text-white over orange-500 = 3.15:1 fails AA-Normal" },
    { variant: "success", bg: "bg-signal-green",       fg: "text-guardia-gray-900",   reason: "text-white over signal-green = 2.43:1 fails AA-Normal AND AA-Large" },
    { variant: "danger",  bg: "bg-signal-red",         fg: "text-guardia-gray-900",   reason: "text-white over signal-red = 3.66:1 fails AA-Normal" },
    { variant: "warning", bg: "bg-signal-yellow",      fg: "text-guardia-purple-900", reason: "text-white over signal-yellow = 1.33:1 fails everything" },
  ] as const)("solid variant=$variant uses $fg ($reason)", ({ variant, bg, fg }) => {
    render(<Badge appearance="solid" variant={variant} data-testid="b">X</Badge>);
    const el = screen.getByTestId("b");
    expect(el).toHaveClass(bg);
    expect(el).toHaveClass(fg);
    // Negative guard: the failing base `text-white` MUST NOT leak through.
    expect(el).not.toHaveClass("text-white");
  });

  it("jest-axe: solid variants are WCAG AA clean in light + dark themes", async () => {
    const { container } = render(
      <div>
        <Badge appearance="solid" variant="neutral">neutral</Badge>
        <Badge appearance="solid" variant="brand">brand</Badge>
        <Badge appearance="solid" variant="accent">accent</Badge>
        <Badge appearance="solid" variant="success">success</Badge>
        <Badge appearance="solid" variant="warning">warning</Badge>
        <Badge appearance="solid" variant="danger">danger</Badge>
        <Badge appearance="solid" variant="info">info</Badge>
      </div>,
    );
    await axeInThemes(container);
  });

  it("applies outline appearance with variant-tinted border + neutral fg", () => {
    render(<Badge appearance="outline" variant="danger" data-testid="b">Erro</Badge>);
    const el = screen.getByTestId("b");
    expect(el).toHaveClass("bg-transparent");
    expect(el).toHaveClass("border-signal-red");
    // ADR-003 outline policy: text-foreground (not variant-tinted) so AA-Normal
    // passes against bg-background in both themes (see WCAG block in index.tsx).
    expect(el).toHaveClass("text-foreground");
    expect(el).not.toHaveClass("text-signal-red");
  });

  // WCAG AA-Normal (4.5:1) fg overrides for outline variants. The original
  // variant-tinted fg fails §1.4.3 over --background in at least one theme
  // for every single variant (see WCAG block in index.tsx for the recompute).
  // ADR-003 policy adopted: variant-tinted border + text-foreground.
  // Pinned here to detect any regression that re-introduces a variant-color
  // fg on outline mode.
  it.each([
    { variant: "neutral", border: "border-border-strong",     originalFg: "text-guardia-gray-700",   reason: "text-guardia-gray-700 over dark bg = 1.22:1 fails AA-Normal" },
    { variant: "brand",   border: "border-guardia-purple-500", originalFg: "text-guardia-purple-500", reason: "text-guardia-purple-500 over dark bg = 1.43:1 fails AA-Normal" },
    { variant: "accent",  border: "border-guardia-orange-500", originalFg: "text-guardia-orange-500", reason: "text-guardia-orange-500 over light bg = 3.07:1 fails AA-Normal" },
    { variant: "success", border: "border-signal-green",       originalFg: "text-signal-green",       reason: "text-signal-green over light bg = 2.37:1 fails AA-Normal" },
    { variant: "warning", border: "border-signal-yellow",      originalFg: "text-guardia-yellow-900", reason: "text-guardia-yellow-900 over dark bg = 2.26:1 fails AA-Normal" },
    { variant: "danger",  border: "border-signal-red",         originalFg: "text-signal-red",         reason: "text-signal-red over light bg = 3.57:1 fails AA-Normal" },
    { variant: "info",    border: "border-signal-blue",        originalFg: "text-signal-blue",        reason: "text-signal-blue over dark bg = 2.20:1 fails AA-Normal" },
  ] as const)("outline variant=$variant uses $border + text-foreground ($reason)", ({ variant, border, originalFg }) => {
    render(<Badge appearance="outline" variant={variant} data-testid="b">X</Badge>);
    const el = screen.getByTestId("b");
    expect(el).toHaveClass("bg-transparent");
    expect(el).toHaveClass(border);
    expect(el).toHaveClass("text-foreground");
    // Negative guard: the failing variant-tinted fg MUST NOT leak through.
    expect(el).not.toHaveClass(originalFg);
  });

  it("jest-axe: outline variants are WCAG AA clean in light + dark themes", async () => {
    const { container } = render(
      <div>
        <Badge appearance="outline" variant="neutral">neutral</Badge>
        <Badge appearance="outline" variant="brand">brand</Badge>
        <Badge appearance="outline" variant="accent">accent</Badge>
        <Badge appearance="outline" variant="success">success</Badge>
        <Badge appearance="outline" variant="warning">warning</Badge>
        <Badge appearance="outline" variant="danger">danger</Badge>
        <Badge appearance="outline" variant="info">info</Badge>
      </div>,
    );
    await axeInThemes(container);
  });

  it("applies square shape", () => {
    render(<Badge shape="square" data-testid="b">X</Badge>);
    expect(screen.getByTestId("b")).toHaveClass("rounded-sm");
  });

  it("renders a dot when dot=true", () => {
    const { container } = render(<Badge dot>Ativo</Badge>);
    const dot = container.querySelector("[aria-hidden='true']");
    expect(dot).not.toBeNull();
    expect(dot).toHaveClass("rounded-full");
    expect(dot).toHaveClass("bg-current");
  });

  it("omits the dot by default", () => {
    const { container } = render(<Badge>Ativo</Badge>);
    expect(container.querySelector("[aria-hidden='true']")).toBeNull();
  });

  it("renders leadingIcon and trailingIcon", () => {
    render(
      <Badge
        leadingIcon={<span data-testid="lead">◂</span>}
        trailingIcon={<span data-testid="trail">▸</span>}
      >
        X
      </Badge>,
    );
    expect(screen.getByTestId("lead")).toBeInTheDocument();
    expect(screen.getByTestId("trail")).toBeInTheDocument();
  });

  it("forwards the ref to the span element", () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(<Badge ref={ref}>X</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it("exposes data attributes for variant and appearance", () => {
    render(<Badge variant="success" appearance="outline" data-testid="b">ok</Badge>);
    const el = screen.getByTestId("b");
    expect(el).toHaveAttribute("data-variant", "success");
    expect(el).toHaveAttribute("data-appearance", "outline");
  });
});
