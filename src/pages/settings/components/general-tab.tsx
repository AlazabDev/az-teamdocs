import { useState } from "react";
import { useDataProvider } from "@/lib/data-provider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function GeneralTab() {
  const dp = useDataProvider();
  const { mutate: deleteAccount, isPending } = dp.useDeleteAccount();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleThemeToggle(dark: boolean) {
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  function handleDeleteAccount() {
    deleteAccount();
    navigate("/");
  }

  return (
    <div className="space-y-8 max-w-lg">
      {/* Theme toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="theme-toggle" className="text-sm font-medium">
            Appearance
          </Label>
          <p className="text-sm text-muted-foreground">
            {isDark ? "Dark" : "Light"} mode
          </p>
        </div>
        <Switch
          id="theme-toggle"
          checked={isDark}
          onCheckedChange={handleThemeToggle}
        />
      </div>

      {/* Danger zone */}
      <div className="space-y-4">
        <Separator />
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Danger zone</h3>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            Delete account
          </Button>
        </div>
      </div>

      {/* Delete account confirm modal */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              All your documents will be permanently deleted. This can't be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={handleDeleteAccount}
              disabled={isPending}
            >
              Delete account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
