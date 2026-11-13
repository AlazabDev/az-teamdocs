/**
 * React Query hooks for comment CRUD.

 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { nanoid } from "nanoid";
import { useMemo } from "react";
import type { CommentThread, ContentRef } from "./types";

// ── Query: Fetch all threads for a document ─────────────────────

export function useDocumentThreads(documentId: string | undefined) {
  return useQuery({
    queryKey: ["comment-threads", documentId],
    enabled: !!documentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comment_threads")
        .select(`
          *,
          comments (
            *,
            comment_reactions (*)
          )
        `)
        .eq("document_id", documentId!)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Collect unique user IDs to fetch profiles
      const userIds = new Set<string>();
      for (const thread of data ?? []) {
        for (const comment of thread.comments ?? []) {
          if ((comment as Record<string, unknown>).user_id) {
            userIds.add((comment as Record<string, unknown>).user_id as string);
          }
        }
      }

      // Fetch profiles for all comment authors
      const profileMap = new Map<string, { full_name: string; avatar_url: string | null }>();
      if (userIds.size > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", Array.from(userIds));
        for (const p of profiles ?? []) {
          profileMap.set(p.id, { full_name: p.full_name, avatar_url: p.avatar_url });
        }
      }

      return (data ?? []).map((thread) => ({
        ...thread,
        content_ref: thread.content_ref as unknown as ContentRef,
        comments: (thread.comments ?? []).map((c: Record<string, unknown>) => ({
          ...c,
          comment_reactions: c.comment_reactions ?? [],
          profiles: profileMap.get(c.user_id as string) ?? null,
        })),
      })) as CommentThread[];
    },
  });
}

// ── Derived: unresolved range threads (for highlights) ──────────


export function useUnresolvedRangeThreads(documentId: string | undefined) {
  const { data: threads } = useDocumentThreads(documentId);
  return useMemo(() => {
    if (!threads) return [];
    return threads.filter(
      (t) =>
        t.content_ref.type === "range" &&
        t.resolved_at === null &&
        !t.detached,
    );
  }, [threads]);
}

// ── Mutation: Create a new comment (new thread or reply) ────────


export function useSubmitComment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      documentId: string;
      threadId?: string;
      contentRef?: ContentRef;
      body: Record<string, unknown>;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let threadId = input.threadId;

      // Create thread if new
      if (!threadId) {
        if (!input.contentRef)
          throw new Error("contentRef required for new thread");
        const id = nanoid();
        const { error } = await supabase.from("comment_threads").insert({
          id,
          document_id: input.documentId,
          content_ref: input.contentRef as unknown as Record<string, unknown>,
          created_by: user.id,
        });
        if (error) throw error;
        threadId = id;
      }

      // Insert the comment
      const { error } = await supabase.from("comments").insert({
        id: nanoid(),
        thread_id: threadId,
        user_id: user.id,
        body: input.body,
      });
      if (error) throw error;

      return { threadId };
    },
    onSuccess: (_, input) => {
      qc.invalidateQueries({
        queryKey: ["comment-threads", input.documentId],
      });
    },
  });
}

// ── Mutation: Resolve / unresolve a thread ──────────────────────


export function useResolveThread() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      threadId: string;
      documentId: string;
      isResolved: boolean;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("comment_threads")
        .update({
          resolved_at: input.isResolved ? new Date().toISOString() : null,
          resolved_by: input.isResolved ? user.id : null,
        })
        .eq("id", input.threadId);
      if (error) throw error;
    },
    onSuccess: (_, input) => {
      qc.invalidateQueries({
        queryKey: ["comment-threads", input.documentId],
      });
    },
  });
}

// ── Mutation: Toggle a reaction ─────────────────────────────────

// Same toggle logic: click to add, click again to remove

export function useToggleReaction() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      commentId: string;
      documentId: string;
      emoji: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if reaction exists
      const { data: existing } = await supabase
        .from("comment_reactions")
        .select("id")
        .eq("comment_id", input.commentId)
        .eq("user_id", user.id)
        .eq("emoji", input.emoji)
        .maybeSingle();

      if (existing) {
        // Toggle off
        await supabase.from("comment_reactions").delete().eq("id", existing.id);
      } else {
        // Toggle on
        await supabase.from("comment_reactions").insert({
          id: nanoid(),
          comment_id: input.commentId,
          user_id: user.id,
          emoji: input.emoji,
        });
      }
    },
    onSuccess: (_, input) => {
      qc.invalidateQueries({
        queryKey: ["comment-threads", input.documentId],
      });
    },
  });
}

// ── Mutation: Edit a comment ────────────────────────────────────


export function useEditComment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      commentId: string;
      documentId: string;
      body: Record<string, unknown>;
    }) => {
      const { error } = await supabase
        .from("comments")
        .update({
          body: input.body,
          edited_at: new Date().toISOString(),
        })
        .eq("id", input.commentId);
      if (error) throw error;
    },
    onSuccess: (_, input) => {
      qc.invalidateQueries({
        queryKey: ["comment-threads", input.documentId],
      });
    },
  });
}

// ── Mutation: Delete a comment ──────────────────────────────────

export function useDeleteComment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { commentId: string; documentId: string }) => {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", input.commentId);
      if (error) throw error;
    },
    onSuccess: (_, input) => {
      qc.invalidateQueries({
        queryKey: ["comment-threads", input.documentId],
      });
    },
  });
}
