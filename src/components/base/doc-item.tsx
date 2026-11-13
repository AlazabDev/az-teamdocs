import { Link } from "react-router-dom";
import { cn, formatDate } from "@/lib/utils";
import { DocThumbnail } from "@/components/base/doc-thumbnail";

const paperShadow =
  "rgba(0, 0, 0, 0.02) 0px 0px 2px 0px, rgba(0, 0, 0, 0.04) 0px 4px 12px 0px, rgba(0, 0, 0, 0.08) 0 0 0 0.5px";

interface DocItemProps {
  id: string;
  title: string;
  updatedAt: string;
  prefix: string;
  variant: "list" | "grid";
  selected?: boolean;
  author?: {
    full_name: string;
    initials: string;
    avatar_url: string | null;
  };
  meta?: string;
  preview?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
}

export function DocItem({
  id,
  title,
  updatedAt,
  prefix,
  variant,
  selected = false,
  author,
  meta,
  preview,
  action,
  onClick,
}: DocItemProps) {
  const displayTitle = title || "Untitled";
  const metaText = meta ?? `Document · ${formatDate(updatedAt)}${author ? ` · ${author.full_name}` : ""}`;

  if (variant === "grid") {
    return (
      <div
        className="group relative"
        aria-selected={selected}
        onClick={onClick}
      >
        <Link
          to={`${prefix}/documents/${id}`}
          className={cn(
            "block rounded-[10px] outline-2 outline-offset-2 outline-transparent transition-[outline-color] focus-visible:outline-ring",
            selected && "outline-primary",
          )}
        >
          <div
            className="aspect-[1/1.414] w-full overflow-hidden rounded-[10px] p-3 transition-shadow hover:shadow-md"
            style={{ backgroundColor: "#fff", boxShadow: paperShadow }}
          >
            {preview}
          </div>
          <div className="mt-2 px-0.5">
            <p className="line-clamp-2 text-sm font-semibold text-foreground">
              {displayTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(updatedAt)}
            </p>
          </div>
        </Link>
        {action && (
          <div
            className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            {action}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-[10px] py-2 transition-colors hover:bg-accent/50",
        selected && "bg-primary/10",
      )}
      aria-selected={selected}
      onClick={onClick}
    >
      <Link
        to={`${prefix}/documents/${id}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-[10px] outline-2 outline-offset-2 outline-transparent focus-visible:outline-ring"
      >
        <DocThumbnail author={author}>{preview}</DocThumbnail>
        <div className="min-w-0 flex-1">
          <span className="truncate text-base font-semibold text-foreground">
            {displayTitle}
          </span>
          <p className="truncate text-xs text-muted-foreground">{metaText}</p>
        </div>
      </Link>
      {action && (
        <div onClick={(e) => e.stopPropagation()}>{action}</div>
      )}
    </div>
  );
}
