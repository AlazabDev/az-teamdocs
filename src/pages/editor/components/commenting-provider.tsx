/**
 * CommentingProvider — orchestrates inline commenting.

 *
 * State machine:
 *   idle        → user clicks comment button → draft (creating)
 *   draft       → user submits → idle (thread created)
 *   draft       → user cancels / clicks outside → idle
 *   idle        → user clicks highlight → active (browsing)
 *   active      → user clicks outside → idle
 */

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Editor } from "@tiptap/react";
import type { CommentThread, ContentRef } from "@/lib/collaboration/types";
import { supabase } from "@/integrations/supabase/client";
import {
  useDocumentThreads,
  useUnresolvedRangeThreads,
  useSubmitComment,
} from "@/lib/collaboration/use-comments";



interface CommentingContextValue {
  /** Start creating a new comment */
  initiateCommenting: (opts: { contentRef: ContentRef }) => void;
  /** Submit the comment body */
  submitComment: (opts: {
    threadId?: string;
    body: Record<string, unknown>;
  }) => void;
  /** Cancel the draft */
  cancelDraft: () => void;
  /** Currently active thread (browsing) */
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
  /** Draft state (creating a new comment) */
  draft: { contentRef: ContentRef } | null;
  /** All threads for this document */
  threads: CommentThread[];
  /** Unresolved range threads (for highlights) */
  unresolvedRangeThreads: CommentThread[];
  /** Document ID */
  documentId: string;
}

const CommentingContext = createContext<CommentingContextValue | null>(null);

export function useCommenting() {
  const ctx = useContext(CommentingContext);
  if (!ctx)
    throw new Error("useCommenting must be used within CommentingProvider");
  return ctx;
}

export function useCommentingOptional() {
  return useContext(CommentingContext);
}

// ── Provider ────────────────────────────────────────────────────

interface CommentingProviderProps {
  editor: Editor | null;
  documentId: string;
  children: React.ReactNode;
}

export function CommentingProvider({
  editor,
  documentId,
  children,
}: CommentingProviderProps) {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ contentRef: ContentRef } | null>(null);

  const { data: threads = [] } = useDocumentThreads(documentId);
  const unresolvedRangeThreads = useUnresolvedRangeThreads(documentId);
  const submitMutation = useSubmitComment();
  const qc = useQueryClient();

  // Subscribe to Supabase Realtime for live comment updates from other clients
  useEffect(() => {
    const channel = supabase
      .channel(`comments:${documentId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comment_threads", filter: `document_id=eq.${documentId}` },
        () => qc.invalidateQueries({ queryKey: ["comment-threads", documentId] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => qc.invalidateQueries({ queryKey: ["comment-threads", documentId] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comment_reactions" },
        () => qc.invalidateQueries({ queryKey: ["comment-threads", documentId] }),
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [documentId, qc]);

  const initiateCommenting = useCallback(
    (opts: { contentRef: ContentRef }) => {
      setActiveThreadId(null);
      setDraft({ contentRef: opts.contentRef });
    },
    [],
  );


  const submitComment = useCallback(
    (opts: { threadId?: string; body: Record<string, unknown> }) => {
      submitMutation.mutate({
        documentId,
        threadId: opts.threadId,
        contentRef: draft?.contentRef,
        body: opts.body,
      });
      setDraft(null);
    },
    [documentId, draft, submitMutation],
  );

  const cancelDraft = useCallback(() => {
    setDraft(null);
  }, []);

  const value = useMemo<CommentingContextValue>(
    () => ({
      initiateCommenting,
      submitComment,
      cancelDraft,
      activeThreadId,
      setActiveThreadId,
      draft,
      threads,
      unresolvedRangeThreads,
      documentId,
    }),
    [
      initiateCommenting,
      submitComment,
      cancelDraft,
      activeThreadId,
      draft,
      threads,
      unresolvedRangeThreads,
      documentId,
    ],
  );

  return (
    <CommentingContext.Provider value={value}>
      {children}
    </CommentingContext.Provider>
  );
}
