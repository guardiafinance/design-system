/**
 * Behavioral tests for ConfidenceIndicator.
 *
 * Cobertura AC↔teste — cada bloco / teste anota a(s) AC(s) coberta(s)
 * por nome para auditoria mecânica no Gate 2.
 *
 * Sem mocking de colaboradores internos (não há) — render real +
 * queries acessíveis (`getByRole("meter")`, `getByLabelText`,
 * `getByText`).
 */
import * as React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";

import { axeInThemes } from "@/test-utils/a11y";
import {
  ConfidenceIndicator,
  confidenceIndicatorVariants,
  type ConfidenceLevel,
  type ConfidenceVariant,
  type ConfidenceSize,
} from "./index";

// Reset theme between cases to keep a11y / DOM inspection deterministic
beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

describe("ConfidenceIndicator — public surface (AC-1)", () => {
  it("AC-1: exports the component", () => {
    expect(ConfidenceIndicator).toBeDefined();
    expect(ConfidenceIndicator.displayName).toBe("ConfidenceIndicator");
  });

  it("AC-1: exports the CVA accessor", () => {
    expect(typeof confidenceIndicatorVariants).toBe("function");
    expect(confidenceIndicatorVariants({})).toEqual(expect.any(String));
  });

  it("AC-1: exports supporting types (compile-time guard)", () => {
    // pure type assertion — exists to prove the names live in the barrel
    const lvl: ConfidenceLevel = "high";
    const variant: ConfidenceVariant = "chip";
    const size: ConfidenceSize = "md";
    expect(lvl).toBe("high");
    expect(variant).toBe("chip");
    expect(size).toBe("md");
  });
});

describe("ConfidenceIndicator — value clamping (AC-2)", () => {
  it("AC-2: clamps value below 0 to 0", () => {
    const { getByRole } = render(<ConfidenceIndicator value={-12} />);
    const root = getByRole("meter");
    expect(root.getAttribute("aria-valuenow")).toBe("0");
  });

  it("AC-2: clamps value above 100 to 100", () => {
    const { getByRole } = render(<ConfidenceIndicator value={150} />);
    const root = getByRole("meter");
    expect(root.getAttribute("aria-valuenow")).toBe("100");
  });

  it("AC-2: NaN falls back to tier floor for valuenow and level defaults to high", () => {
    // WAI-ARIA `role="meter"` requires `aria-valuenow`; when no numeric value
    // is supplied, the meter reports the tier floor (the lowest value still
    // in the level), matching the bar's fill convention. `aria-valuetext`
    // keeps the qualitative label so AT announces "Alta confiança" rather
    // than reading "95". axe-core `aria-required-attr` is satisfied.
    const { getByRole } = render(<ConfidenceIndicator value={Number.NaN} />);
    const root = getByRole("meter");
    expect(root.getAttribute("aria-valuenow")).toBe("95"); // TIER_FLOOR.high
    expect(root.getAttribute("data-level")).toBe("high");
  });

  it("AC-2: undefined value with no level defaults to high (valuenow = tier floor)", () => {
    const { getByRole } = render(<ConfidenceIndicator />);
    const root = getByRole("meter");
    expect(root.getAttribute("aria-valuenow")).toBe("95"); // TIER_FLOOR.high
    expect(root.getAttribute("data-level")).toBe("high");
  });

  it("AC-2: NaN with explicit level uses the explicit level", () => {
    const { getByRole } = render(<ConfidenceIndicator value={Number.NaN} level="low" />);
    const root = getByRole("meter");
    expect(root.getAttribute("data-level")).toBe("low");
  });
});

describe("ConfidenceIndicator — level derivation + override (AC-3)", () => {
  it("AC-3: value >= 95 derives high", () => {
    const { getByRole } = render(<ConfidenceIndicator value={97} />);
    expect(getByRole("meter").getAttribute("data-level")).toBe("high");
  });

  it("AC-3: value 80..94 derives medium", () => {
    const { getByRole } = render(<ConfidenceIndicator value={86} />);
    expect(getByRole("meter").getAttribute("data-level")).toBe("medium");
  });

  it("AC-3: value < 80 derives low", () => {
    const { getByRole } = render(<ConfidenceIndicator value={62} />);
    expect(getByRole("meter").getAttribute("data-level")).toBe("low");
  });

  it("AC-3: explicit level overrides derivation", () => {
    const { getByRole } = render(<ConfidenceIndicator value={97} level="low" />);
    const root = getByRole("meter");
    expect(root.getAttribute("data-level")).toBe("low");
    // value still reflected in aria-valuenow
    expect(root.getAttribute("aria-valuenow")).toBe("97");
  });
});

