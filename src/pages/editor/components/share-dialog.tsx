/**
 * Share dialog — invite users and manage document permissions.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconX } from "@tabler/icons-react";
import { useAuth } from "@/lib/auth/auth-provider";
import {
  useDocumentPermissions,
  useGrantPermission,
  useRevokePermission,
} from "@/lib/collaboration/use-document-permissions";
import type { PermissionRole } from "@/lib/collaboration/types";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  title: string;
}

const ROLE_LABELS: Record<PermissionRole, string> = {
  editor: "Can edit",
  commenter: "Can comment",
  viewer: "Can view",
};

export function ShareDialog({
  open,
  onOpenChange,
  documentId,
  title,
}: ShareDialogProps) {
  const { user } = useAuth();
  const { data: permissions = [] } = useDocumentPermissions(documentId);
  const grantMutation = useGrantPermission();
  const revokeMutation = useRevokePermission();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<PermissionRole>("editor");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const handleInvite = useCallback(async () => {
    if (!email.trim()) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await grantMutation.mutateAsync({ documentId, email: email.trim(), role });
      setSuccessMessage(result.message ?? `Invitation sent to ${email.trim()}`);
      setEmail("");

      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to send invitation",
      );
    }
  }, [email, role, documentId, grantMutation]);

  const handleRevoke = useCallback(
    (permissionId: string) => {
      revokeMutation.mutate({ permissionId, documentId });
    },
    [revokeMutation, documentId],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && email.trim()) {
        e.preventDefault();
        handleInvite();
      }
    },
    [handleInvite, email],
  );

  const ownerName =
    user?.user_metadata?.full_name ?? user?.email ?? "You";
  const ownerAvatar = user?.user_metadata?.avatar_url ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            Share &ldquo;{title || "Untitled"}&rdquo;
          </DialogTitle>
        </DialogHeader>

        {/* Invite row */}
        <div className="flex items-center gap-2">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMessage(null);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Select
            value={role}
            onValueChange={(v) => setRole(v as PermissionRole)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="editor">Can edit</SelectItem>
              <SelectItem value="commenter">Can comment</SelectItem>
              <SelectItem value="viewer">Can view</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleInvite}
            disabled={!email.trim() || grantMutation.isPending}
          >
            Invite
          </Button>
        </div>

        {/* Success / error messages */}
        {successMessage && (
          <p className="text-sm text-green-600">{successMessage}</p>
        )}
        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}

        {/* People with access */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            People with access
          </p>

          {/* Owner row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                {ownerAvatar && (
                  <AvatarImage src={ownerAvatar} alt={ownerName} />
                )}
                <AvatarFallback className="text-[10px] font-medium">
                  {getInitials(ownerName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">You</span>
            </div>
            <span className="text-sm text-muted-foreground">Owner</span>
          </div>

          {/* Permission rows */}
          {permissions.map((perm) => {
            const isPending = perm.status === "pending";
            const displayName = isPending
              ? perm.email ?? "Pending"
              : perm.profiles?.full_name ?? "User";

            return (
              <div key={perm.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="size-6">
                    {!isPending && perm.profiles?.avatar_url && (
                      <AvatarImage
                        src={perm.profiles.avatar_url}
                        alt={displayName}
                      />
                    )}
                    <AvatarFallback className="text-[10px] font-medium">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{displayName}</span>
                  {isPending && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Pending
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {ROLE_LABELS[perm.role]}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={() => handleRevoke(perm.id)}
                  >
                    <IconX className="size-3" />
                  </Button>
                </div>
              </div>
            );
          })}

          {permissions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No one else has access.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name[0] ?? "?").toUpperCase();
}
