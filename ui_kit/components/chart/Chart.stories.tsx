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

const monthly = [
  { name: "Jan", revenue: 4200, cost: 2800 },
  { name: "Fev", revenue: 3900, cost: 2400 },
  { name: "Mar", revenue: 5100, cost: 3100 },
  { name: "Abr", revenue: 4800, cost: 2950 },
  { name: "Mai", revenue: 5600, cost: 3300 },
  { name: "Jun", revenue: 6100, cost: 3500 },
];

const revenueCostConfig = {
  revenue: { label: "Receita", color: "var(--chart-1)" },
  cost: { label: "Custo", color: "var(--chart-2)" },
} satisfies ChartConfig;

const distributionConfig = {
  Receita: { label: "Receita", color: "var(--chart-1)" },
  Custo: { label: "Custo", color: "var(--chart-2)" },
  Reserva: { label: "Reserva", color: "var(--chart-3)" },
  Investimento: { label: "Investimento", color: "var(--chart-4)" },
} satisfies ChartConfig;

const distributionData = [
  { name: "Receita", value: 52 },
  { name: "Custo", value: 28 },
  { name: "Reserva", value: 12 },
  { name: "Investimento", value: 8 },
];

export const Default: Story = {
  args: {
    config: revenueCostConfig,
    className: "h-[240px] w-full",
    "aria-label": "Receita e custo por mês",
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
        <Line type="monotone" dataKey="cost" stroke="var(--color-cost)" />
      </LineChart>
    </ChartContainer>
  ),
};

export const LineMultiSeries: Story = {
  args: {
    config: revenueCostConfig,
    className: "h-[240px] w-full",
    "aria-label": "Linhas: receita e custo por mês",
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
        <Line type="monotone" dataKey="cost" stroke="var(--color-cost)" strokeWidth={2} />
      </LineChart>
    </ChartContainer>
  ),
};

export const BarVariant: Story = {
  args: {
    config: revenueCostConfig,
    className: "h-[240px] w-full",
    "aria-label": "Barras: receita e custo por mês",
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
        <Bar dataKey="cost" fill="var(--color-cost)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
};

export const AreaVariant: Story = {
  args: {
    config: revenueCostConfig,
    className: "h-[240px] w-full",
    "aria-label": "Área: receita e custo por mês",
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
          dataKey="cost"
          stroke="var(--color-cost)"
          fill="var(--color-cost)"
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
        theme: { light: "var(--chart-1)", dark: "var(--chart-2)" },
      },
      cost: {
        label: "Custo",
        theme: { light: "var(--chart-3)", dark: "var(--chart-4)" },
      },
    } satisfies ChartConfig,
    className: "h-[240px] w-full",
    "aria-label": "Receita e custo com cores específicas por tema",
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
        <Line type="monotone" dataKey="cost" stroke="var(--color-cost)" strokeWidth={2} />
      </LineChart>
    </ChartContainer>
  ),
};
