import {
  LineChart,
  Line,
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
  count: {
    label: "Documents created",
    color: "var(--color-primary)",
  },
};

export function DocsLineChart() {
  const { filters } = useFilters();
  const data = useDataProvider();
  const { data: points } = data.useDocsLineChart({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  return (
    <div className="space-y-4 rounded-lg border border-border p-6">
      <h2 className="text-sm font-medium text-foreground">
        Docs created over time
      </h2>
      <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
        <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
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
            allowDecimals={false}
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
                formatter={(value) => {
                  const n = value as number;
                  return `${n} document${n === 1 ? "" : "s"} created`;
                }}
              />
            }
          />
          <Line
            type="linear"
            dataKey="count"
            stroke="var(--color-count)"
            strokeWidth={2}
            dot={{ r: 4, fill: "var(--color-count)" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
