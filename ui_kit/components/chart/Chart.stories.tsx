import type { Meta, StoryObj } from "@storybook/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./index";

const meta = {
  title: "Components/Chart",
  component: ChartContainer,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Wrapper sobre Recharts com paleta tokenizada (`--chart-1..5`), tooltip e legend acessíveis. Use `config` para declarar `label` e `color`/`theme` por série; o wrapper expõe `--color-<key>` para alimentar `stroke`/`fill` dentro do Recharts.",
      },
    },
  },
} satisfies Meta<typeof ChartContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

// WHY: convenção universal Lighthouse (Brand Notion → Gráficos):
// receita/positivo = signal-green (chart-2), despesa/negativo = signal-red (chart-5).
const monthly = [
  { name: "Jan", revenue: 4200, expense: 2800 },
  { name: "Fev", revenue: 3900, expense: 2400 },
  { name: "Mar", revenue: 5100, expense: 3100 },
  { name: "Abr", revenue: 4800, expense: 2950 },
  { name: "Mai", revenue: 5600, expense: 3300 },
  { name: "Jun", revenue: 6100, expense: 3500 },
];

const revenueExpenseConfig = {
  revenue: { label: "Receita", color: "var(--chart-2)" },
  expense: { label: "Despesa", color: "var(--chart-5)" },
} satisfies ChartConfig;

const distributionConfig = {
  Receita: { label: "Receita", color: "var(--chart-2)" },
  Despesa: { label: "Despesa", color: "var(--chart-5)" },
  Reserva: { label: "Reserva", color: "var(--chart-3)" },
  Investimento: { label: "Investimento", color: "var(--chart-1)" },
} satisfies ChartConfig;

const distributionData = [
  { name: "Receita", value: 52 },
  { name: "Despesa", value: 28 },
  { name: "Reserva", value: 12 },
  { name: "Investimento", value: 8 },
];

export const Default: Story = {
  args: {
    config: revenueExpenseConfig,
    className: "h-[240px] w-full",
    "aria-label": "Receita e despesa por mês",
  } as unknown as Story["args"],
  render: (args) => (
    <ChartContainer {...args}>
      <LineChart data={monthly}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend content={<ChartLegendContent />} />
        <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" />
        <Line type="monotone" dataKey="expense" stroke="var(--color-expense)" />
      </LineChart>
    </ChartContainer>
  ),
};

export const LineMultiSeries: Story = {
  args: {
    config: revenueExpenseConfig,
    className: "h-[240px] w-full",
    "aria-label": "Linhas: receita e despesa por mês",
  } as unknown as Story["args"],
  render: (args) => (
    <ChartContainer {...args}>
      <LineChart data={monthly}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
        <Line type="monotone" dataKey="expense" stroke="var(--color-expense)" strokeWidth={2} />
      </LineChart>
    </ChartContainer>
  ),
};

export const BarVariant: Story = {
  args: {
    config: revenueExpenseConfig,
    className: "h-[240px] w-full",
    "aria-label": "Barras: receita e despesa por mês",
  } as unknown as Story["args"],
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart data={monthly}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
        <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
};

export const AreaVariant: Story = {
  args: {
    config: revenueExpenseConfig,
    className: "h-[240px] w-full",
    "aria-label": "Área: receita e despesa por mês",
  } as unknown as Story["args"],
  render: (args) => (
    <ChartContainer {...args}>
      <AreaChart data={monthly}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-revenue)"
          fill="var(--color-revenue)"
          fillOpacity={0.2}
        />
        <Area
          type="monotone"
          dataKey="expense"
          stroke="var(--color-expense)"
          fill="var(--color-expense)"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ChartContainer>
  ),
};

export const PieVariant: Story = {
  // WHY: Recharts emits inner <svg> elements (via <Sector>) that axe tags
  // with `svg-img-alt` because they receive an implicit graphics role
  // without an accessible name. The outer `ChartContainer` already
  // exposes `role="img"` + `aria-label="Distribuição percentual"`, which
  // is the canonical pattern for chart graphics — screen readers read the
  // chart-level description, not per-slice paths. We disable the rule on
  // this single story per `lex-brand-colors` per-story opt-out convention.
  parameters: {
    a11y: {
      config: {
        rules: [{ id: "svg-img-alt", enabled: false }],
      },
    },
  },
  args: {
    config: distributionConfig,
    className: "h-[260px] w-full",
    "aria-label": "Distribuição percentual",
  } as unknown as Story["args"],
  render: (args) => (
    <ChartContainer {...args}>
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Pie
          data={distributionData}
          dataKey="value"
          nameKey="name"
          innerRadius={48}
          outerRadius={84}
          paddingAngle={2}
        >
          {distributionData.map((slice) => (
            <Cell key={slice.name} fill={`var(--color-${slice.name})`} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  ),
};

export const ThemeAware: Story = {
  args: {
    config: {
      revenue: {
        label: "Receita",
        theme: { light: "var(--chart-2)", dark: "var(--chart-2)" },
      },
      expense: {
        label: "Despesa",
        theme: { light: "var(--chart-5)", dark: "var(--chart-5)" },
      },
    } satisfies ChartConfig,
    className: "h-[240px] w-full",
    "aria-label": "Receita e despesa com cores específicas por tema",
  } as unknown as Story["args"],
  render: (args) => (
    <ChartContainer {...args}>
      <LineChart data={monthly}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
        <Line type="monotone" dataKey="expense" stroke="var(--color-expense)" strokeWidth={2} />
      </LineChart>
    </ChartContainer>
  ),
};
