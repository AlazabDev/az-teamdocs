import { useDataProvider } from "@/lib/data-provider";
import { PageHeading } from "@/components/base/page-heading";
import { RecentDocuments } from "./components/recent-documents";
import { Blankslate } from "./components/blankslate";

export default function OverviewPage() {
  const data = useDataProvider();
  const { data: stats } = data.useOverviewStats();
  const { data: docs, isLoading } = data.useRecentDocuments();

  const isEmpty = !isLoading && docs.length === 0;

  return (
    <div className="mx-auto max-w-[933px] px-6">
      <PageHeading
        title="Overview"
        subtitle={`${stats.totalDocs} documents`}
      />
      {isEmpty ? <Blankslate /> : <RecentDocuments />}
    </div>
  );
}
