import { useDataProvider } from "@/lib/data-provider";
import { useFilters } from "@/lib/filter-context";
import { PageHeader } from "./components/page-header";
import { DocsLineChart } from "./components/docs-line-chart";
import { WordsAreaChart } from "./components/words-area-chart";
import { WordDistributionPie } from "./components/word-distribution-pie";
import { Blankslate } from "./components/blankslate";

export default function AnalyticsPage() {
  const { filters } = useFilters();
  const data = useDataProvider();
  const { data: lineData, isLoading } = data.useDocsLineChart({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  const isEmpty = !isLoading && lineData.length === 0;
  const documentCount = lineData.reduce((sum, pt) => sum + pt.count, 0);

  return (
    <div className="mx-auto max-w-[933px] space-y-6 px-6">
      <PageHeader documentCount={documentCount} isLoading={isLoading} />
      {isEmpty ? (
        <Blankslate />
      ) : (
        <>
          <DocsLineChart />
          <WordsAreaChart />
          <WordDistributionPie />
        </>
      )}
    </div>
  );
}
