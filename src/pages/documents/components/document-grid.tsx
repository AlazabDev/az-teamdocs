import { Link, useLocation } from "react-router-dom";
import { IconDots, IconExternalLink, IconTrash } from "@tabler/icons-react";
import { DocItem } from "@/components/base/doc-item";
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

interface DocumentGridProps {
  documents: DocumentRow[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onDeleteSingle: (id: string, title: string) => void;
}

function DocActionMenu({ doc, prefix, onDelete }: { doc: DocumentRow; prefix: string; onDelete: (id: string, title: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="bg-background/80 backdrop-blur-sm"
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

export function DocumentGrid({
  documents,
  onDeleteSingle,
}: DocumentGridProps) {
  const { pathname } = useLocation();
  const prefix = pathname.startsWith("/demo") ? "/demo" : "";

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {documents.map((doc) => (
        <DocItem
          key={doc.id}
          id={doc.id}
          title={doc.title}
          updatedAt={doc.updated_at}
          prefix={prefix}
          variant="grid"
          preview={<ContentPreview content={doc.content} text={doc.content_text} />}
          action={<DocActionMenu doc={doc} prefix={prefix} onDelete={onDeleteSingle} />}
        />
      ))}
    </div>
  );
}
