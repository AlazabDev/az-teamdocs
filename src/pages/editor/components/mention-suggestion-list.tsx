/**
 * @mention suggestion dropdown for the comment input.
 * Shows workspace members filtered by query, keyboard navigable.
 *
 * Reference: editor-context-provider lines 65019-65083 (Aue, f9, p9, Nue)
 */

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface MentionUser {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role?: string;
}

interface MentionSuggestionListProps {
  items: MentionUser[];
  command: (item: { id: string; label: string }) => void;
}

export interface MentionSuggestionListHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const MentionSuggestionList = forwardRef<
  MentionSuggestionListHandle,
  MentionSuggestionListProps
>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => setSelectedIndex(0), [items]);

  const selectItem = (index: number) => {
    const item = items[index];
    if (item) {
      command({ id: item.id, label: item.full_name });
    }
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((i) => (i + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((i) => (i + 1) % items.length);
        return true;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return (
      // Container: bg white, rounded 6px, shadow, border grey[5], min-width 250px
      <div className="min-w-[250px] rounded-md border bg-background p-3 text-center text-sm text-muted-foreground shadow-lg">
        No results
      </div>
    );
  }

  return (
    <div className="min-w-[250px] max-h-[220px] overflow-y-auto rounded-md border bg-background shadow-[0_16px_24px_rgba(0,0,0,0.08)]">
      {items.map((item, index) => (
        <button
          key={item.id}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => selectItem(index)}
          className={`flex w-full items-center justify-between border-b border-border/50 px-4 py-2.5 text-left text-sm transition-colors last:border-b-0 ${
            index === selectedIndex ? "bg-muted" : "hover:bg-muted"
          }`}
        >
          <div className="flex items-center gap-2">
            <Avatar className="size-5">
              {item.avatar_url && (
                <AvatarImage src={item.avatar_url} alt={item.full_name} />
              )}
              <AvatarFallback className="text-[10px] font-medium">
                {getInitials(item.full_name)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{item.full_name}</span>
          </div>
          {item.role && (
            <span className="text-xs text-muted-foreground capitalize">
              {item.role}
            </span>
          )}
        </button>
      ))}
    </div>
  );
});

MentionSuggestionList.displayName = "MentionSuggestionList";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name[0] ?? "?").toUpperCase();
}