describe("ConfidenceIndicator — variants (AC-4)", () => {
  it("AC-4: default variant is chip (span root)", () => {
    const { getByRole } = render(<ConfidenceIndicator value={97} />);
    const root = getByRole("meter");
    expect(root.tagName.toLowerCase()).toBe("span");
    expect(root.getAttribute("data-variant")).toBe("chip");
  });

  it("AC-4: variant=bar renders a div root with track + meta", () => {
    const { getByRole } = render(<ConfidenceIndicator value={97} variant="bar" />);
    const root = getByRole("meter");
    expect(root.tagName.toLowerCase()).toBe("div");
    expect(root.getAttribute("data-variant")).toBe("bar");
  });

  it("AC-4: variant=dot renders a span root with bullet + label", () => {
    const { getByRole } = render(<ConfidenceIndicator value={62} variant="dot" />);
    const root = getByRole("meter");
    expect(root.tagName.toLowerCase()).toBe("span");
    expect(root.getAttribute("data-variant")).toBe("dot");
  });
});

describe("ConfidenceIndicator — sizes (AC-5)", () => {
  it("AC-5: size=sm applies via CVA", () => {
    const { getByRole } = render(<ConfidenceIndicator value={97} size="sm" />);
    const cls = getByRole("meter").className;
    expect(cls).toMatch(/text-\[11px\]/);
  });

  it("AC-5: size=md applies via CVA (default)", () => {
    const { getByRole } = render(<ConfidenceIndicator value={97} size="md" />);
    const cls = getByRole("meter").className;
    expect(cls).toMatch(/text-\[12px\]/);
  });
});

describe("ConfidenceIndicator — showValue (AC-6)", () => {
  it("AC-6: showValue=true (default) renders the percentage", () => {
    const { getByText } = render(<ConfidenceIndicator value={97} />);
    expect(getByText("97%")).toBeTruthy();
  });

  it("AC-6: showValue=false hides percentage from DOM", () => {
    const { queryByText, getByRole } = render(
      <ConfidenceIndicator value={97} showValue={false} />,
    );
    expect(queryByText("97%")).toBeNull();
    // but aria-valuenow is still present (AT still hears the number via aria-valuetext)
    expect(getByRole("meter").getAttribute("aria-valuenow")).toBe("97");
  });
});

describe("ConfidenceIndicator — label override (AC-7)", () => {
  it("AC-7: custom label replaces tier default in chip", () => {
    const { getByText, queryByText } = render(
      <ConfidenceIndicator value={97} label="Classificação OK" />,
    );
    expect(getByText("Classificação OK")).toBeTruthy();
    expect(queryByText("Alta confiança")).toBeNull();
  });

  it("AC-7: custom label is rendered in bar", () => {
    const { getByText } = render(
      <ConfidenceIndicator value={86} variant="bar" label="Categoria fiscal" />,
    );
    expect(getByText("Categoria fiscal")).toBeTruthy();
  });

  it("AC-7: custom label as ReactNode is rendered in dot", () => {
    const { getByText } = render(
      <ConfidenceIndicator
        value={62}
        variant="dot"
        label={<strong data-testid="custom">Atenção forte</strong>}
      />,
    );
    expect(getByText("Atenção forte")).toBeTruthy();
  });
});

describe("ConfidenceIndicator — levelLabels override (AC-8)", () => {
  it("AC-8: partial override merges with defaults", () => {
    const { getByText, rerender } = render(
      <ConfidenceIndicator value={97} levelLabels={{ high: "Confidence high" }} />,
    );
    expect(getByText("Confidence high")).toBeTruthy();

    rerender(<ConfidenceIndicator value={86} levelLabels={{ high: "Confidence high" }} />);
    // medium key NOT overridden → default pt-BR "Revisar" is still present
    expect(getByText("Revisar")).toBeTruthy();
  });

  it("AC-8: full override replaces all tier labels", () => {
    const labels = { high: "H", medium: "M", low: "L" };
    const { getByText: g1 } = render(
      <ConfidenceIndicator value={97} levelLabels={labels} />,
    );
    expect(g1("H")).toBeTruthy();

    const { getByText: g2 } = render(
      <ConfidenceIndicator value={62} levelLabels={labels} />,
    );
    expect(g2("L")).toBeTruthy();
  });
});

describe("ConfidenceIndicator — className + rest props (AC-9)", () => {
  it("AC-9: className merges with internal classes", () => {
    const { getByRole } = render(
      <ConfidenceIndicator value={97} className="custom-class" />,
    );
    const root = getByRole("meter");
    expect(root.className).toContain("custom-class");
    // internal classes preserved
    expect(root.className).toContain("tabular-nums");
  });

  it("AC-9: forwards rest props (data-testid) to root", () => {
    const { getByTestId } = render(
      <ConfidenceIndicator value={97} data-testid="ci-root" />,
    );
    expect(getByTestId("ci-root")).toBeTruthy();
  });

  it("AC-9: forwards ref to the root element", () => {
    const ref = React.createRef<HTMLElement>();
    render(<ConfidenceIndicator value={97} ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.getAttribute("role")).toBe("meter");
  });
});

