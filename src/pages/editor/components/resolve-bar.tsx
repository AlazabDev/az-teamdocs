/**
 * Resolve/unresolve toggle for comment threads.
 * Two states:
 *   - Unresolved: checkmark icon button with "Resolve" tooltip
 *   - Resolved: "Unresolve" button + "Resolved Xm ago" text, orange pastel background
 *
 * Reference: editor-context-provider line 65272 (Vue) + lines 65388-65407
 */

import { IconCheck } from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useResolveThread } from "@/lib/collaboration/use-comments";

interface ResolveBarProps {
  threadId: string;
  documentId: string;
  isResolved: boolean;
  resolvedAt: string | null;
}

export function ResolveBar({
  threadId,
  documentId,
  isResolved,
  resolvedAt,
}: ResolveBarProps) {
  const { mutate } = useResolveThread();

  const handleToggle = () => {
    mutate({ threadId, documentId, isResolved: !isResolved });
  };

  if (isResolved && resolvedAt) {
    return (
      // Resolved state — orange pastel bg, border-radius 4px, gap 4px
      <div className="flex items-center justify-between gap-1 rounded bg-amber-50 px-2 py-0.5">
        <button
          onClick={handleToggle}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Unresolve
        </button>
        <span className="text-xs text-muted-foreground">
          Resolved {formatTimeAgo(resolvedAt)}
        </span>
      </div>
    );
  }

  return (
    // Unresolved state — checkmark icon button
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleToggle}
            className="flex size-6 items-center justify-center rounded hover:bg-muted"
          >
            <IconCheck className="size-4 text-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Resolve
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
