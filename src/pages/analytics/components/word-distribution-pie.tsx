import { Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useDataProvider } from "@/lib/data-provider";
import { useFilters } from "@/lib/filter-context";

const BUCKET_COLORS = [
  "var(--color-primary)",
  "oklch(0.65 0.15 250)",
  "oklch(0.55 0.12 250)",
  "oklch(0.45 0.10 250)",
];

const chartConfig: ChartConfig = {
  "Under 300": {
    label: "Under 300 words",
    color: BUCKET_COLORS[0],
  },
  "300–700": {
    label: "300–700 words",
    color: BUCKET_COLORS[1],
  },
  "700–1,200": {
    label: "700–1,200 words",
    color: BUCKET_COLORS[2],
  },
  "Over 1,200": {
    label: "Over 1,200 words",
    color: BUCKET_COLORS[3],
  },
};

export function WordDistributionPie() {
  const { filters } = useFilters();
  const data = useDataProvider();
  const { data: slices } = data.useWordDistributionPie({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  const total = slices.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-4 rounded-lg border border-border p-6">
      <h2 className="text-sm font-medium text-foreground">
        Word count distribution
      </h2>
      <div className="flex items-center gap-8">
        <ChartContainer config={chartConfig} className="aspect-square w-[200px]">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => {
                    const n = value as number;
                    const pct = total > 0 ? ((n / total) * 100).toFixed(1) : "0";
                    return `${name} — ${n} document${n === 1 ? "" : "s"} · ${pct}%`;
                  }}
                />
              }
            />
            <Pie
              data={slices}
              dataKey="count"
              nameKey="bucket"
              cx="50%"
              cy="50%"
              outerRadius={80}
              strokeWidth={2}
              stroke="var(--background)"
            >
              {slices.map((entry, index) => (
                <Cell
                  key={entry.bucket}
                  fill={BUCKET_COLORS[index % BUCKET_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="flex flex-col gap-2">
          {slices.map((slice, index) => {
            const pct = total > 0 ? ((slice.count / total) * 100).toFixed(1) : "0";
            return (
              <div key={slice.bucket} className="flex items-center gap-2 text-sm">
                <div
                  className="size-2.5 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: BUCKET_COLORS[index % BUCKET_COLORS.length] }}
                />
                <span className="text-muted-foreground">{slice.bucket} words</span>
                <span className="tabular-nums text-foreground">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
