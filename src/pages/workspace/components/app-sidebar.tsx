import { IconChevronsLeft } from "@tabler/icons-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  useShadcnSidebar,
  usePeekable,
} from "@/components/base/sidebar";

export function PeekPaneBody() {
  const { state, actions } = usePeekable();
  const { setOpenMobile } = useShadcnSidebar();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center">
          <span className="text-sm font-semibold">Workspace</span>
          <div className="flex-1" />
          {state.isExpanded && (
            <SidebarMenuButton
              size="sm"
              className="hidden w-fit opacity-0 pointer-events-none group-hover/sidebar-pane:opacity-100 group-hover/sidebar-pane:pointer-events-auto transition-opacity duration-200 md:flex"
              onClick={() => actions.collapse("unpin")}
            >
              <IconChevronsLeft />
            </SidebarMenuButton>
          )}
          <SidebarMenuButton
            size="sm"
            className="w-fit md:hidden"
            onClick={() => setOpenMobile(false)}
          >
            <IconChevronsLeft />
          </SidebarMenuButton>
        </div>
      </SidebarHeader>
      <SidebarContent />
      <SidebarFooter />
    </>
  );
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" {...props}>
      <PeekPaneBody />
    </Sidebar>
  );
}
