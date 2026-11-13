/**
 * CommentHighlights — renders colored rect overlays on the editor for commented text ranges.

 *
 * - Absolute-positioned divs over the editor content
 * - One set of rects per unresolved thread
 * - Passive opacity 0.25, active 0.45 (when thread popover is open)
 * - mix-blend-mode: multiply for natural blending
 * - Recomputes on ResizeObserver + editor transactions
 */

import { useState, useEffect, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import { useCommentingOptional } from "./commenting-provider";
import { resolveRelativePositions } from "@/lib/collaboration/comment-positions";

interface HighlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Indicator {
  threadId: string;
  opacity: number;
  rectangles: HighlightRect[];
}

/** Compute DOM rectangles for a ProseMirror range relative to a container */
function computeRectsFromRange(
  editor: Editor,
  from: number,
  to: number,
  containerRect: DOMRect,
): HighlightRect[] {
  try {
    const view = editor.view;
    const startDOM = view.domAtPos(from);
    const endDOM = view.domAtPos(to);
    const domRange = document.createRange();
    domRange.setStart(startDOM.node, startDOM.offset);
    domRange.setEnd(endDOM.node, endDOM.offset);

    const clientRects = domRange.getClientRects();
    const rects: HighlightRect[] = [];

    for (let i = 0; i < clientRects.length; i++) {
      const r = clientRects[i];
      if (r.width === 0) continue;
      rects.push({
        x: r.left - containerRect.left,
        y: r.top - containerRect.top,
        width: r.width,
        height: r.height,
      });
    }

    return rects;
  } catch {
    return [];
  }
}

interface CommentHighlightsProps {
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function CommentHighlights({
  editor,
  containerRef,
}: CommentHighlightsProps) {
  const commenting = useCommentingOptional();
  const unresolvedRangeThreads = commenting?.unresolvedRangeThreads ?? [];
  const activeThreadId = commenting?.activeThreadId ?? null;
  const setActiveThreadId = commenting?.setActiveThreadId ?? (() => {});
  const draft = commenting?.draft ?? null;
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [draftIndicator, setDraftIndicator] = useState<Indicator | null>(null);

  const recompute = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    // Thread highlights
    const newIndicators: Indicator[] = [];
    for (const thread of unresolvedRangeThreads) {
      if (thread.content_ref.type !== "range") continue;

      // Prefer Yjs relative positions (survive edits), fall back to absolute
      let from: number | undefined;
      let to: number | undefined;

      if (thread.content_ref.yjsFrom && thread.content_ref.yjsTo) {
        const resolved = resolveRelativePositions(
          editor,
          thread.content_ref.yjsFrom,
          thread.content_ref.yjsTo,
        );
        if (resolved) {
          from = resolved.from;
          to = resolved.to;
        }
        // null = content deleted, thread detached — skip
      } else {
        from = thread.content_ref.from;
        to = thread.content_ref.to;
      }

      if (from == null || to == null) continue;

      const rects = computeRectsFromRange(editor, from, to, containerRect);
      if (rects.length === 0) continue;

      newIndicators.push({
        threadId: thread.id,

        opacity: activeThreadId === thread.id ? 0.45 : 0.25,
        rectangles: rects,
      });
    }
    setIndicators(newIndicators);

    // Draft highlight
    if (draft?.contentRef.type === "range") {
      const { from, to } = draft.contentRef;
      const rects = computeRectsFromRange(editor, from, to, containerRect);
      setDraftIndicator(
        rects.length > 0
          ? { threadId: "draft", opacity: 0.45, rectangles: rects }
          : null,
      );
    } else {
      setDraftIndicator(null);
    }
  }, [editor, unresolvedRangeThreads, activeThreadId, containerRef, draft]);


  useEffect(() => {
    recompute();

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => recompute());
    observer.observe(container);

    editor.on("transaction", recompute);

    return () => {
      observer.disconnect();
      editor.off("transaction", recompute);
    };
  }, [editor, recompute, containerRef]);

  const allIndicators = draftIndicator
    ? [...indicators, draftIndicator]
    : indicators;

  if (allIndicators.length === 0) return null;

  return (
    // Container: position absolute, inset 0, pointer-events none

    <div className="pointer-events-none absolute inset-0">
      {allIndicators.map((indicator) =>
        indicator.rectangles.map((rect, i) => (
          <div
            key={`${indicator.threadId}-${i}`}
            // Click on highlight opens the thread — pointer-events auto on the rect
            className="absolute cursor-pointer pointer-events-auto"
            style={{

              transform: `translate(${rect.x}px, ${rect.y - 1.5}px)`,
              width: rect.width,
              height: rect.height + 3,
              backgroundColor: `oklch(0.8 0.1 70 / ${indicator.opacity})`,
              mixBlendMode: "multiply",
              borderRadius: 2,

              transition: "background-color 90ms",
            }}
            onClick={
              indicator.threadId !== "draft"
                ? () => setActiveThreadId(indicator.threadId)
                : undefined
            }
          />
        )),
      )}
    </div>
  );
}
