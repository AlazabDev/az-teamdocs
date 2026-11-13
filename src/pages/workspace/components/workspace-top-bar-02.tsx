import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { IconHome, IconFolder, IconSettings, type Icon } from "@tabler/icons-react";

interface Tab {
  label: string;
  href: string;
  icon: Icon;
}

const defaultTabs: Tab[] = [
  { label: "Home", href: "/workspace-02", icon: IconHome },
  { label: "Projects", href: "/workspace-02/projects", icon: IconFolder },
  { label: "Settings", href: "/workspace-02/settings", icon: IconSettings },
];

interface WorkspaceTopBar02Props {
  tabs?: Tab[];
}

export function WorkspaceTopBar02({ tabs = defaultTabs }: WorkspaceTopBar02Props) {
  const { pathname } = useLocation();

  return (
    <header className="flex h-12 shrink-0 items-center justify-between px-4 lg:px-6">
      <Link
        to="/workspace-02"
        className="font-heading text-[21px] font-semibold leading-6 tracking-tight text-foreground"
      >
        Acme
      </Link>

      {/* Pill segment tabs */}
      <nav className="hidden items-center rounded-full bg-muted p-1 lg:flex">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm transition-colors",
                isActive
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-muted" />
      </div>
    </header>
  );
}
