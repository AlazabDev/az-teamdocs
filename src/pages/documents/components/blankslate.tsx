import { useNavigate, useLocation } from "react-router-dom";
import { IconFilePlus } from "@tabler/icons-react";
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
    <div className="relative px-6">
      {/* Skeleton background */}
      <div className="pointer-events-none space-y-3 p-4" aria-hidden="true">
        <div className="h-4 w-3/4 rounded bg-accent" />
        <div className="h-4 w-1/2 rounded bg-accent" />
        <div className="h-4 w-2/3 rounded bg-accent" />
      </div>

      {/* Gradient fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-background to-transparent" />

      {/* Floating card */}
      <div className="absolute inset-0 flex items-start justify-center pt-[10%]">
        <div className="flex max-w-sm flex-col items-center gap-4 rounded-lg bg-background p-6 shadow-lg">
          <IconFilePlus className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            No documents yet
          </p>
          <Button onClick={handleCreate} disabled={isPending}>
            New document &rarr;
          </Button>
        </div>
      </div>
    </div>
  );
}
