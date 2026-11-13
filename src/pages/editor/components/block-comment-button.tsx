/**
 * Block comment button — appears in the margin of image, code, and blockquote
 * blocks on hover. Shows a comment count badge when threads exist.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { IconMessagePlus } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useCommenting } from "./commenting-provider";
import type { Editor } from "@tiptap/react";
import type { CommentThread } from "@/lib/collaboration/types";

/** Block node types that get the margin comment button */
const BLOCK_COMMENT_TYPES = new Set(["image", "codeBlock", "blockquote"]);

/** Map ProseMirror node type → DOM selector */
const NODE_SELECTORS: Record<string, string> = {
  image: "img",
  codeBlock: "pre",
  blockquote: "blockquote",
};

interface BlockCommentButtonProps {
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

interface HoveredBlock {
  el: HTMLElement;
  nodeType: string;
  blockId: string;
  top: number;
}

export function BlockCommentButton({
  editor,
  containerRef,
}: BlockCommentButtonProps) {
  const { threads, initiateCommenting, setActiveThreadId } = useCommenting();
  const [hoveredBlock, setHoveredBlock] = useState<HoveredBlock | null>(null);
  const rafRef = useRef<number>(0);

  // Build a map of blockId → threads for badge counts
  const blockThreads = useRef(new Map<string, CommentThread[]>());
  useEffect(() => {
    const map = new Map<string, CommentThread[]>();
    for (const thread of threads) {
      if (
        thread.content_ref.type === "block" &&
        !thread.resolved_at &&
        !thread.detached
      ) {
        const existing = map.get(thread.content_ref.blockId) ?? [];
        existing.push(thread);
        map.set(thread.content_ref.blockId, existing);
      }
    }
    blockThreads.current = map;
  }, [threads]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const target = e.target as HTMLElement;

        // Walk up from target to find a matching block element
        let blockEl: HTMLElement | null = null;
        let matchedType = "";

        for (const [nodeType, selector] of Object.entries(NODE_SELECTORS)) {
          const match = target.closest(selector);
          if (match && container.contains(match)) {
            blockEl = match as HTMLElement;
            matchedType = nodeType;
            break;
          }
        }

        if (!blockEl) {
          setHoveredBlock(null);
          return;
        }

        // Generate a stable block ID from the DOM position
        const blockId = getBlockId(blockEl, container);
        const containerRect = container.getBoundingClientRect();
        const blockRect = blockEl.getBoundingClientRect();

        setHoveredBlock({
          el: blockEl,
          nodeType: matchedType,
          blockId,
          top: blockRect.bottom - containerRect.top + 4,
        });
      });
    },
    [containerRef],
  );

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setHoveredBlock(null);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, handleMouseMove, handleMouseLeave]);

  const handleClick = useCallback(() => {
    if (!hoveredBlock) return;

    const existingThreads = blockThreads.current.get(hoveredBlock.blockId);

    if (existingThreads && existingThreads.length > 0) {
      // Open existing thread in browsing mode
      setActiveThreadId(existingThreads[0].id);
    } else {
      // Create new thread for this block
      const blockPreview = getBlockPreview(hoveredBlock.el, hoveredBlock.nodeType);
      initiateCommenting({
        contentRef: {
          type: "block",
          blockId: hoveredBlock.blockId,
          blockPreview,
        },
      });
    }
  }, [hoveredBlock, initiateCommenting, setActiveThreadId]);

  if (!hoveredBlock) return null;

  const existingThreads = blockThreads.current.get(hoveredBlock.blockId);
  const commentCount = existingThreads
    ? existingThreads.reduce((sum, t) => sum + t.comments.length, 0)
    : 0;

  return (
    <button
      onClick={handleClick}
      className={cn(
        "absolute z-10 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-opacity duration-150",
        commentCount > 0
          ? "bg-amber-100 text-amber-900"
          : "bg-muted text-muted-foreground",
      )}
      style={{
        top: hoveredBlock.top,
        right: 0,
        opacity: commentCount > 0 ? 1 : undefined,
      }}
    >
      <IconMessagePlus className="size-3.5" />
      {commentCount > 0 && <span>{commentCount}</span>}
    </button>
  );
}

/** Generate a stable ID for a block element based on its position in the editor */
function getBlockId(el: HTMLElement, container: HTMLElement): string {
  const allBlocks = container.querySelectorAll("img, pre, blockquote");
  const index = Array.from(allBlocks).indexOf(el);
  const tag = el.tagName.toLowerCase();
  return `${tag}-${index}`;
}

/** Extract a short preview string for a block */
function getBlockPreview(el: HTMLElement, nodeType: string): string {
  switch (nodeType) {
    case "image":
      return (el as HTMLImageElement).alt || "Image";
    case "codeBlock":
      return (el.textContent ?? "").slice(0, 40) || "Code block";
    case "blockquote":
      return (el.textContent ?? "").slice(0, 40) || "Blockquote";
    default:
      return "Block";
  }
}