describe("ConfidenceIndicator — ARIA semantics (AC-16, AC-17, AC-18)", () => {
  it("AC-16: role=meter with aria-valuemin=0 / aria-valuemax=100", () => {
    const { getByRole } = render(<ConfidenceIndicator value={97} />);
    const root = getByRole("meter");
    expect(root.getAttribute("aria-valuemin")).toBe("0");
    expect(root.getAttribute("aria-valuemax")).toBe("100");
    expect(root.getAttribute("aria-valuenow")).toBe("97");
  });

  it("AC-16: aria-valuenow rounds fractional values", () => {
    const { getByRole } = render(<ConfidenceIndicator value={86.7} />);
    expect(getByRole("meter").getAttribute("aria-valuenow")).toBe("87");
  });

  it("AC-16: level-only mode falls back to tier floor for aria-valuenow", () => {
    // The `role="meter"` contract requires `aria-valuenow` (axe-core
    // `aria-required-attr`, critical). When the consumer asserts only a
    // tier, the floor is the most honest scalar — qualitative announcement
    // stays via `aria-valuetext`. Aligned with the bar variant's
    // `fillPercent` convention.
    const { getByRole } = render(<ConfidenceIndicator level="medium" />);
    const root = getByRole("meter");
    expect(root.getAttribute("aria-valuenow")).toBe("80"); // TIER_FLOOR.medium
  });

  it("AC-17: aria-valuetext composes label + percentage when value known", () => {
    const { getByRole } = render(<ConfidenceIndicator value={86} />);
    expect(getByRole("meter").getAttribute("aria-valuetext")).toBe("Revisar 86%");
  });

  it("AC-17: aria-valuetext is the bare label when value unknown", () => {
    const { getByRole } = render(<ConfidenceIndicator level="low" />);
    expect(getByRole("meter").getAttribute("aria-valuetext")).toBe("Atenção");
  });

  it("AC-18: aria-label auto-composed with Confiança prefix", () => {
    const { getByRole } = render(<ConfidenceIndicator value={97} />);
    expect(getByRole("meter").getAttribute("aria-label")).toBe(
      "Confiança: Alta confiança 97%",
    );
  });

  it("AC-18: aria-label overridable by prop", () => {
    const { getByRole } = render(
      <ConfidenceIndicator value={97} aria-label="Classification confidence high" />,
    );
    expect(getByRole("meter").getAttribute("aria-label")).toBe(
      "Classification confidence high",
    );
  });
});

describe("ConfidenceIndicator — focus (AC-20)", () => {
  it("AC-20: root is not focusable by default", () => {
    const { getByRole } = render(<ConfidenceIndicator value={97} />);
    const root = getByRole("meter");
    expect(root.getAttribute("tabindex")).toBeNull();
  });
});

describe("ConfidenceIndicator — bar fill width (AC-12)", () => {
  it("AC-12: bar fill width reflects value when known", () => {
    const { getByRole } = render(<ConfidenceIndicator value={62} variant="bar" />);
    const root = getByRole("meter");
    // bar DOM: <div role="meter"> > <div track (aria-hidden)> > <div fill (style.width)>
    const track = root.querySelector(":scope > div[aria-hidden='true']") as HTMLElement;
    expect(track).not.toBeNull();
    const fill = track.firstElementChild as HTMLElement;
    expect(fill).not.toBeNull();
    expect(fill.style.width).toBe("62%");
  });

  it("AC-12: bar fill width falls back to tier floor when value unknown", () => {
    const { getByRole } = render(<ConfidenceIndicator level="medium" variant="bar" />);
    const root = getByRole("meter");
    const track = root.querySelector(":scope > div[aria-hidden='true']") as HTMLElement;
    expect(track).not.toBeNull();
    const fill = track.firstElementChild as HTMLElement;
    expect(fill).not.toBeNull();
    expect(fill.style.width).toBe("80%"); // THRESHOLD_MEDIUM
  });
});

describe("ConfidenceIndicator — a11y matrix (AC-19, AC-24)", () => {
  it("AC-19: jest-axe passes light + dark — default", async () => {
    const { container } = render(<ConfidenceIndicator value={97} />);
    await axeInThemes(container);
  });

  it("AC-19: jest-axe passes light + dark — level high (chip)", async () => {
    const { container } = render(<ConfidenceIndicator value={97} level="high" />);
    await axeInThemes(container);
  });

  it("AC-19: jest-axe passes light + dark — level medium (chip)", async () => {
    const { container } = render(<ConfidenceIndicator value={86} level="medium" />);
    await axeInThemes(container);
  });

  it("AC-19: jest-axe passes light + dark — level low (chip)", async () => {
    const { container } = render(<ConfidenceIndicator value={62} level="low" />);
    await axeInThemes(container);
  });

  it("AC-19: jest-axe passes light + dark — variant bar", async () => {
    const { container } = render(<ConfidenceIndicator value={86} variant="bar" />);
    await axeInThemes(container);
  });

  it("AC-19: jest-axe passes light + dark — variant dot", async () => {
    const { container } = render(<ConfidenceIndicator value={62} variant="dot" />);
    await axeInThemes(container);
  });

  it("AC-19: jest-axe passes light + dark — showValue=false", async () => {
    const { container } = render(<ConfidenceIndicator value={97} showValue={false} />);
    await axeInThemes(container);
  });

  it("AC-19: jest-axe passes light + dark — custom label", async () => {
    const { container } = render(
      <ConfidenceIndicator value={97} label="Classificação contábil" variant="bar" />,
    );
    await axeInThemes(container);
  });
});
