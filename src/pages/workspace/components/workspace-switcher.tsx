import { useState } from "react";
import { IconChevronDown, IconCheck, IconPlus, IconLoader2 } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDataProvider } from "@/lib/data-provider";

export function WorkspaceSwitcher() {
  const dp = useDataProvider();
  const { data: workspaces, activeId, isLoading } = dp.useWorkspaces();
  const switchWorkspace = dp.useSwitchWorkspace();
  const { mutate: createWorkspace, isPending: isCreating } = dp.useCreateWorkspace();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");

  const active = workspaces.find((w) => w.id === activeId) ?? workspaces[0];
  const label = isLoading ? "Loading…" : active?.name ?? "Workspace";
  const initial = (active?.name ?? "W").trim().charAt(0).toUpperCase();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createWorkspace(name);
    setName("");
    setDialogOpen(false);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="mb-4 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-background"
            aria-label="Switch workspace"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-[11px] font-medium text-background">
              {initial}
            </span>
            <span className="flex-1 truncate text-sm font-medium text-foreground">
              {label}
            </span>
            <IconChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          {workspaces.map((w) => (
            <DropdownMenuItem
              key={w.id}
              onClick={() => switchWorkspace(w.id)}
              className="gap-2"
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-medium text-foreground">
                {w.name.trim().charAt(0).toUpperCase()}
              </span>
              <span className="flex-1 truncate">{w.name}</span>
              {w.id === activeId && <IconCheck className="size-4" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setDialogOpen(true)} className="gap-2">
            <IconPlus className="size-4" />
            Create workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Create workspace</DialogTitle>
              <DialogDescription>
                You'll be the admin. Invite teammates after.
              </DialogDescription>
            </DialogHeader>
            <Input
              autoFocus
              placeholder="Workspace name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="my-4"
            />
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim() || isCreating}>
                {isCreating && <IconLoader2 className="size-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
