import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Collaboration from "@tiptap/extension-collaboration";
import { Extension } from "@tiptap/core";
import { yCursorPlugin } from "@tiptap/y-tiptap";
import { CoverImagePicker } from "./cover-image-picker";
import { EmojiPicker } from "./emoji-picker";
import { FloatingToolbar } from "./floating-toolbar";
import { CommentHighlights } from "./comment-highlights";
import { CommentThreadPopover } from "./comment-thread";
import { BlockCommentButton } from "./block-comment-button";
import { useCommentingOptional } from "./commenting-provider";
import type { DocumentFields } from "@/data/seed";
import type { SupabaseYjsProvider } from "@/lib/collaboration/y-supabase-provider";

interface PaperSurfaceProps {
  title: string;
  content: Record<string, unknown>;
  coverImageUrl: string | null;
  iconEmoji: string | null;
  onUpdate: (fields: DocumentFields) => void;
  onWordCountChange: (count: number) => void;
  onSaveStatusChange: (status: "idle" | "saving" | "saved") => void;
  /** When provided, enables real-time collaboration via Yjs */
  yjsProvider?: SupabaseYjsProvider;
  /** Current user info for collaboration cursors */
  currentUser?: { name: string; color: string };
}

export function PaperSurface({
  title: initialTitle,
  content,
  coverImageUrl,
  iconEmoji,
  onUpdate,
  onWordCountChange,
  onSaveStatusChange,
  yjsProvider,
  currentUser,
}: PaperSurfaceProps) {
  const hasCommenting = useCommentingOptional() !== null;
  const [isHovered, setIsHovered] = useState(false);
  const [localCover, setLocalCover] = useState(coverImageUrl);
  const [localEmoji, setLocalEmoji] = useState(iconEmoji);
  const titleRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const pendingRef = useRef<DocumentFields>({});
  const initialContentRef = useRef(content);
  const initialTitleRef = useRef(initialTitle);

  const isCollaborative = yjsProvider !== undefined;

  const debouncedSave = useCallback(
    (fields: DocumentFields) => {
      pendingRef.current = { ...pendingRef.current, ...fields };
      onSaveStatusChange("saving");
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const merged = pendingRef.current;
        pendingRef.current = {};
        onUpdate(merged);
        onSaveStatusChange("saved");
      }, 2000);
    },
    [onUpdate, onSaveStatusChange],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Safely set initial title text (never as HTML) to avoid stored XSS.
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.textContent = initialTitleRef.current ?? "";
    }
  }, []);

  const userName = currentUser?.name ?? "Anonymous";
  const userColor = currentUser?.color ?? "#6b7280";

  // Push cursor user info onto awareness whenever it changes — without rebuilding extensions
  useEffect(() => {
    if (!yjsProvider) return;
    yjsProvider.awareness.setLocalStateField("user", { name: userName, color: userColor });
  }, [yjsProvider, userName, userColor]);

  // Build extensions list — with or without collaboration.
  // IMPORTANT: deps must be stable primitives. Any new object identity here will
  // rebuild the editor on every parent render and reset focus after one keystroke.
  const extensions = useMemo(() => {
    if (isCollaborative && yjsProvider) {
      return [
        StarterKit.configure({ undoRedo: false }),
        Placeholder.configure({ placeholder: "Start writing…" }),
        CharacterCount,
        Collaboration.configure({
          document: yjsProvider.doc,
        }),
        Extension.create({
          name: "collaborationCursor",
          addProseMirrorPlugins() {
            return [
              yCursorPlugin(yjsProvider.awareness, {
                cursorBuilder: (cursorUser: Record<string, string>) => {
                  const cursor = document.createElement("span");
                  cursor.classList.add("collaboration-cursor__caret");
                  cursor.setAttribute("style", `--cursor-color: ${cursorUser.color}`);

                  const label = document.createElement("div");
                  label.classList.add("collaboration-cursor__label");
                  label.textContent = cursorUser.name ?? "";
                  cursor.appendChild(label);

                  return cursor;
                },
              }),
            ];
          },
        }),
      ];
    }

    // Non-collaborative mode (demo): standard editor
    return [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing…" }),
      CharacterCount,
    ];
  }, [isCollaborative, yjsProvider]);


  const editor = useEditor({
    extensions,
    // Only set initial content in non-collaborative mode
    // In collaborative mode, Yjs provides the content
    content: !isCollaborative
      ? initialContentRef.current && Object.keys(initialContentRef.current).length > 0
        ? initialContentRef.current
        : undefined
      : undefined,
    onUpdate: ({ editor: e }) => {
      const text = e.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      onWordCountChange(words);

      // In non-collaborative mode, save content via debounce
      // In collaborative mode, Yjs provider handles persistence
      if (!isCollaborative) {
        debouncedSave({
          content: e.getJSON() as Record<string, unknown>,
          contentText: text,
          wordCount: words,
        });
      }
    },
    editorProps: {
      attributes: {
        class: "doc-prose max-w-none focus:outline-none min-h-[200px]",
      },
    },
  }, [extensions]);

  useEffect(() => {
    if (editor) {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      onWordCountChange(words);
      if (import.meta.env.DEV && typeof window !== "undefined") {
        (window as unknown as { __tiptapEditor?: unknown }).__tiptapEditor = editor;
      }
    }
  }, [editor, onWordCountChange]);

  const handleTitleInput = () => {
    const text = titleRef.current?.textContent ?? "";
    debouncedSave({ title: text });
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      editor?.commands.focus("start");
    }
  };

  const handleCoverSelect = (url: string) => {
    setLocalCover(url);
    debouncedSave({ coverImageUrl: url });
  };

  const handleEmojiSelect = (emoji: string) => {
    setLocalEmoji(emoji);
    debouncedSave({ iconEmoji: emoji });
  };

  return (
    <div
      className="mx-auto w-full max-w-[820px] @[1200px]:max-w-[1000px] @[1600px]:max-w-[1200px] rounded-2xl"
      style={{
        backgroundColor: "#fafafa",
        minHeight: "calc(1200px * 1.414)",
        border: "1px solid #fff",
        boxShadow: "rgba(0, 0, 0, 0.02) 0px 0px 4px 0px, rgba(0, 0, 0, 0.04) 0px 8px 24px 0px, rgba(0, 0, 0, 0.08) 0 0 0 0.5px",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {localCover && (
        <CoverImagePicker
          coverUrl={localCover}
          onSelect={handleCoverSelect}
          isHovered={isHovered}
        />
      )}

      <div className="space-y-2 p-8 pt-7 @[600px]:p-[60px] @[600px]:pt-14">
        <div ref={contentWrapperRef} className="relative mx-auto max-w-[1000px]">
          {!localCover && (
            <CoverImagePicker
              coverUrl={null}
              onSelect={handleCoverSelect}
              isHovered={isHovered}
            />
          )}
          <EmojiPicker
            emoji={localEmoji}
            onSelect={handleEmojiSelect}
            isHovered={isHovered}
          />

          <div
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleTitleInput}
            onKeyDown={handleTitleKeyDown}
            data-placeholder="Untitled"
            className="text-[34px] leading-[1.15] font-semibold text-foreground focus:outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
          />

          {editor && <FloatingToolbar editor={editor} />}
          <EditorContent editor={editor} />
          {editor && hasCommenting && <CommentHighlights editor={editor} containerRef={contentWrapperRef} />}
          {editor && hasCommenting && <CommentThreadPopover editor={editor} containerRef={contentWrapperRef} />}
          {editor && hasCommenting && <BlockCommentButton editor={editor} containerRef={contentWrapperRef} />}
        </div>
      </div>
    </div>
  );
}
