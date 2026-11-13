import { Link, useLocation } from "react-router-dom";
import {
  IconChevronRight,
  IconDots,
  IconTrash,
  IconMessage,
  IconLayoutSidebar,
  IconShare,
} from "@tabler/icons-react";
import { useSidebarToggle } from "@/layouts/workspace-layout-03";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AvatarStack } from "./avatar-stack";
import type { Awareness } from "y-protocols/awareness";

interface CanvasToolbarProps {
  title: string;
  saveStatus: "idle" | "saving" | "saved";
  wordCount: number;
  onDelete: () => void;
  awareness?: Awareness;
  onToggleChat?: () => void;
  chatOpen?: boolean;
  onShare?: () => void;
}

export function CanvasToolbar({
  title,
  saveStatus,
  wordCount,
  onDelete,
  awareness,
  onToggleChat,
  chatOpen,
  onShare,
}: CanvasToolbarProps) {
  const { pathname } = useLocation();
  const isDemo = pathname.startsWith("/demo");
  const prefix = isDemo ? "/demo" : "";

  const statusText =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
        ? "Saved ✓"
        : "";

  const sidebarToggle = useSidebarToggle();

  return (
    <div className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between px-4" style={{ backgroundColor: "#f7f7f7" }}>
      <nav className="flex items-center gap-1 text-sm">
        {sidebarToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 mr-1"
            onClick={sidebarToggle.toggleSidebar}
            aria-label={sidebarToggle.sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            <IconLayoutSidebar className="size-4" />
          </Button>
        )}
        <Link
          to={`${prefix}/documents`}
          className="text-muted-foreground hover:text-foreground"
        >
          Documents
        </Link>
        <IconChevronRight className="size-3 text-muted-foreground" />
        <span className="font-medium text-foreground">
          {title || "Untitled"}
        </span>
      </nav>
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground">{statusText}</span>
        <span className="text-xs text-muted-foreground">
          {wordCount.toLocaleString()} words
        </span>
        <AvatarStack awareness={awareness} />
        {onShare && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5"
            onClick={onShare}
          >
            <IconShare className="size-4" />
            Share
          </Button>
        )}
        {onToggleChat && (
          <Button
            variant={chatOpen ? "secondary" : "ghost"}
            size="icon"
            className="size-8"
            onClick={onToggleChat}
          >
            <IconMessage className="size-4" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <IconDots className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <IconTrash className="size-4" />
              Delete document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
