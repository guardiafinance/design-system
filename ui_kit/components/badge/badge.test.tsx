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
    { variant: "neutral", originalFg: "text-guardia-gray-700",   reason: "text-guardia-gray-700 over dark bg = 1.22:1 fails AA-Normal" },
    { variant: "brand",   originalFg: "text-guardia-purple-500", reason: "text-guardia-purple-500 over dark bg = 1.43:1 fails AA-Normal" },
    { variant: "accent",  originalFg: "text-guardia-orange-500", reason: "text-guardia-orange-500 over light bg = 3.07:1 fails AA-Normal" },
    { variant: "success", originalFg: "text-signal-green",       reason: "text-signal-green over light bg = 2.37:1 fails AA-Normal" },
    { variant: "warning", originalFg: "text-guardia-yellow-900", reason: "text-guardia-yellow-900 over dark bg = 2.26:1 fails AA-Normal" },
    { variant: "danger",  originalFg: "text-signal-red",         reason: "text-signal-red over light bg = 3.57:1 fails AA-Normal" },
    { variant: "info",    originalFg: "text-signal-blue",        reason: "text-signal-blue over dark bg = 2.20:1 fails AA-Normal" },
  ] as const)("outline variant=$variant uses text-foreground ($reason)", ({ variant, originalFg }) => {
    render(<Badge appearance="outline" variant={variant} data-testid="b">X</Badge>);
    const el = screen.getByTestId("b");
    expect(el).toHaveClass("bg-transparent");
    expect(el).toHaveClass("text-foreground");
    // Negative guard: the failing variant-tinted fg MUST NOT leak through.
    expect(el).not.toHaveClass(originalFg);
  });

  // WCAG §1.4.11 (3:1 non-text UI) — border tokens per theme. Pinned per #180
  // after recompute against --background in both themes. Theme-conditional
  // shades selected so every (variant × theme) combo passes 3:1.
  // See WCAG block in index.tsx for the per-combo ratios.
  it.each([
    {
      variant: "neutral",
      lightBorder: "border-guardia-gray-500",
      darkBorder:  "dark:border-guardia-gray-200",
      originalLightBorder: "border-border-strong",  // resolved to purple-200 #AF97BD in light = 2.56:1 FAIL
      lightRatio: "10.95:1", darkRatio: "7.37:1",
    },
    {
      variant: "brand",
      lightBorder: "border-guardia-purple-500",
      darkBorder:  "dark:border-guardia-purple-200",
      originalLightBorder: null,  // light already passed; only dark was failing
      lightRatio: "12.16:1", darkRatio: "6.80:1",
    },
    {
      variant: "accent",
      lightBorder: "border-guardia-orange-500",
      darkBorder:  null,  // single-token (both themes pass; light tight at 3.07:1)
      originalLightBorder: null,
      lightRatio: "3.07:1", darkRatio: "5.68:1",
    },
    {
      variant: "success",
      lightBorder: "border-signal-green-700",
      darkBorder:  "dark:border-signal-green",
      originalLightBorder: "border-signal-green",  // green #00BF63 on light = 2.37:1 FAIL
      lightRatio: "7.23:1", darkRatio: "7.35:1",
    },
    {
      variant: "warning",
      lightBorder: "border-guardia-yellow-700",
      darkBorder:  "dark:border-signal-yellow",
      originalLightBorder: "border-signal-yellow",  // yellow #FFDE59 on light = 1.29:1 FAIL
      lightRatio: "3.19:1", darkRatio: "13.49:1",
    },
    {
      variant: "danger",
      lightBorder: "border-signal-red",
      darkBorder:  null,  // single-token (both themes pass)
      originalLightBorder: null,
      lightRatio: "3.57:1", darkRatio: "4.88:1",
    },
    {
      variant: "info",
      lightBorder: "border-signal-blue",
      darkBorder:  "dark:border-signal-blue-200",
      originalLightBorder: null,  // light already passed; only dark was failing
      lightRatio: "7.92:1", darkRatio: "11.73:1",
    },
  ] as const)(
    "outline variant=$variant border passes WCAG 1.4.11 in both themes (light $lightRatio · dark $darkRatio)",
    ({ variant, lightBorder, darkBorder, originalLightBorder }) => {
      render(<Badge appearance="outline" variant={variant} data-testid="b">X</Badge>);
      const el = screen.getByTestId("b");
      expect(el).toHaveClass(lightBorder);
      if (darkBorder) expect(el).toHaveClass(darkBorder);
      // Negative guard: the originally failing border MUST NOT leak through.
      if (originalLightBorder) expect(el).not.toHaveClass(originalLightBorder);
    },
  );

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

  // ──────────────────────────────────────────────────────────────────
  // v0.1.0 DoD review (Plan #19) — close the gap for:
  //   AC-3 (behavioral with accessible queries)
  //   AC-4 (jest-axe in light + dark — Default, primary interactive
  //         state, disabled-equivalent, dot/icons variants)
  //
  // WHY: Badge is a passive <span> primitive (no role/tabIndex/disabled
  // of its own). Interactive semantics live in the container; tests
  // cover the composite case (Badge inside <button>) because that
  // mirrors real use (counters in buttons, status in menu items).
  // See docs/issues/issue-19/03-architecture.md D-1.
  // ──────────────────────────────────────────────────────────────────

  describe("[AC-3] behavioral queries (accessible)", () => {
    it("AC-3: Badge inside <button> is reachable via getByRole('button', { name })", () => {
      render(
        <button type="button" aria-label="Notificações">
          <Badge variant="danger" appearance="solid">3</Badge>
        </button>,
      );
      const btn = screen.getByRole("button", { name: /notificações/i });
      expect(btn).toBeInTheDocument();
      // Badge content is part of the button's accessible name composition
      // via its text node — confirm the visual text is present too.
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("AC-3: Badge inside <button> does NOT pollute the accessible tree (no extra role)", () => {
      render(
        <button type="button" aria-label="Status">
          <Badge variant="success" dot>Em dia</Badge>
        </button>,
      );
      // The container is the only interactive role; Badge itself MUST NOT
      // expose role=button or any landmark role.
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(1);
    });

    it("AC-3: dot ornament is aria-hidden (decorative, not announced)", () => {
      render(<Badge variant="success" dot>Em dia</Badge>);
      // getByText resolves only the text node ("Em dia"); the dot span
      // is hidden from the accessibility tree per aria-hidden="true".
      const text = screen.getByText("Em dia");
      const dot = text.parentElement?.querySelector("[aria-hidden='true']");
      expect(dot).not.toBeNull();
    });

    it("AC-3: Badge inside <button disabled> propagates disabled to the interactive role", () => {
      render(
        <button type="button" disabled aria-label="Conciliar">
          <Badge variant="brand" appearance="solid">12</Badge>
        </button>,
      );
      const btn = screen.getByRole("button", { name: /conciliar/i });
      expect(btn).toBeDisabled();
      // Badge itself MUST NOT carry a `disabled` attribute (it is a span).
      const badge = screen.getByText("12");
      expect(badge.tagName).toBe("SPAN");
      expect(badge).not.toHaveAttribute("disabled");
    });
  });

  describe("[AC-4] jest-axe in light + dark themes", () => {
    it("AC-4: Default (soft + neutral + pill) is WCAG AA clean in light + dark", async () => {
      const { container } = render(<Badge>Ativo</Badge>);
      await axeInThemes(container);
    });

    it("AC-4: primary interactive state (Badge inside <button>) is WCAG AA clean in light + dark", async () => {
      const { container } = render(
        <button type="button" aria-label="Notificações pendentes">
          <Badge variant="brand" appearance="solid">3 novos</Badge>
        </button>,
      );
      await axeInThemes(container);
    });

    it("AC-4: disabled-equivalent (Badge inside <button disabled>) is WCAG AA clean in light + dark", async () => {
      const { container } = render(
        <button type="button" disabled aria-label="Conciliar 12 itens">
          <Badge variant="neutral" appearance="solid">12</Badge>
        </button>,
      );
      await axeInThemes(container);
    });

    it("AC-4: WithDot variants are WCAG AA clean in light + dark", async () => {
      const { container } = render(
        <div>
          <Badge variant="success" dot>Em dia</Badge>
          <Badge variant="warning" dot>Pendente</Badge>
          <Badge variant="danger" dot>Atrasado</Badge>
          <Badge variant="info" dot>Em análise</Badge>
        </div>,
      );
      await axeInThemes(container);
    });

    it("AC-4: WithIcons variants are WCAG AA clean in light + dark", async () => {
      const { container } = render(
        <div>
          <Badge
            variant="brand"
            leadingIcon={<span data-testid="lead" aria-hidden="true">★</span>}
          >
            Novo
          </Badge>
          <Badge
            variant="info"
            trailingIcon={<span data-testid="trail" aria-hidden="true">●</span>}
          >
            Ao vivo
          </Badge>
        </div>,
      );
      await axeInThemes(container);
    });
  });
});
