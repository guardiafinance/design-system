import {
  Area,
  AreaChart,
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

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@ds/components/chart";

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

export function LinePreview() {
  return (
    <ChartContainer
      config={revenueCostConfig}
      className="h-[260px] w-full"
      aria-label="Receita e custo por mês"
    >
      <LineChart data={monthly}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-revenue)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="cost"
          stroke="var(--color-cost)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}

export function BarPreview() {
  return (
    <ChartContainer
      config={revenueCostConfig}
      className="h-[260px] w-full"
      aria-label="Receita e custo (barras)"
    >
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
  );
}

export function AreaPreview() {
  return (
    <ChartContainer
      config={revenueCostConfig}
      className="h-[260px] w-full"
      aria-label="Receita e custo (área)"
    >
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
  );
}

export function PiePreview() {
  return (
    <ChartContainer
      config={distributionConfig}
      className="h-[280px] w-full"
      aria-label="Distribuição percentual"
    >
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Pie
          data={distributionData}
          dataKey="value"
          nameKey="name"
          innerRadius={52}
          outerRadius={90}
          paddingAngle={2}
        >
          {distributionData.map((slice) => (
            <Cell key={slice.name} fill={`var(--color-${slice.name})`} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

const themedConfig = {
  revenue: {
    label: "Receita",
    theme: { light: "var(--chart-1)", dark: "var(--chart-2)" },
  },
  cost: {
    label: "Custo",
    theme: { light: "var(--chart-3)", dark: "var(--chart-4)" },
  },
} satisfies ChartConfig;

export function ThemeAwarePreview() {
  return (
    <ChartContainer
      config={themedConfig}
      className="h-[260px] w-full"
      aria-label="Receita e custo com cores específicas por tema"
    >
      <LineChart data={monthly}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-revenue)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="cost"
          stroke="var(--color-cost)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}

export function PaletteSwatches() {
  const tokens = [
    { name: "--chart-1", role: "Destaque (laranja)" },
    { name: "--chart-2", role: "Categoria 2 (verde)" },
    { name: "--chart-3", role: "Categoria 3 (azul)" },
    { name: "--chart-4", role: "Categoria 4 (amarelo)" },
    { name: "--chart-5", role: "Categoria 5 (vermelho)" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {tokens.map((t) => (
        <div
          key={t.name}
          className="flex flex-col gap-2 rounded-md border border-border bg-card p-3"
        >
          <div
            aria-hidden="true"
            className="h-12 w-full rounded"
            style={{ backgroundColor: `var(${t.name})` }}
          />
          <code className="inline">{t.name}</code>
          <span className="text-[12px] text-muted-foreground">{t.role}</span>
        </div>
      ))}
    </div>
  );
}
