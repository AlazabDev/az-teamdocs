import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeading } from "@/components/base/page-heading";
import { useFilters, type DateRangePreset } from "@/lib/filter-context";

interface PageHeaderProps {
  documentCount: number;
  isLoading: boolean;
}

const presetLabels: Record<DateRangePreset, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  all: "All time",
};

export function PageHeader({ documentCount, isLoading }: PageHeaderProps) {
  const { filters, setDateRangePreset } = useFilters();

  const subtitle = isLoading
    ? undefined
    : documentCount === 0
      ? "No data yet"
      : `${documentCount} ${documentCount === 1 ? "document" : "documents"}`;

  return (
    <PageHeading
      title="Analytics"
      subtitle={subtitle}
      action={
        <Select
          value={filters.dateRangePreset}
          onValueChange={(v) => setDateRangePreset(v as DateRangePreset)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">{presetLabels["7d"]}</SelectItem>
            <SelectItem value="30d">{presetLabels["30d"]}</SelectItem>
            <SelectItem value="90d">{presetLabels["90d"]}</SelectItem>
            <SelectItem value="all">{presetLabels.all}</SelectItem>
          </SelectContent>
        </Select>
      }
    />
  );
}
