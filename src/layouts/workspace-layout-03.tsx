import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  IconHome,
  IconFiles,
  IconSettings,
  IconChartBar,
  IconLayoutSidebar,
  IconPlus,
  IconLogout,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDataProvider } from "@/lib/data-provider";
import { supabase } from "@/integrations/supabase/client";
import { WorkspaceSwitcher } from "@/pages/workspace/components/workspace-switcher";
import { EXIT_DEMO_ROUTE, useIsDemo } from "@/lib/demo";


// Sidebar toggle context — consumed by canvas-toolbar on editor routes
const SidebarToggleContext = createContext<{
  sidebarOpen: boolean;
  toggleSidebar: () => void;
} | null>(null);

export function useSidebarToggle() {
  return useContext(SidebarToggleContext);
}

export default function WorkspaceLayout03() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);

  // Demo-ness comes from useIsDemo() and nothing else — see src/lib/demo.ts.
  const isDemo = useIsDemo();
  const prefix = isDemo ? "/demo" : "";
  const isEditorRoute = /\/(demo\/)?documents\/[^/]+$/.test(pathname);

  const navItems = [
    { label: "Overview", href: `${prefix}/overview`, icon: IconHome },
    { label: "Documents", href: `${prefix}/documents`, icon: IconFiles },
    { label: "Analytics", href: `${prefix}/analytics`, icon: IconChartBar },
    { label: "Settings", href: `${prefix}/settings`, icon: IconSettings },
  ];


  const activeItem =
    navItems.find((item) => pathname.startsWith(item.href)) ?? navItems[0];

  const data = useDataProvider();
  const { mutate: createDocument, isPending: isCreating } = data.useCreateDocument();
  const { data: profile } = data.useProfile();

  const handleNewDocument = async () => {
    const id = await createDocument();
    if (id) {
      navigate(`${prefix}/documents/${id}`);
    }
  };

  const initials = profile?.full_name
    ? profile.full_name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <SidebarToggleContext.Provider value={{ sidebarOpen, toggleSidebar }}>
    <div className="flex h-screen bg-muted">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col p-4 transition-[width] duration-300 lg:flex",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden p-0",
        )}
      >
        <Link
          to={`${prefix}/overview`}
          className="mb-4 px-2 font-heading text-[21px] font-semibold leading-6 tracking-tight text-foreground"
        >
          Team Docs
        </Link>
        {!isDemo && <WorkspaceSwitcher />}
        <nav className="flex flex-1 flex-col gap-1">
          <Button
            variant="ghost"
            onClick={handleNewDocument}
            disabled={isCreating}
            className="h-auto justify-start gap-2 rounded-full px-2 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <IconPlus className="size-4" />
            New document
          </Button>

          <div className="my-2 h-px bg-border" />

          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-full px-2 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-background font-medium text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>


        {/* Footer. Order is fixed: the leave affordance sits ABOVE the settings /
            account row, and the account row is always last. On /demo/* there is no
            session to sign out of, so the affordance is "Exit demo" — a plain
            navigation to the marketing landing. */}
        <div className="mt-auto flex flex-col gap-1">
          <div className="my-2 h-px bg-border" />
          {isDemo ? <ExitDemoButton /> : <LogoutButton />}
          <Link
            to={`${prefix}/settings`}
            className={cn(
              "flex items-center gap-2 rounded-full px-2 py-2 transition-colors hover:text-foreground",
              pathname.startsWith(`${prefix}/settings`)
                ? "bg-background font-medium text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            <Avatar className="size-6">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? "User"} />}
              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm">
              {profile?.full_name ?? "User"}
            </span>
          </Link>
        </div>
      </aside>

      {/* Main content — inset card (no padding on editor routes) */}
      <div className={cn(
        "flex flex-1 flex-col overflow-hidden",
        !isEditorRoute && "p-0 lg:py-2 lg:pr-2"
      )}>
        <div className={cn(
          "flex flex-1 flex-col overflow-hidden",
          isEditorRoute
            ? "bg-background"
            : "border border-border bg-background shadow-sm lg:rounded-xl"
        )}>
          {/* Header with toggle + breadcrumbs — hidden on editor (it has its own canvas toolbar) */}
          {!isEditorRoute && (
            <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setSidebarOpen((o) => !o)}
                aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
              >
                <IconLayoutSidebar className="size-4" />
              </Button>
              <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
                <span className="font-medium text-foreground">
                  {activeItem.label}
                </span>
              </nav>

            </div>
          )}

          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
    </SidebarToggleContext.Provider>
  );
}

/**
 * The demo's leave affordance. A demo visitor has no session, so "Log out" would be
 * meaningless here — they leave via a plain navigation to EXIT_DEMO_ROUTE.
 */
function ExitDemoButton() {
  return (
    <Link
      to={EXIT_DEMO_ROUTE}
      className="flex items-center gap-2 rounded-full px-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <IconX className="size-4" />
      Exit demo
    </Link>
  );
}

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: "global" });
    navigate("/");
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className="h-auto justify-start gap-2 rounded-full px-2 py-2 text-sm text-muted-foreground hover:text-foreground"
    >
      <IconLogout className="size-4" />
      Log out
    </Button>
  );
}
