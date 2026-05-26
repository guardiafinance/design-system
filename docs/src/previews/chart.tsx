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

// WHY: convenção universal Lighthouse (Brand Notion → Gráficos):
// receita/positivo = signal-green, despesa/negativo = signal-red.
const monthly = [
  { name: "Jan", revenue: 4200, expense: 2800 },
  { name: "Fev", revenue: 3900, expense: 2400 },
  { name: "Mar", revenue: 5100, expense: 3100 },
  { name: "Abr", revenue: 4800, expense: 2950 },
  { name: "Mai", revenue: 5600, expense: 3300 },
  { name: "Jun", revenue: 6100, expense: 3500 },
];

const revenueExpenseConfig = {
  revenue: { label: "Receita", color: "var(--chart-1)" },
  expense: { label: "Despesa", color: "var(--chart-3)" },
} satisfies ChartConfig;

const distributionConfig = {
  Receita: { label: "Receita", color: "var(--chart-1)" },
  Despesa: { label: "Despesa", color: "var(--chart-3)" },
  Reserva: { label: "Reserva", color: "var(--chart-4)" },
  Investimento: { label: "Investimento", color: "var(--chart-5)" },
} satisfies ChartConfig;

const distributionData = [
  { name: "Receita", value: 52 },
  { name: "Despesa", value: 28 },
  { name: "Reserva", value: 12 },
  { name: "Investimento", value: 8 },
];

export function LinePreview() {
  return (
    <ChartContainer
      config={revenueExpenseConfig}
      className="h-[260px] w-full"
      aria-label="Receita e despesa por mês"
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
          dataKey="expense"
          stroke="var(--color-expense)"
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
      config={revenueExpenseConfig}
      className="h-[260px] w-full"
      aria-label="Receita e despesa (barras)"
    >
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
  );
}

export function AreaPreview() {
  return (
    <ChartContainer
      config={revenueExpenseConfig}
      className="h-[260px] w-full"
      aria-label="Receita e despesa (área)"
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
          dataKey="expense"
          stroke="var(--color-expense)"
          fill="var(--color-expense)"
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
    theme: { light: "var(--chart-1)", dark: "var(--chart-1)" },
  },
  expense: {
    label: "Despesa",
    theme: { light: "var(--chart-3)", dark: "var(--chart-3)" },
  },
} satisfies ChartConfig;

export function ThemeAwarePreview() {
  return (
    <ChartContainer
      config={themedConfig}
      className="h-[260px] w-full"
      aria-label="Receita e despesa com cores específicas por tema"
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
          dataKey="expense"
          stroke="var(--color-expense)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}

export function PaletteSwatches() {
  // WHY: a paleta Lighthouse do Notion documenta apenas 4 cores
  // (verde, amarelo, vermelho, azul). O Recharts precisa de uma 5ª
  // série em alguns gráficos (ex.: pie chart com >4 fatias), então
  // a paleta foi estendida com o Laranja Quente da marca como cor
  // de destaque/baseline — escolha consistente com a função "acento
  // escasso" do laranja no Purple Mode.
  const tokens = [
    { name: "--chart-1", role: "Verde Sinal (positivo)" },
    { name: "--chart-2", role: "Amarelo Sinal (atenção)" },
    { name: "--chart-3", role: "Vermelho Sinal (negativo)" },
    { name: "--chart-4", role: "Azul Sinal (informativo)" },
    { name: "--chart-5", role: "Laranja Quente (destaque escasso)" },
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
