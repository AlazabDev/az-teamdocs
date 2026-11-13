import { useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IconSearch,
  IconList,
  IconLayoutGrid,
  IconPlus,
} from "@tabler/icons-react";
import { useDataProvider } from "@/lib/data-provider";
import { useDebounce } from "@/lib/use-debounce";
import { PageHeading } from "@/components/base/page-heading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentList } from "./components/document-list";
import { DocumentGrid } from "./components/document-grid";
import { BatchActionBar } from "./components/batch-action-bar";
import { DeleteConfirmDialog } from "./components/delete-confirm-dialog";
import { Blankslate } from "./components/blankslate";
import type { DocumentFilters } from "@/data/seed";

const sortLabels: Record<NonNullable<DocumentFilters["sort"]>, string> = {
  date: "Date",
  title: "Title A–Z",
  words: "Words",
  author: "Author",
};

export default function DocumentsPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const prefix = pathname.startsWith("/demo") ? "/demo" : "";

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<DocumentFilters["sort"]>("date");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "single" | "batch";
    id?: string;
    title?: string;
  } | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const data = useDataProvider();
  const { data: documents, isLoading } = data.useDocuments({
    search: debouncedSearch || undefined,
    sort,
  });
  const { mutate: deleteDocument } = data.useDeleteDocument();
  const { mutate: deleteDocuments } = data.useDeleteDocuments();
  const { mutate: createDocument, isPending: isCreating } = data.useCreateDocument();

  const isEmpty = !isLoading && documents.length === 0 && !debouncedSearch;
  const isEmptySearch = !isLoading && documents.length === 0 && !!debouncedSearch;
  const hasSelection = selectedIds.size > 0;
  const allSelected = documents.length > 0 && selectedIds.size === documents.length;

  const handleNew = async () => {
    const id = await createDocument();
    if (id) navigate(`${prefix}/documents/${id}`);
  };

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(documents.map((d) => d.id)));
    }
  }, [allSelected, documents]);

  const handleDeleteSingle = useCallback((id: string, title: string) => {
    setDeleteTarget({ type: "single", id, title });
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    setDeleteTarget({ type: "batch" });
  }, [selectedIds.size]);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "single" && deleteTarget.id) {
      deleteDocument(deleteTarget.id);
    } else if (deleteTarget.type === "batch") {
      deleteDocuments(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
    setDeleteTarget(null);
  }, [deleteTarget, deleteDocument, deleteDocuments, selectedIds]);

  const deleteDialogTitle = useMemo(() => {
    if (!deleteTarget) return "";
    if (deleteTarget.type === "single") return "Delete document?";
    return `Delete ${selectedIds.size} documents?`;
  }, [deleteTarget, selectedIds.size]);

  const deleteDialogDescription = useMemo(() => {
    if (!deleteTarget) return "";
    if (deleteTarget.type === "single") {
      return `"${deleteTarget.title}" will be permanently deleted. This can't be undone.`;
    }
    return "This can't be undone.";
  }, [deleteTarget]);

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="mx-auto w-full max-w-[933px] px-6">
        <PageHeading
          title={hasSelection ? `${selectedIds.size} selected` : "Documents"}
          subtitle={
            hasSelection
              ? `of ${documents.length} ${documents.length === 1 ? "document" : "documents"}`
              : `${documents.length} ${documents.length === 1 ? "document" : "documents"}`
          }
          action={
            <Button size="sm" onClick={handleNew} disabled={isCreating}>
              <IconPlus className="size-4" />
              New
            </Button>
          }
        />

        {/* Search + view toggle + sort */}
        {!isEmpty && (
          <>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <IconSearch className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search documents…"
                  className="pl-10"
                />
              </div>
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(val) => {
                  if (val === "list" || val === "grid") setViewMode(val);
                }}
                className="gap-0"
              >
                <ToggleGroupItem value="list" aria-label="List view" className="size-8 px-0">
                  <IconList className="size-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="grid" aria-label="Grid view" className="size-8 px-0">
                  <IconLayoutGrid className="size-4" />
                </ToggleGroupItem>
              </ToggleGroup>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">by</span>
                <Select
                  value={sort ?? "date"}
                  onValueChange={(v) => setSort(v as DocumentFilters["sort"])}
                >
                  <SelectTrigger className="h-auto border-none p-0 font-medium text-primary shadow-none focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(sortLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {/* Content */}
        <div className="space-y-4 py-4">
          {isEmpty && <Blankslate />}

          {isEmptySearch && (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No results for &ldquo;{debouncedSearch}&rdquo;.
              </p>
              <p className="text-sm text-muted-foreground">
                Try a different search term.
              </p>
            </div>
          )}

          {!isEmpty && !isEmptySearch && documents.length > 0 && (
            viewMode === "list" ? (
              <DocumentList
                documents={documents}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleAll={handleToggleAll}
                allSelected={allSelected}
                onDeleteSingle={handleDeleteSingle}
              />
            ) : (
              <DocumentGrid
                documents={documents}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onDeleteSingle={handleDeleteSingle}
              />
            )
          )}
        </div>
      </div>

      {hasSelection && (
        <BatchActionBar
          count={selectedIds.size}
          onDelete={handleDeleteSelected}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={deleteDialogTitle}
        description={deleteDialogDescription}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
