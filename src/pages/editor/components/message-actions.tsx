/**
 * Hover toolbar above messages — quick reactions + reply + edit buttons.
 *
 * Reference: editor-context-provider lines 64461-64564 (lue, r9, uue)
 */

import {
  IconMessage,
  IconEdit,
} from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const QUICK_REACTIONS = ["👍", "🎉", "✅"] as const;

interface MessageActionsProps {
  visible: boolean;
  onReply?: () => void;
  onReaction?: (emoji: string) => void;
  onEdit?: () => void;
}

export function MessageActions({
  visible,
  onReply,
  onReaction,
  onEdit,
}: MessageActionsProps) {
  if (!onReply && !onReaction && !onEdit) return null;

  return (
    <div
      className={cn(
        // Container: absolute, top -30px, left 8px, z-1
        "pointer-events-none absolute -top-[30px] left-2 z-[1] flex items-center gap-0.5 rounded border border-border bg-background p-1 opacity-0 transition-opacity",
        visible && "pointer-events-auto opacity-100",
      )}
      role="toolbar"
    >
      {onReaction && (
        <>
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReaction(emoji)}
              // Button: 30px × 30px, border-radius 4px
              className="flex size-[30px] items-center justify-center rounded hover:bg-muted"
            >
              <span className="text-sm">{emoji}</span>
            </button>
          ))}
          {(onReply || onEdit) && (
            <Separator orientation="vertical" className="mx-0.5 h-4" />
          )}
        </>
      )}

      {onReply && (
        <button
          onClick={onReply}
          className="flex size-[30px] items-center justify-center rounded hover:bg-muted"
          title="Reply"
        >
          <IconMessage className="size-4" />
        </button>
      )}

      {onEdit && (
        <button
          onClick={onEdit}
          className="flex size-[30px] items-center justify-center rounded hover:bg-muted"
          title="Edit"
        >
          <IconEdit className="size-4" />
        </button>
      )}
    </div>
  );
}
