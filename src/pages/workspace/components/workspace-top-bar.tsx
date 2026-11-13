import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  href: string;
}

interface WorkspaceTopBarProps {
  tabs?: Tab[];
}

const defaultTabs: Tab[] = [
  { label: "Home", href: "/workspace" },
  { label: "Projects", href: "/workspace/projects" },
  { label: "Settings", href: "/workspace/settings" },
];

export function WorkspaceTopBar({ tabs = defaultTabs }: WorkspaceTopBarProps) {
  const { pathname } = useLocation();

  return (
    <header className="flex h-12 shrink-0 items-center justify-between px-4 lg:px-6">
      <Link
        to="/workspace"
        className="font-heading text-[21px] font-semibold leading-6 tracking-tight text-foreground"
      >
        Acme
      </Link>
      <nav className="hidden items-center gap-1 lg:flex">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                isActive
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
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
