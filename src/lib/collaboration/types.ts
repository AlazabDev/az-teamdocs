/**
 * Types for the commenting system.

 */

// ── Content References ──────────────────────────────────────────

export interface BlockRef {
  type: "block";
  blockId: string;
  blockPreview?: string;
}

export interface RangeRef {
  type: "range";
  from: number;
  to: number;
  rangePreview?: string;
  /** Serialized Yjs relative positions (added in Step 9) */
  yjsFrom?: string;
  yjsTo?: string;
}

export type ContentRef = BlockRef | RangeRef;

// ── Comments ────────────────────────────────────────────────────

export interface CommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface Comment {
  id: string;
  thread_id: string;
  user_id: string;
  body: Record<string, unknown>; // Tiptap JSON
  created_at: string;
  edited_at: string | null;
  comment_reactions: CommentReaction[];
  // Joined from profiles
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
}

// ── Threads ─────────────────────────────────────────────────────

export interface CommentThread {
  id: string;
  document_id: string;
  content_ref: ContentRef;
  resolved_at: string | null;
  resolved_by: string | null;
  created_by: string;
  created_at: string;
  detached: boolean;
  comments: Comment[];
}

// ── Document Permissions ───────────────────────────────────────

export type PermissionRole = "editor" | "commenter" | "viewer";

export interface DocumentPermission {
  id: string;
  document_id: string;
  user_id: string | null;
  email: string | null;
  role: PermissionRole;
  status: "pending" | "active";
  granted_by: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
}
