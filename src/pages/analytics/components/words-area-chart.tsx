import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useDataProvider } from "@/lib/data-provider";
import { useFilters } from "@/lib/filter-context";
import { formatDate } from "@/lib/utils";

const chartConfig: ChartConfig = {
  cumulative_words: {
    label: "Words total",
    color: "var(--color-primary)",
  },
};

export function WordsAreaChart() {
  const { filters } = useFilters();
  const data = useDataProvider();
  const { data: points } = data.useWordsAreaChart({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  return (
    <div className="space-y-4 rounded-lg border border-border p-6">
      <h2 className="text-sm font-medium text-foreground">
        Cumulative words written
      </h2>
      <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
        <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="wordsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-cumulative_words)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--color-cumulative_words)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickFormatter={formatDate}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v as number).toLocaleString()}`}
            tickMargin={8}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  if (!payload?.[0]?.payload?.date) return "";
                  const d = new Date(payload[0].payload.date + "T00:00:00");
                  return d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                }}
                formatter={(value) =>
                  `${(value as number).toLocaleString()} words total`
                }
              />
            }
          />
          <Area
            type="monotone"
            dataKey="cumulative_words"
            stroke="var(--color-cumulative_words)"
            strokeWidth={2}
            fill="url(#wordsGradient)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
