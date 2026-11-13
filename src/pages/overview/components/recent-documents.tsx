import { Link, useLocation } from "react-router-dom";
import { DocItem } from "@/components/base/doc-item";
import { useDataProvider } from "@/lib/data-provider";

export function RecentDocuments() {
  const { pathname } = useLocation();
  const prefix = pathname.startsWith("/demo") ? "/demo" : "";

  const data = useDataProvider();
  const { data: docs, isLoading } = data.useRecentDocuments();

  if (isLoading) return <RecentDocumentsSkeleton />;

  if (docs.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground">Recent documents</h2>
      <div>
        {docs.map((doc) => (
          <DocItem
            key={doc.id}
            id={doc.id}
            title={doc.title}
            updatedAt={doc.updated_at}
            prefix={prefix}
            variant="list"
            author={doc.author}
          />
        ))}
      </div>
      <Link
        to={`${prefix}/documents`}
        className="inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        View all documents &rarr;
      </Link>
    </div>
  );
}

function RecentDocumentsSkeleton() {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground">Recent documents</h2>
      <div className="space-y-3">
        <div className="h-14 rounded-lg bg-accent/50" />
        <div className="h-14 rounded-lg bg-accent/50" />
        <div className="h-14 rounded-lg bg-accent/50" />
      </div>
    </div>
  );
}
