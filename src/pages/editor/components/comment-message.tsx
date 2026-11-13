/**
 * Single comment message with hover actions and reactions.
 *
 * Structure matches reference Tue/Cue/wue components:
 * - Cue: hover container (mouseEnter/Leave toggles actions toolbar visibility)
 * - uue: actions toolbar (absolute above message, reactions + reply + edit)
 * - wue: comment card body (content ref preview + body + resolve row)
 * - Reactions + reply count below, indented with pl-8
 */

import { useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageActions } from "./message-actions";
import { ReactionBar } from "./reaction-bar";
import { useToggleReaction } from "@/lib/collaboration/use-comments";
import { useAuth } from "@/lib/auth/auth-provider";
import type { Comment } from "@/lib/collaboration/types";
import type { ContentRef } from "@/lib/collaboration/types";

interface CommentMessageProps {
  comment: Comment;
  documentId: string;
  contentRef?: ContentRef;
  onReply?: () => void;
  isRoot?: boolean;
}

export function CommentMessage({
  comment,
  documentId,
  contentRef,
  onReply,
  isRoot = false,
}: CommentMessageProps) {
  const [hovered, setHovered] = useState(false);
  const { user } = useAuth();
  const toggleReaction = useToggleReaction();

  const name = comment.profiles?.full_name ?? "User";
  const isOwn = user?.id === comment.user_id;

  const handleReaction = useCallback(
    (emoji: string) => {
      toggleReaction.mutate({
        commentId: comment.id,
        documentId,
        emoji,
      });
    },
    [comment.id, documentId, toggleReaction],
  );

  return (
    <div className="relative">
      {/* Cue — hover container */}
      <div
        className="relative rounded"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Actions toolbar — only on replies, not root (root has resolve in header) */}
        {!isRoot && (
          <MessageActions
            visible={hovered}
            onReaction={handleReaction}
            onReply={onReply}
            onEdit={isOwn ? undefined : undefined}
          />
        )}

        {/* Header: avatar + name + timestamp */}
        <div className="flex items-center gap-1.5">
          <Avatar className="size-5">
            {comment.profiles?.avatar_url && (
              <AvatarImage src={comment.profiles.avatar_url} alt={name} />
            )}
            <AvatarFallback className="text-[10px] font-medium">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold">{name}</span>
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(comment.created_at)}
          </span>
        </div>

        {/* Comment body — rendered as rich text */}
        <div className="mt-1 text-sm">
          <RichTextBody body={comment.body} />
          {comment.edited_at && (
            <span className="text-xs text-muted-foreground"> (edited)</span>
          )}
        </div>
      </div>

      <div>
        <ReactionBar
          reactions={comment.comment_reactions}
          currentUserId={user?.id ?? ""}
          onToggle={handleReaction}
        />
      </div>
    </div>
  );
}

/**
 * Renders Tiptap JSON body as HTML-like output.
 * Handles: paragraphs, bold, italic, strike, code, mentions, links.
 */
function RichTextBody({ body }: { body: Record<string, unknown> }) {
  const content = body?.content as TiptapNode[] | undefined;
  if (!content) return null;

  return (
    <>
      {content.map((node, i) => (
        <RenderNode key={i} node={node} />
      ))}
    </>
  );
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

    // Apply marks
    for (const mark of node.marks ?? []) {
      switch (mark.type) {
        case "bold":
          element = <strong className="font-semibold">{element}</strong>;
          break;
        case "italic":
          element = <em>{element}</em>;
          break;
        case "strike":
          element = <s>{element}</s>;
          break;
        case "code":
          element = (
            <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
              {element}
            </code>
          );
          break;
        case "link":
          element = (
            <a
              href={mark.attrs?.href as string}
              className="text-blue-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {element}
            </a>
          );
          break;
      }
    }

    return <>{element}</>;
  }

  if (node.type === "mention") {
    return (
      <span className="mention">
        @{(node.attrs?.label as string) ?? (node.attrs?.id as string) ?? "user"}
      </span>
    );
  }

  if (node.type === "paragraph") {
    return (
      <p>
        {node.content?.map((child, i) => (
          <RenderNode key={i} node={child} />
        ))}
      </p>
    );
  }

  // Fallback: render children
  if (node.content) {
    return (
      <>
        {node.content.map((child, i) => (
          <RenderNode key={i} node={child} />
        ))}
      </>
    );
  }

  return null;
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name[0] ?? "?").toUpperCase();
}
