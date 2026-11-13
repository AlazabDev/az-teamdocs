import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { IconDots, IconExternalLink, IconTrash, IconCalendar } from "@tabler/icons-react";
import { DocItem } from "@/components/base/doc-item";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ContentPreview } from "./content-preview";
import type { DocumentRow } from "@/data/seed";

interface DocumentListProps {
  documents: DocumentRow[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  onDeleteSingle: (id: string, title: string) => void;
}

function groupByMonth(docs: DocumentRow[]): Array<{ label: string; docs: DocumentRow[] }> {
  const groups: Map<string, DocumentRow[]> = new Map();
  for (const doc of docs) {
    const d = new Date(doc.updated_at);
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const existing = groups.get(label);
    if (existing) {
      existing.push(doc);
    } else {
      groups.set(label, [doc]);
    }
  }
  return Array.from(groups.entries()).map(([label, docs]) => ({ label, docs }));
}

function DocActionMenu({ doc, prefix, onDelete }: { doc: DocumentRow; prefix: string; onDelete: (id: string, title: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="opacity-0 transition-opacity group-hover:opacity-100"
          aria-label={`Actions for ${doc.title || "Untitled"}`}
        >
          <IconDots className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`${prefix}/documents/${doc.id}`}>
            <IconExternalLink className="size-4" />
            Open
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDelete(doc.id, doc.title)}
        >
          <IconTrash className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DocumentList({
  documents,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  allSelected,
  onDeleteSingle,
}: DocumentListProps) {
  const { pathname } = useLocation();
  const prefix = pathname.startsWith("/demo") ? "/demo" : "";

  const groups = useMemo(() => groupByMonth(documents), [documents]);
  const hasSelection = selectedIds.size > 0;

  return (
    <div>
      {documents.length > 0 && (
        <div className="flex items-center gap-3 pb-1 pt-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={onToggleAll}
            aria-label="Select all documents"
          />
          <span className="text-xs text-muted-foreground">
            {hasSelection ? `${selectedIds.size} selected` : "Select all"}
          </span>
        </div>
      )}
      {groups.map((group) => (
        <div key={group.label}>
          <div className="flex items-center gap-1.5 pb-1 pt-6">
            <IconCalendar className="size-3.5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              {group.label}
            </span>
          </div>

          {group.docs.map((doc) => {
            const isSelected = selectedIds.has(doc.id);
            return (
              <div key={doc.id} className="flex items-center gap-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect(doc.id)}
                  aria-label={`Select ${doc.title || "Untitled"}`}
                  className={
                    hasSelection
                      ? "opacity-100"
                      : "opacity-0 transition-opacity group-hover/row:opacity-100 data-[state=checked]:opacity-100"
                  }
                />
                <div className="group/row flex-1">
                  <DocItem
                    id={doc.id}
                    title={doc.title}
                    updatedAt={doc.updated_at}
                    prefix={prefix}
                    variant="list"
                    selected={isSelected}
                    author={doc.author}
                    preview={<ContentPreview content={doc.content} />}
                    action={<DocActionMenu doc={doc} prefix={prefix} onDelete={onDeleteSingle} />}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
