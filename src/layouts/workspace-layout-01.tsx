import { Outlet } from "react-router-dom";
import {
  SidebarInset,
  PeekableProvider,
  PeekableSidebarProvider,
  PeekPane,
  usePeekable,
  useSidebarMouseListener,
} from "@/components/base/sidebar";
import { AppSidebar, PeekPaneBody } from "@/pages/workspace/components/app-sidebar";

function MouseListener() {
  useSidebarMouseListener();
  return null;
}

function Content() {
  const { isPeeking } = usePeekable();

  return (
    <SidebarInset
      className="h-svh max-h-svh"
      style={{ pointerEvents: isPeeking ? "none" : "auto" }}
    >
      <Outlet />
    </SidebarInset>
  );
}

export default function WorkspaceLayout() {
  return (
    <PeekableProvider>
      <PeekableSidebarProvider>
        <AppSidebar />
        <PeekPane>
          <PeekPaneBody />
        </PeekPane>
        <Content />
        <MouseListener />
      </PeekableSidebarProvider>
    </PeekableProvider>
  );
}
