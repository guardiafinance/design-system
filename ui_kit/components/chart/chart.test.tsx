import type { ComponentProps, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import { axeInThemes } from "@/test-utils/a11y";
import {
  ChartConfigProvider,
  ChartContainer,
  ChartLegendContent,
  ChartStyle,
  ChartTooltipContent,
  type ChartConfig,
} from "./index";

// WHY: jsdom does not implement layout. Recharts's ResponsiveContainer
// only renders its child chart after it observes a non-zero size, and the
// global ResizeObserver shim in vitest.setup.ts is a no-op. We install a
// scoped mock that fires the callback synchronously with a deterministic
// (480x320) ContentRect so the SVG mounts and our wrapper assertions stay
// meaningful — without coupling tests to the Recharts internal lifecycle.
class SizedResizeObserver {
  private static readonly RECT = {
    width: 480,
    height: 320,
    top: 0,
    left: 0,
    bottom: 320,
    right: 480,
    x: 0,
    y: 0,
    toJSON() {
      return this;
    },
  };
  private callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element): void {
    this.callback(
      [
        {
          target,
          contentRect: SizedResizeObserver.RECT as DOMRectReadOnly,
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
        } as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    );
  }
  unobserve(): void {}
  disconnect(): void {}
}

let originalRO: typeof globalThis.ResizeObserver;

beforeEach(() => {
  originalRO = globalThis.ResizeObserver;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional: install a deterministic ResizeObserver double for jsdom; rolled back per-test
  (globalThis as any).ResizeObserver = SizedResizeObserver;
  // Recharts also reads getBoundingClientRect() during measure.
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    () =>
      ({
        width: 480,
        height: 320,
        top: 0,
        left: 0,
        bottom: 320,
        right: 480,
        x: 0,
        y: 0,
        toJSON: () => null,
      }) as DOMRect,
  );
});

afterEach(() => {
  globalThis.ResizeObserver = originalRO;
  vi.restoreAllMocks();
});

function withSize(node: ReactNode) {
  return (
    <div style={{ width: 480, height: 320 }} data-testid="chart-frame">
      {node}
    </div>
  );
}

const baseData = [
  { name: "Jan", revenue: 400, expense: 240 },
  { name: "Feb", revenue: 300, expense: 138 },
  { name: "Mar", revenue: 520, expense: 280 },
  { name: "Apr", revenue: 478, expense: 308 },
];

const baseConfig = {
  revenue: { label: "Receita", color: "var(--chart-1)" },
  expense: { label: "Despesa", color: "var(--chart-3)" },
} satisfies ChartConfig;

