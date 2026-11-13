/**
 * Comment thread popover — 350px floating card anchored below a highlight.
 *
 * States (matching reference Wue component):
 *   Creating: no thread yet. Shows input + send. te=true, y=false.
 *   Browsing: thread exists. Shows header + body + "Reply" link. te=false, y=true.
 *   Replying: user clicked "Reply". Shows header + body + replies + input. te=true.
 *   Resolved: thread resolved. Header flips to column-reverse (resolve bar above avatar).
 */

import { useRef, useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconSend2 } from "@tabler/icons-react";
import { CommentInput, type CommentInputHandle } from "./comment-input";
import { CommentMessage } from "./comment-message";
import { ResolveBar } from "./resolve-bar";
import { useCommenting } from "./commenting-provider";
import type { Editor } from "@tiptap/react";

interface CommentThreadPopoverProps {
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function CommentThreadPopover({
  editor,
  containerRef,
}: CommentThreadPopoverProps) {
  const {
    draft,
    activeThreadId,
    setActiveThreadId,
    cancelDraft,
    submitComment,
    threads,
  } = useCommenting();

  const inputRef = useRef<CommentInputHandle>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<{ left: number; top: number } | null>(null);
  const lastAnchorRef = useRef<{ left: number; top: number } | null>(null);

  const isCreating = draft !== null;
  const activeThread = activeThreadId
    ? threads.find((t) => t.id === activeThreadId)
    : null;
  const isOpen = isCreating || activeThread !== null;

  // y = has messages, b = has replies (matching reference variable names)
  const y = activeThread !== null && activeThread.comments.length > 0;
  const b = activeThread !== null && activeThread.comments.length > 1;
  const isResolved = y && activeThread.resolved_at !== null;
  const rootComment = y ? activeThread.comments[0] : null;
  const replies = b ? activeThread.comments.slice(1) : [];

  // te = show input. true when creating, false when browsing (until "Reply" clicked)
  const [showInput, setShowInput] = useState(!y);
  // D = replies expanded
  const [repliesExpanded, setRepliesExpanded] = useState(false);

  // Reset state when thread changes
  useEffect(() => {
    setShowInput(!y);
    setRepliesExpanded(false);
  }, [activeThreadId, y]);

  // "Reply" click handler (re in reference)
  const handleReplyClick = () => {
    setShowInput(true);
    setRepliesExpanded(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // Submit handler
  const handleSubmit = () => {
    if (!inputRef.current) return;
    const body = inputRef.current.getJSON();

    // Check if body has any content (text nodes OR mention nodes)
    const content = (body as { content?: { content?: unknown[] }[] })?.content;
    const hasContent = content?.some((node) =>
      (node.content as unknown[] | undefined)?.some((child) => {
        const c = child as Record<string, unknown>;
        return (c.type === "text" && (c.text as string)?.trim()) || c.type === "mention";
      }),
    );
    if (!hasContent) return;

    submitComment({ threadId: activeThread?.id, body });
    inputRef.current.clear();

    if (isCreating) {
      cancelDraft();
    } else {
      // After reply: hide input, expand replies (matching reference A handler)
      setShowInput(false);
      setRepliesExpanded(true);
    }
  };

  // ── Anchor positioning ──────────────────────────────────────────
  const updateAnchor = useCallback(() => {
    if (!isOpen) { setAnchor(null); return; }

    let from: number | undefined;
    let to: number | undefined;

    if (isCreating && draft.contentRef.type === "range") {
      from = draft.contentRef.from;
      to = draft.contentRef.to;
    } else if (activeThread?.content_ref.type === "range") {
      from = activeThread.content_ref.from;
      to = activeThread.content_ref.to;
    }

    if (from == null || to == null) { setAnchor(null); return; }

    try {
      const view = editor.view;
      const startDOM = view.domAtPos(from);
      const endDOM = view.domAtPos(to);
      const domRange = document.createRange();
      domRange.setStart(startDOM.node, startDOM.offset);
      domRange.setEnd(endDOM.node, endDOM.offset);
      const rects = domRange.getClientRects();
      if (rects.length > 0) {
        const lastRect = rects[rects.length - 1];
        const pos = { left: lastRect.left, top: lastRect.bottom + 8 };
        lastAnchorRef.current = pos;
        setAnchor(pos);
      }
    } catch {
      if (lastAnchorRef.current && isOpen) {
        setAnchor(lastAnchorRef.current);
      } else {
        setAnchor(null);
      }
    }
  }, [editor, draft, activeThread, isCreating, isOpen]);

  useEffect(() => { updateAnchor(); }, [updateAnchor]);

  // ── Close handlers ──────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Ignore clicks inside the popover
      if (popoverRef.current && popoverRef.current.contains(target)) return;
      // Ignore clicks inside tippy popups (mention dropdown)
      if (target.closest("[data-tippy-root]")) return;

      lastAnchorRef.current = null;
      if (isCreating) cancelDraft();
      else setActiveThreadId(null);
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);
    return () => { clearTimeout(timer); document.removeEventListener("mousedown", handleClickOutside); };
  }, [isOpen, isCreating, cancelDraft, setActiveThreadId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        lastAnchorRef.current = null;
        if (isCreating) cancelDraft();
        else setActiveThreadId(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isCreating, cancelDraft, setActiveThreadId]);

  if (!isOpen || !anchor) return null;

  // Author profile for header (from root comment or current user)
  const authorName = rootComment?.profiles?.full_name ?? "You";
  const authorAvatar = rootComment?.profiles?.avatar_url ?? null;

  return (
    <div
      ref={popoverRef}
      className="fixed z-50"
      style={{
        left: anchor.left,
        top: anchor.top,
        width: 350,
        borderRadius: "0 0.75rem 0.75rem 0.75rem",
        filter: "drop-shadow(0px 8px 16px rgba(0,0,0,0.08))",
        transition: "all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)",
        willChange: "filter",
        backgroundColor: "#fff",
        color: "#000",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter = "drop-shadow(0px 8px 16px rgba(0,0,0,0.12))";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = "drop-shadow(0px 8px 16px rgba(0,0,0,0.08))";
      }}
    >
      <div className="relative grid gap-2 overflow-hidden p-4 text-left">
        {/* Resolved banner */}
        {isResolved && (
          <div className="absolute inset-x-0 top-0 bg-muted py-0.5 text-center text-xs font-semibold text-muted-foreground">
            Resolved
          </div>
        )}

        {/* Header + body (only in browsing/resolved mode) */}
        {y && rootComment && (
          <div className={isResolved ? "pt-4" : ""}>
            {/* Bue header — column-reverse when resolved */}
            <div className={`flex gap-2 ${isResolved ? "flex-col-reverse items-stretch justify-start" : "flex-row items-center justify-between"}`}>
              <div className="flex items-center gap-1.5">
                <Avatar className="size-5">
                  {authorAvatar && <AvatarImage src={authorAvatar} alt={authorName} />}
                  <AvatarFallback className="text-[10px] font-medium">
                    {getInitials(authorName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold">{authorName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(rootComment.created_at)}
                </span>
              </div>
              {/* Vue resolve bar */}
              <ResolveBar
                threadId={activeThread!.id}
                documentId={activeThread!.document_id}
                isResolved={isResolved}
                resolvedAt={activeThread!.resolved_at}
              />
            </div>

            {/* Content ref preview — blue quoted text */}
            {activeThread!.content_ref.type === "range" && activeThread!.content_ref.rangePreview && (
              <div className="mt-1.5">
                <span className="inline-block max-w-full truncate rounded-sm bg-blue-50 px-1.5 py-0.5 text-xs text-muted-foreground">
                  {activeThread!.content_ref.rangePreview}
                </span>
              </div>
            )}

            {/* Root comment body — i9 readonly (no hover actions on root) */}
            <div className="mt-2 text-sm">
              <RichTextBody body={rootComment.body} />
              {rootComment.edited_at && (
                <span className="text-xs text-muted-foreground"> (edited)</span>
              )}
            </div>
          </div>
        )}

        {/* Replies — animated expand/collapse */}
        {b && (
          <AnimatePresence>
            {repliesExpanded && (
              <motion.div
                initial={{ opacity: 0, maxHeight: 0 }}
                animate={{ opacity: 1, maxHeight: "30vh", transitionEnd: { overflowY: "auto" as const } }}
                exit={{ opacity: 0, maxHeight: 0 }}
                transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                className="overflow-hidden"
              >
                {replies.map((comment) => (
                  <div key={comment.id} className="border-t pt-2 mt-2">
                    <CommentMessage
                      comment={comment}
                      documentId={activeThread!.document_id}
                      onReply={handleReplyClick}
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Show/Hide answers toggle */}
        {b && (
          repliesExpanded ? (
            <button
              onClick={() => setRepliesExpanded(false)}
              className="justify-self-start whitespace-nowrap text-sm font-semibold text-muted-foreground transition-colors duration-100 hover:text-muted-foreground/80"
            >
              Hide answers
            </button>
          ) : (
            <button
              onClick={() => setRepliesExpanded(true)}
              className="justify-self-start whitespace-nowrap text-sm font-semibold text-muted-foreground transition-colors duration-100 hover:text-muted-foreground/80"
            >
              {replies.length === 1
                ? `Show ${replies.length} answer`
                : `Show ${replies.length} answers`}
            </button>
          )
        )}

        {/* Input OR "Reply" link — matches reference h === undefined || te */}
        {isCreating || showInput ? (
          <div className="relative">
            <CommentInput
              ref={inputRef}
              placeholder="Add comment or @mention"
              onSubmit={handleSubmit}
              autoFocus={showInput}
            />
            <button
              className="absolute bottom-2 right-2 flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
              onClick={handleSubmit}
            >
              <IconSend2 className="size-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleReplyClick}
            className="justify-self-start whitespace-nowrap text-sm font-semibold text-muted-foreground transition-colors duration-100 hover:text-muted-foreground/80"
          >
            Reply
          </button>
        )}
      </div>
    </div>
  );
}

/** Renders Tiptap JSON body as React nodes */
function RichTextBody({ body }: { body: Record<string, unknown> }) {
  const content = body?.content as TiptapNode[] | undefined;
  if (!content) return null;
  return <>{content.map((node, i) => <RenderNode key={i} node={node} />)}</>;
}

interface TiptapNode {
  type: string;
  content?: TiptapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  attrs?: Record<string, unknown>;
}

function RenderNode({ node }: { node: TiptapNode }) {
  if (node.type === "text") {
    let element: React.ReactNode = node.text ?? "";
    for (const mark of node.marks ?? []) {
      switch (mark.type) {
        case "bold": element = <strong className="font-semibold">{element}</strong>; break;
        case "italic": element = <em>{element}</em>; break;
        case "strike": element = <s>{element}</s>; break;
        case "code": element = <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">{element}</code>; break;
        case "link": element = <a href={mark.attrs?.href as string} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{element}</a>; break;
      }
    }
    return <>{element}</>;
  }
  if (node.type === "mention") {
    return <span className="mention">@{(node.attrs?.label as string) ?? (node.attrs?.id as string) ?? "user"}</span>;
  }
  if (node.type === "paragraph") {
    return <p>{node.content?.map((child, i) => <RenderNode key={i} node={child} />)}</p>;
  }
  if (node.content) {
    return <>{node.content.map((child, i) => <RenderNode key={i} node={child} />)}</>;
  }
  return null;
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
