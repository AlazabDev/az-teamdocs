import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/base/badge";
import type { BadgeColor } from "@/components/base/badge";

const roleBadgeColor: Record<string, BadgeColor> = {
  admin: "gray",
  editor: "blue",
  viewer: "gray",
};

interface MemberRowProps {
  userId: string;
  fullName: string;
  initials: string;
  avatarUrl: string | null;
  role: string;
  prefix: string;
  action?: React.ReactNode;
}

export function MemberRow({
  userId,
  fullName,
  initials,
  avatarUrl,
  role,
  prefix,
  action,
}: MemberRowProps) {
  return (
    <div className="group flex items-center gap-3 rounded-[10px] py-2 transition-colors hover:bg-accent/50">
      <Link
        to={`${prefix}/members/${userId}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <Avatar className="size-8">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span className="flex-1 text-sm font-medium text-foreground">
          {fullName}
        </span>
        <Badge color={roleBadgeColor[role]}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Badge>
      </Link>
      {action && (
        <div onClick={(e) => e.stopPropagation()}>{action}</div>
      )}
    </div>
  );
}