function LineSample() {
  return (
    <ChartContainer config={baseConfig} aria-label="Receita e custo por mês">
      <LineChart data={baseData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" />
        <Line type="monotone" dataKey="expense" stroke="var(--color-expense)" />
      </LineChart>
    </ChartContainer>
  );
}

function BarSample() {
  return (
    <ChartContainer config={baseConfig} aria-label="Receita e custo (barras)">
      <BarChart data={baseData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Bar dataKey="revenue" fill="var(--color-revenue)" />
        <Bar dataKey="expense" fill="var(--color-expense)" />
      </BarChart>
    </ChartContainer>
  );
}

function PieSample() {
  const slices = [
    { name: "Receita", value: 60 },
    { name: "Despesa", value: 25 },
    { name: "Reserva", value: 15 },
  ];
  const pieConfig = {
    Receita: { label: "Receita", color: "var(--chart-1)" },
    Despesa: { label: "Despesa", color: "var(--chart-3)" },
    Reserva: { label: "Reserva", color: "var(--chart-4)" },
  } satisfies ChartConfig;
  return (
    <ChartContainer config={pieConfig} aria-label="Distribuição de receita">
      <PieChart>
        <Pie data={slices} dataKey="value" nameKey="name" outerRadius={80}>
          {slices.map((s) => (
            <Cell key={s.name} fill={`var(--color-${s.name})`} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

describe("<ChartContainer />", () => {
  it("renders a region with the provided aria-label", () => {
    const { container } = render(withSize(<LineSample />));
    // ResponsiveContainer wraps children with role-less divs; ChartContainer
    // exposes the aria-label on its outermost div.
    const frame = container.querySelector("[aria-label='Receita e custo por mês']");
    expect(frame).not.toBeNull();
  });

  it("emits a stable data-chart attribute (chart-<id>)", () => {
    const { container } = render(withSize(<LineSample />));
    const node = container.querySelector("[data-chart]");
    expect(node).not.toBeNull();
    expect(node?.getAttribute("data-chart")).toMatch(/^chart-/);
  });

  it("accepts an explicit id and uses it in data-chart", () => {
    const { container } = render(
      withSize(
        <ChartContainer id="finance" config={baseConfig}>
          <LineChart data={baseData}>
            <Line dataKey="revenue" />
          </LineChart>
        </ChartContainer>,
      ),
    );
    expect(container.querySelector("[data-chart='chart-finance']")).not.toBeNull();
  });

  it("composes className over the default token-driven base", () => {
    const { container } = render(
      withSize(
        <ChartContainer
          config={baseConfig}
          className="custom-extra"
          aria-label="custom"
        >
          <LineChart data={baseData}>
            <Line dataKey="revenue" />
          </LineChart>
        </ChartContainer>,
      ),
    );
    const node = container.querySelector("[data-chart]");
    expect(node?.className).toContain("custom-extra");
    expect(node?.className).toContain("bg-card");
    expect(node?.className).toContain("text-card-foreground");
  });

  it("injects --color-<key> css variables from config.color", () => {
    const { container } = render(withSize(<LineSample />));
    const style = container.querySelector("style");
    expect(style).not.toBeNull();
    const css = style?.innerHTML ?? "";
    expect(css).toContain("--color-revenue: var(--chart-1);");
    expect(css).toContain("--color-expense: var(--chart-3);");
  });

  it("scopes css vars to the matching data-chart id", () => {
    const { container } = render(
      withSize(
        <ChartContainer id="alpha" config={baseConfig}>
          <LineChart data={baseData}>
            <Line dataKey="revenue" stroke="var(--color-revenue)" />
          </LineChart>
        </ChartContainer>,
      ),
    );
    const style = container.querySelector("style");
    expect(style?.innerHTML).toContain("[data-chart=chart-alpha]");
  });

  it("emits both light and dark CSS blocks via ChartStyle", () => {
    const { container } = render(withSize(<LineSample />));
    const css = container.querySelector("style")?.innerHTML ?? "";
    // Light theme block has no prefix; dark theme block is prefixed by .dark.
    expect(css).toMatch(/\[data-chart=chart-/);
    expect(css).toContain(".dark [data-chart=chart-");
  });

  it("supports the theme variant of ChartConfig (light/dark colors)", () => {
    const config = {
      revenue: {
        label: "Receita",
        theme: { light: "var(--chart-1)", dark: "var(--chart-2)" },
      },
    } satisfies ChartConfig;
    const { container } = render(
      withSize(
        <ChartContainer id="theme" config={config}>
          <LineChart data={baseData}>
            <Line dataKey="revenue" stroke="var(--color-revenue)" />
          </LineChart>
        </ChartContainer>,
      ),
    );
    const css = container.querySelector("style")?.innerHTML ?? "";
    expect(css).toContain("--color-revenue: var(--chart-1);");
    expect(css).toContain(".dark [data-chart=chart-theme]");
    expect(css).toContain("--color-revenue: var(--chart-2);");
  });

  it("skips ChartStyle entirely when no entry declares color or theme", () => {
    const config = {
      revenue: { label: "Receita" },
    } satisfies ChartConfig;
    const { container } = render(
      withSize(
        <ChartContainer config={config}>
          <LineChart data={baseData}>
            <Line dataKey="revenue" />
          </LineChart>
        </ChartContainer>,
      ),
    );
    expect(container.querySelector("style")).toBeNull();
  });

  it("renders SVG chart geometry for a LineChart", () => {
    const { container } = render(withSize(<LineSample />));
    // Recharts renders <svg> + path elements once layout is observed.
    const svg = container.querySelector(".recharts-surface");
    expect(svg).not.toBeNull();
  });

  it("renders bars for a BarChart", () => {
    const { container } = render(withSize(<BarSample />));
    expect(container.querySelector(".recharts-bar")).not.toBeNull();
  });

  it("renders a pie slice for a PieChart", () => {
    const { container } = render(withSize(<PieSample />));
    expect(container.querySelector(".recharts-pie")).not.toBeNull();
  });
});

// WHY: `<ChartTooltipContent>` and `<ChartLegendContent>` are
// presentational — they read `payload` from props and `config` from
// `ChartContext`. Recharts normally injects `payload` at hover time, but
// in jsdom that lifecycle is unreliable. Since both components fall back
// to an empty config when no `ChartContext` is present (graceful
// degradation), we can render them standalone in tests and pass a
// canonical payload shape directly.
function TooltipHarness(props: ComponentProps<typeof ChartTooltipContent>) {
  return (
    <ChartConfigProvider config={baseConfig}>
      <ChartTooltipContent {...props} />
    </ChartConfigProvider>
  );
}

describe("<ChartTooltipContent />", () => {
  it("returns null when inactive (no payload)", () => {
    const { container } = render(withSize(<TooltipHarness />));
    // Tooltip content has nothing to render when not active.
    expect(container.querySelector(".grid.min-w-\\[8rem\\]")).toBeNull();
  });

  it("renders rows when active=true with payload", () => {
    render(
      withSize(
        <TooltipHarness
          active
          payload={[
            {
              dataKey: "revenue",
              name: "revenue",
              value: 400,
              color: "var(--chart-1)",
              payload: { name: "Jan", revenue: 400 },
            },
          ]}
          label="Jan"
        />,
      ),
    );
    expect(screen.getByText("Receita")).toBeInTheDocument();
    expect(screen.getByText("400")).toBeInTheDocument();
  });

  it("respects hideLabel by suppressing the label row", () => {
    render(
      withSize(
        <TooltipHarness
          active
          hideLabel
          payload={[
            {
              dataKey: "revenue",
              name: "revenue",
              value: 100,
              color: "var(--chart-1)",
              payload: { name: "Jan" },
            },
          ]}
          label="Jan"
        />,
      ),
    );
    expect(screen.queryByText("Jan")).toBeNull();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("uses formatter when provided", () => {
    render(
      withSize(
        <TooltipHarness
          active
          payload={[
            {
              dataKey: "revenue",
              name: "revenue",
              value: 1234,
              color: "var(--chart-1)",
              payload: { name: "Jan" },
            },
          ]}
          label="Jan"
          formatter={(value, name) => (
            <span data-testid="custom-row">{`${name}=${value}`}</span>
          )}
        />,
      ),
    );
    expect(screen.getByTestId("custom-row")).toHaveTextContent("revenue=1234");
  });
});

function LegendHarness(props: ComponentProps<typeof ChartLegendContent>) {
  return (
    <ChartConfigProvider config={baseConfig}>
      <ChartLegendContent {...props} />
    </ChartConfigProvider>
  );
}

describe("<ChartLegendContent />", () => {
  it("returns null when payload is empty", () => {
    const { container } = render(withSize(<LegendHarness />));
    // No legend entries rendered when payload is undefined/empty.
    expect(
      container.querySelector(".flex.items-center.justify-center.gap-4"),
    ).toBeNull();
  });

  it("renders entries with the labels declared in config", () => {
    render(
      withSize(
        <LegendHarness
          payload={[
            { value: "revenue", dataKey: "revenue", color: "var(--chart-1)" },
            { value: "expense", dataKey: "expense", color: "var(--chart-3)" },
          ]}
        />,
      ),
    );
    expect(screen.getByText("Receita")).toBeInTheDocument();
    expect(screen.getByText("Despesa")).toBeInTheDocument();
  });
});

describe("<ChartStyle /> direct render", () => {
  it("emits no DOM when no color/theme is configured", () => {
    const { container } = render(<ChartStyle id="chart-empty" config={{ x: { label: "x" } }} />);
    expect(container.querySelector("style")).toBeNull();
  });

  it("renders one style element with light + dark blocks when colors are configured", () => {
    const { container } = render(
      <ChartStyle
        id="chart-direct"
        config={{
          a: { color: "var(--chart-1)" },
          b: { color: "var(--chart-2)" },
        }}
      />,
    );
    const styles = container.querySelectorAll("style");
    expect(styles.length).toBe(1);
    const css = styles[0]?.innerHTML ?? "";
    expect(css).toContain("[data-chart=chart-direct]");
    expect(css).toContain(".dark [data-chart=chart-direct]");
    expect(css).toContain("--color-a: var(--chart-1);");
    expect(css).toContain("--color-b: var(--chart-2);");
  });
});

describe("a11y (jest-axe light + dark)", () => {
  it("has no violations for a LineChart (light + dark)", async () => {
    const { container } = render(withSize(<LineSample />));
    await axeInThemes(container);
  });

  it("has no violations for a BarChart (light + dark)", async () => {
    const { container } = render(withSize(<BarSample />));
    await axeInThemes(container);
  });

  it("has no violations for a PieChart (light + dark)", async () => {
    const { container } = render(withSize(<PieSample />));
    await axeInThemes(container);
  });
});
