/**
 * Chat sidebar — browse all comment threads, filter by resolved/unresolved.
 *
 * Reference:
 * - sana-now-B31tBjuV.js line 2707 (ou) — chat message list
 * - sana-now-B31tBjuV.js line 2704 (ru) — container: flex-grow 1, flex-col, overflow-y auto, w-full, h-full
 * - sana-now-B31tBjuV.js line 2705 (iu) — header: p-16, flex, space-between, items-center
 * - create-page-full line 11362 — Chat button: iconId "chat--filled", variant "secondary"
 * - common-DsffkcZw line 5202 — i18n: "All messages", "Resolved comments"
 *
 * Comment card reference:
 * - editor-context-provider line 86560-86574 (Sue) — border 0.75rem, padding 1.25rem 0.675rem 0.675rem 1rem
 * - editor-context-provider line 86631 (iue) — content ref preview with blue bg
 * - editor-context-provider line 86643-86649 (nl) — resolve checkmark, green when resolved
 */

import { useState, useCallback, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconX, IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCommenting } from "./commenting-provider";
import { useResolveThread } from "@/lib/collaboration/use-comments";
import type { CommentThread } from "@/lib/collaboration/types";

interface CommentSidebarProps {
  onClose: () => void;
}

export function CommentSidebar({ onClose }: CommentSidebarProps) {
  const { threads, documentId, setActiveThreadId } = useCommenting();
  const [filter, setFilter] = useState<"all" | "resolved">("all");
  const resolveMutation = useResolveThread();

  const filteredThreads = useMemo(() => {
    if (filter === "resolved") {
      return threads.filter((t) => t.resolved_at !== null);
    }
    // "all" shows unresolved (matching reference: default filter is "unresolved")
    return threads.filter((t) => t.resolved_at === null);
  }, [threads, filter]);

  const handleResolveToggle = useCallback(
    (thread: CommentThread) => {
      resolveMutation.mutate({
        threadId: thread.id,
        documentId,
        isResolved: thread.resolved_at === null,
      });
    },
    [resolveMutation, documentId],
  );

  const handleView = useCallback(
    (threadId: string) => {
      // Set active thread — opens inline popover, keeps sidebar open
      setActiveThreadId(threadId);
    },
    [setActiveThreadId],
  );

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden"
    >
      {/* iu — header: padding, flex row, space-between, items-center */}
      <div className="relative flex items-center justify-between px-4 pb-6 pt-4 pl-3">
        <Select value={filter} onValueChange={(v) => setFilter(v as "all" | "resolved")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All messages</SelectItem>
            <SelectItem value="resolved">Resolved comments</SelectItem>
          </SelectContent>
        </Select>
        <button
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded hover:bg-muted"
        >
          <IconX className="size-4" />
        </button>
      </div>

      {/* Scrollable comment list */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {filteredThreads.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
            <p className="text-sm text-muted-foreground">
              {filter === "resolved" ? "No resolved comments" : "No unresolved comments"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredThreads.map((thread) => (
              <SidebarCommentCard
                key={thread.id}
                thread={thread}
                onView={() => handleView(thread.id)}
                onResolveToggle={() => handleResolveToggle(thread)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom input — placeholder only, general messages not implemented */}
      <div className="px-3 py-3">
        <div className="rounded border border-border/50 px-3 py-2 text-sm text-muted-foreground">
          Write something…
        </div>
      </div>
    </div>
  );
}

/**
 * Single comment card in the sidebar.
 * Reference: Sue (line 86560) — bordered card with content ref preview + body + View + resolve
 */
function SidebarCommentCard({
  thread,
  onView,
  onResolveToggle,
}: {
  thread: CommentThread;
  onView: () => void;
  onResolveToggle: () => void;
}) {
  const rootComment = thread.comments[0];
  if (!rootComment) return null;

  const name = rootComment.profiles?.full_name ?? "User";
  const isResolved = thread.resolved_at !== null;

  return (
    <div>
      {/* Author row */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            {rootComment.profiles?.avatar_url && (
              <AvatarImage src={rootComment.profiles.avatar_url} alt={name} />
            )}
            <AvatarFallback className="text-[10px] font-medium">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold">{name}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatTimeAgo(rootComment.created_at)}
        </span>
      </div>

      {/* Sue — comment card */}
      <div
        className="relative flex flex-col gap-3 overflow-hidden rounded-xl text-sm transition-all duration-100 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
        style={{
          padding: "1.25rem 0.675rem 0.675rem 1rem",
          margin: "0.25rem 0",
          backgroundColor: "#fafafa",
          border: "1px solid #fff",
          boxShadow: "rgba(0, 0, 0, 0.01) 0px 0px 2px 0px, rgba(0, 0, 0, 0.02) 0px 4px 12px 0px, rgba(0, 0, 0, 0.04) 0 0 0 0.5px",
        }}
      >
        {/* Resolved banner */}
        {isResolved && (
          <div className="absolute inset-x-0 top-0 bg-muted py-0.5 text-center text-xs font-semibold text-muted-foreground">
            Resolved
          </div>
        )}

        <div className={isResolved ? "pt-4" : ""}>
          {/* iue — content ref preview */}
          {thread.content_ref.type === "range" && thread.content_ref.rangePreview && (
            <div className="mb-2">
              <span className="inline-block max-w-full truncate rounded-sm bg-blue-50 px-1.5 py-0.5 text-xs text-muted-foreground">
                {thread.content_ref.rangePreview}
              </span>
            </div>
          )}

          {/* Comment body */}
          <p className="text-sm">{extractText(rootComment.body)}</p>

          {/* Footer: View + Resolve */}
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={onView}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View
            </button>
            <button
              onClick={onResolveToggle}
              className="flex size-7 items-center justify-center rounded-full"
            >
              <IconCheck
                className={cn("size-5", isResolved ? "text-green-500" : "text-foreground")}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function extractText(body: Record<string, unknown>): string {
  const content = body?.content as
    | { content?: { text?: string }[] }[]
    | undefined;
  if (!content) return "";
  return content
    .flatMap((node) => node.content?.map((c) => c.text ?? "") ?? [])
    .join("");
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name[0] ?? "?").toUpperCase();
}
