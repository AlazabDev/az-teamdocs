import { Outlet } from "react-router-dom";
import { WorkspaceTopBar02 } from "@/pages/workspace/components/workspace-top-bar-02";

export default function WorkspaceLayout02() {
  return (
    <div
      className="flex h-screen flex-col bg-muted"
      style={{
        backgroundImage: "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <WorkspaceTopBar02 />
      <div className="flex flex-1 flex-col overflow-hidden px-0 pt-2 lg:px-2">
        <div className="flex flex-1 flex-col overflow-hidden border border-border bg-background shadow-md lg:rounded-t-xl">
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
