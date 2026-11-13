/**
 * Mini Tiptap editor for writing comments.
 * Enter to submit, Shift+Enter for newline.
 * Supports @mentions via Tiptap Mention extension.
 */

import { forwardRef, useImperativeHandle, useEffect, useMemo, useState, useRef } from "react";
import { useEditor, EditorContent, ReactRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import { supabase } from "@/integrations/supabase/client";
import {
  MentionSuggestionList,
  type MentionUser,
  type MentionSuggestionListHandle,
} from "./mention-suggestion-list";

interface CommentInputProps {
  placeholder?: string;
  onSubmit: () => void;
  autoFocus?: boolean;
  workspaceId?: string;
}

export interface CommentInputHandle {
  focus: () => void;
  getJSON: () => Record<string, unknown>;
  clear: () => void;
}

export const CommentInput = forwardRef<CommentInputHandle, CommentInputProps>(
  ({ placeholder = "Add comment or @mention", onSubmit, autoFocus, workspaceId }, ref) => {

    // Pre-load profiles once. Use a ref so the items() closure always sees latest data
    // without needing to re-create the Tiptap editor.
    const profilesRef = useRef<MentionUser[]>([]);
    // Track whether suggestion popup is open so Enter doesn't submit while selecting
    const suggestionOpenRef = useRef(false);

    useEffect(() => {
      const load = async () => {
        if (workspaceId) {
          const { data } = await supabase
            .from("workspace_members")
            .select("user_id, role, profiles:user_id(id, full_name, avatar_url)")
            .eq("workspace_id", workspaceId);
          profilesRef.current = (data ?? []).map((m) => {
            const profile = m.profiles as unknown as { id: string; full_name: string; avatar_url: string | null };
            return {
              id: profile.id,
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
              role: m.role,
            };
          });
        } else {
          const { data } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .limit(50);
          profilesRef.current = (data ?? []).map((p) => ({
            id: p.id,
            full_name: p.full_name,
            avatar_url: p.avatar_url,
          }));
        }
      };
      load();
    }, [workspaceId]);

    const mentionSuggestion = useMemo(
      () => ({
        // Synchronous filter reading from ref (always latest data, no editor re-creation needed)
        items: ({ query }: { query: string }): MentionUser[] => {
          const profiles = profilesRef.current;
          if (!query) return profiles.slice(0, 8);
          return profiles
            .filter((p) =>
              p.full_name.toLowerCase().includes(query.toLowerCase()),
            )
            .slice(0, 8);
        },

        render: () => {
          let component: ReactRenderer<MentionSuggestionListHandle>;
          let popup: TippyInstance[];

          return {
            onStart: (props: Record<string, unknown>) => {
              suggestionOpenRef.current = true;
              component = new ReactRenderer(MentionSuggestionList, {
                props,
                editor: props.editor as InstanceType<typeof import("@tiptap/react").Editor>,
              });

              if (!props.clientRect) return;

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              });
            },
            onUpdate: (props: Record<string, unknown>) => {
              component?.updateProps(props);
              if (props.clientRect) {
                popup?.[0]?.setProps({
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                });
              }
            },
            onKeyDown: (props: { event: KeyboardEvent }) => {
              if (props.event.key === "Escape") {
                popup?.[0]?.hide();
                return true;
              }
              return component?.ref?.onKeyDown(props) ?? false;
            },
            onExit: () => {
              suggestionOpenRef.current = false;
              popup?.[0]?.destroy();
              component?.destroy();
            },
          };
        },
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: false,
          codeBlock: false,
          blockquote: false,
          horizontalRule: false,
          bulletList: false,
          orderedList: false,
        }),
        Placeholder.configure({ placeholder }),
        Mention.configure({
          HTMLAttributes: { class: "mention" },
          suggestion: mentionSuggestion as never,
        }),
      ],
      editorProps: {
        attributes: {
          class:
            "prose prose-sm max-w-none focus:outline-none text-sm min-h-[2rem] max-h-[10rem] overflow-y-auto px-3 py-2",
        },
        handleKeyDown: (_view, event) => {
          // Don't intercept Enter while mention suggestion is open
          if (suggestionOpenRef.current) return false;
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            // Let the parent handleSubmit check for content (text + mentions)
            onSubmit();
            return true;
          }
          return false;
        },
      },
    });

    useEffect(() => {
      if (autoFocus && editor) {
        requestAnimationFrame(() => {
          if (!editor.isDestroyed) editor.commands.focus();
        });
      }
    }, [editor, autoFocus]);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => editor?.commands.focus(),
        getJSON: () => editor?.getJSON() ?? {},
        clear: () => editor?.commands.clearContent(),
      }),
      [editor],
    );

    return (
      <div className="rounded border bg-background transition-all duration-150 focus-within:border-foreground/30 hover:border-border/80">
        <EditorContent editor={editor} />
      </div>
    );
  },
);

CommentInput.displayName = "CommentInput";
