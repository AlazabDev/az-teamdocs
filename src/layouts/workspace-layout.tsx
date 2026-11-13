import { Outlet } from "react-router-dom";
import { TopBar } from "@/pages/workspace/components/top-bar";

export default function WorkspaceLayout() {
  return (
    <div
      className="flex h-screen flex-col bg-zinc-50 dark:bg-black"
      style={{
        backgroundImage: "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <TopBar />
      <div className="flex flex-1 flex-col overflow-hidden px-0 pt-2 lg:px-6">
        <div className="flex flex-1 flex-col overflow-hidden border border-border bg-sheet shadow-md lg:rounded-t-xl">
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
