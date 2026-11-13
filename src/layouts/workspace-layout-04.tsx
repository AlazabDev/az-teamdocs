import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { IconHome, IconFolder, IconChartBar, IconUsers, IconSettings, IconBell, type Icon } from "@tabler/icons-react";

interface Tab {
  label: string;
  href: string;
  icon: Icon;
}

const tabs: Tab[] = [
  { label: "Home", href: "/workspace-04", icon: IconHome },
  { label: "Projects", href: "/workspace-04/projects", icon: IconFolder },
  { label: "Analytics", href: "/workspace-04/analytics", icon: IconChartBar },
  { label: "People", href: "/workspace-04/people", icon: IconUsers },
];

export default function WorkspaceLayout04() {
  const { pathname } = useLocation();

  return (
    <div className="flex h-screen flex-col bg-muted">
      {/* Header — white bar */}
      <header className="flex h-12 shrink-0 items-center justify-between bg-background px-4 shadow-sm lg:px-6">
        {/* Left — logo */}
        <div className="flex items-center gap-2">
          <Link
            to="/workspace-04"
            className="font-heading text-[21px] font-semibold leading-6 tracking-tight text-foreground"
          >
            Acme
          </Link>
        </div>

        {/* Center — icon tabs with underline */}
        <nav className="-mb-px flex h-full items-center gap-6">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                to={tab.href}
                className={cn(
                  "flex h-full min-w-12 items-center justify-center border-b-2 transition-colors",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <tab.icon className="size-5" />
              </Link>
            );
          })}
        </nav>

        {/* Right — actions + avatar */}
        <div className="flex items-center gap-4">
          <IconBell className="size-4 text-muted-foreground" />
          <IconSettings className="size-4 text-muted-foreground" />
          <div className="size-7 rounded-full bg-muted" />
        </div>
      </header>

      {/* Content — muted bg, no card */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
