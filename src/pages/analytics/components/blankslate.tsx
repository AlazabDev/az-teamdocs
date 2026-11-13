import { useNavigate, useLocation } from "react-router-dom";
import { IconChartBar } from "@tabler/icons-react";
import { Button } from "@/components/base/button";
import { useDataProvider } from "@/lib/data-provider";

export function Blankslate() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const prefix = pathname.startsWith("/demo") ? "/demo" : "";

  const data = useDataProvider();
  const { mutate: createDocument, isPending } = data.useCreateDocument();

  const handleCreate = async () => {
    const id = await createDocument();
    if (id) {
      navigate(`${prefix}/documents/${id}`);
    }
  };

  return (
    <div className="relative">
      {/* Skeleton background */}
      <div className="pointer-events-none space-y-6 p-4" aria-hidden="true">
        <div className="h-32 w-full rounded bg-accent" />
        <div className="h-32 w-full rounded bg-accent" />
        <div className="h-32 w-full rounded bg-accent" />
      </div>

      {/* Gradient fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-background to-transparent" />

      {/* Floating card */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex max-w-sm flex-col items-center gap-4 rounded-lg bg-background p-6 shadow-lg">
          <IconChartBar className="size-8 text-muted-foreground" />
          <p className="text-center text-sm font-medium text-foreground">
            Create your first document to see your writing stats.
          </p>
          <Button onClick={handleCreate} disabled={isPending}>
            New document &rarr;
          </Button>
        </div>
      </div>
    </div>
  );
}
