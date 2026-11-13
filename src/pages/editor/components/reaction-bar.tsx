/**
 * Emoji reaction pills below a comment.
 * Click own reaction to toggle off, click others' to add.
 *
 * Reference: editor-context-provider lines 64594-64627 (fue, pue, mue, hue)
 */

import { cn } from "@/lib/utils";
import type { CommentReaction } from "@/lib/collaboration/types";

interface ReactionBarProps {
  reactions: CommentReaction[];
  currentUserId: string;
  onToggle: (emoji: string) => void;
}

export function ReactionBar({
  reactions,
  currentUserId,
  onToggle,
}: ReactionBarProps) {
  if (reactions.length === 0) return null;

  // Group by emoji
  const grouped = reactions.reduce<Record<string, CommentReaction[]>>(
    (acc, r) => {
      (acc[r.emoji] ??= []).push(r);
      return acc;
    },
    {},
  );

  return (
    // Container: flex wrap, gap 4px, margin-top 4px
    <div className="mt-1 flex flex-wrap gap-1">
      {Object.entries(grouped).map(([emoji, items]) => {
        const hasOwn = items.some((r) => r.user_id === currentUserId);
        return (
          <button
            key={emoji}
            onClick={() => onToggle(emoji)}
            // Pill: border-radius 6px, padding 2px 5px
            className={cn(
              "flex items-center rounded-md border py-0.5 pl-[5px] pr-[5px] text-sm transition-colors hover:border-border",
              hasOwn
                ? "border-border bg-muted"
                : "border-border/20 bg-transparent",
            )}
          >
            <span>{emoji}</span>
            {items.length > 1 && (
              // Count: font-size 10px, margin-left 6px, foreground/secondary
              <span className="ml-1.5 text-[10px] text-muted-foreground">
                {items.length}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
