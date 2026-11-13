import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Awareness } from "y-protocols/awareness";

interface AwarenessUser {
  name: string;
  color: string;
  avatarUrl?: string | null;
}

interface AvatarStackProps {
  awareness: Awareness | undefined;
}

/**
 * Overlapping avatars of connected users from Yjs awareness.

 * - Spring animation on enter (scale 0.2→1)
 * - Max 3 visible + "+N" remainder
 * - Tooltips with full name
 * - Avatar image with initials fallback
 */
export function AvatarStack({ awareness }: AvatarStackProps) {
  const [users, setUsers] = useState<AwarenessUser[]>([]);

  useEffect(() => {
    if (!awareness) return;

    const update = () => {
      const states = awareness.getStates();
      const clientId = awareness.clientID;
      const others: AwarenessUser[] = [];

      states.forEach((state, id) => {
        if (id === clientId) return;
        const user = state.user as AwarenessUser | undefined;
        if (user?.name) {
          others.push(user);
        }
      });

      setUsers(others);
    };

    update();
    awareness.on("update", update);
    return () => awareness.off("update", update);
  }, [awareness]);

  if (users.length === 0) return null;

  const visible = users.slice(0, 3);
  const remainder = users.length - 3;

  return (
    <TooltipProvider>
      <div className="flex items-center">
        <AnimatePresence>
          {visible.map((user, i) => (
            <motion.div
              key={user.name + i}
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
              className="-ml-1.5 first:ml-0"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="size-6 border-2 border-background">
                    {user.avatarUrl && (
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                    )}
                    <AvatarFallback
                      className="text-[10px] font-medium text-white"
                      style={{ backgroundColor: user.color }}
                    >
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {user.name}
                </TooltipContent>
              </Tooltip>
            </motion.div>
          ))}
          {remainder > 0 && (
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="-ml-1.5"
            >
              <Avatar className="size-6 border-2 border-background">
                <AvatarFallback className="text-[10px] font-medium">
                  +{remainder}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name[0] ?? "?").toUpperCase();
}
