import {
  IconTrash,
  IconCopy,
  IconDownload,
  IconPencil,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface BatchActionBarProps {
  count: number;
  onDelete: () => void;
  onRename?: () => void;
  onDuplicate?: () => void;
  onExport?: () => void;
  onClear?: () => void;
}

export function BatchActionBar({
  count,
  onDelete,
  onRename,
  onDuplicate,
  onExport,
  onClear,
}: BatchActionBarProps) {
  const singleOnly = count === 1;

  return (
    <TooltipProvider>
    <div className="sticky bottom-0 flex items-center justify-between border-t border-border bg-background px-6 py-3">
      <div className="flex items-center gap-2">
        {onClear && (
          <Button variant="ghost" size="icon" className="size-7" onClick={onClear} aria-label="Clear selection">
            <IconX className="size-4" />
          </Button>
        )}
        <span className="text-sm text-muted-foreground">{count} selected</span>
      </div>

      <div className="flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 shadow-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                disabled={!singleOnly}
                onClick={onRename}
                aria-label="Rename"
              >
                <IconPencil className="size-4" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {singleOnly ? "Rename" : "Select one to rename"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full"
              onClick={onDuplicate}
              aria-label="Duplicate"
            >
              <IconCopy className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Duplicate</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full"
              onClick={onExport}
              aria-label="Export"
            >
              <IconDownload className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export</TooltipContent>
        </Tooltip>
      </div>

      <Button variant="destructive" size="sm" onClick={onDelete}>
        <IconTrash className="size-4" />
        Delete selected
      </Button>
    </div>
    </TooltipProvider>
  );
}
