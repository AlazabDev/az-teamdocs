import { useEffect, useRef, useState, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import { AnimatePresence, motion } from "motion/react";
import { Toggle } from "@/components/ui/toggle";
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconH1,
  IconH2,
  IconCode,
  IconBlockquote,
  IconMessagePlus,
} from "@tabler/icons-react";
import { useCommentingOptional } from "./commenting-provider";
import { createRelativePositions } from "@/lib/collaboration/comment-positions";

interface FloatingToolbarProps {
  editor: Editor;
}

export function FloatingToolbar({ editor }: FloatingToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const commenting = useCommentingOptional();

  const handleComment = useCallback(() => {
    if (!commenting) return;
    const { from, to } = editor.state.selection;
    if (from === to) return;

    const rangePreview = editor.state.doc.textBetween(from, to, " ").slice(0, 100);

    // Create Yjs relative positions if collaborative
    const relPositions = createRelativePositions(editor, from, to);

    commenting.initiateCommenting({
      contentRef: {
        type: "range",
        from,
        to,
        rangePreview,
        ...(relPositions ?? {}),
      },
    });
  }, [commenting, editor]);

  useEffect(() => {
    const updatePosition = () => {
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      if (!hasSelection) {
        setVisible(false);
        return;
      }

      setVisible(true);

      const { view } = editor;
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);

      const wrapper = view.dom.parentElement?.closest("[class*='relative']");
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const centerX = (start.left + end.left) / 2 - rect.left;
      const topY = start.top - rect.top - 48;

      setPosition({ top: topY, left: centerX });
    };

    editor.on("selectionUpdate", updatePosition);
    editor.on("transaction", updatePosition);

    return () => {
      editor.off("selectionUpdate", updatePosition);
      editor.off("transaction", updatePosition);
    };
  }, [editor]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={toolbarRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="pointer-events-auto absolute z-50"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="flex items-center gap-2 whitespace-nowrap">
            {/* Formatting pill */}
            <div className="flex items-center rounded-lg border border-border/50 bg-background p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <Toggle
                size="sm"
                className="h-7 min-w-7 px-1 mx-0.5"
                pressed={editor.isActive("bold")}
                onPressedChange={() =>
                  editor.chain().focus().toggleBold().run()
                }
              >
                <IconBold className="size-4" />
              </Toggle>
              <Toggle
                size="sm"
                className="h-7 min-w-7 px-1 mx-0.5"
                pressed={editor.isActive("italic")}
                onPressedChange={() =>
                  editor.chain().focus().toggleItalic().run()
                }
              >
                <IconItalic className="size-4" />
              </Toggle>
              <Toggle
                size="sm"
                className="h-7 min-w-7 px-1 mx-0.5"
                pressed={editor.isActive("strike")}
                onPressedChange={() =>
                  editor.chain().focus().toggleStrike().run()
                }
              >
                <IconStrikethrough className="size-4" />
              </Toggle>
              <Toggle
                size="sm"
                className="h-7 min-w-7 px-1 mx-0.5"
                pressed={editor.isActive("heading", { level: 1 })}
                onPressedChange={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
              >
                <IconH1 className="size-4" />
              </Toggle>
              <Toggle
                size="sm"
                className="h-7 min-w-7 px-1 mx-0.5"
                pressed={editor.isActive("heading", { level: 2 })}
                onPressedChange={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
              >
                <IconH2 className="size-4" />
              </Toggle>
              <Toggle
                size="sm"
                className="h-7 min-w-7 px-1 mx-0.5"
                pressed={editor.isActive("codeBlock")}
                onPressedChange={() =>
                  editor.chain().focus().toggleCodeBlock().run()
                }
              >
                <IconCode className="size-4" />
              </Toggle>
              <Toggle
                size="sm"
                className="h-7 min-w-7 px-1 mx-0.5"
                pressed={editor.isActive("blockquote")}
                onPressedChange={() =>
                  editor.chain().focus().toggleBlockquote().run()
                }
              >
                <IconBlockquote className="size-4" />
              </Toggle>
            </div>

            {/* Comment pill — only show when commenting is available */}
            {commenting && (
              <div className="flex items-center rounded-lg border border-border/50 bg-background p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                <Toggle
                  size="sm"
                  className="h-7 min-w-7 px-1 mx-0.5"
                  pressed={false}
                  onPressedChange={handleComment}
                >
                  <IconMessagePlus className="size-4" />
                </Toggle>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
