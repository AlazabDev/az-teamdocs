import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useDataProvider } from "@/lib/data-provider";
import { formatDate } from "@/lib/utils";
import { MemberRow } from "@/components/base/member-row";
import { Badge } from "@/components/base/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { IconLoader2, IconCopy } from "@tabler/icons-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import type { BadgeColor } from "@/components/base/badge";
import { useAuth } from "@/lib/auth/auth-provider";

const roleBadgeColor: Record<string, BadgeColor> = {
  admin: "gray",
  editor: "blue",
  viewer: "gray",
};

export function TeamTab() {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const { pathname } = useLocation();
  const prefix = pathname.startsWith("/demo") ? "/demo" : "";

  const dp = useDataProvider();
  const { data: members } = dp.useTeamMembers();
  const { data: invitations } = dp.useInvitations();
  const { mutate: createInvitation, isPending: isInviting } = dp.useCreateInvitation();
  const { mutate: updateRole } = dp.useUpdateMemberRole();
  const { mutate: revokeMember } = dp.useRevokeMember();
  const { mutate: revokeInvitation } = dp.useRevokeInvitation();

  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor");
  const [revokeTarget, setRevokeTarget] = useState<{
    userId: string;
    name: string;
  } | null>(null);

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    createInvitation({ email: email.trim(), role: inviteRole });
    setEmail("");
  }

  const formattedInvitations = useMemo(
    () =>
      invitations.map((inv) => ({
        ...inv,
        sentDate: formatDate(inv.created_at),
      })),
    [invitations],
  );

  return (
    <div className="space-y-6">
      {/* Invite form */}
      <form onSubmit={handleInvite} className="flex items-end gap-2">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-foreground">
            Invite a teammate
          </label>
          <Input
            type="email"
            placeholder="teammate@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Select
          value={inviteRole}
          onValueChange={(v) => setInviteRole(v as "editor" | "viewer")}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={isInviting}>
          {isInviting && <IconLoader2 className="size-4 animate-spin" />}
          Invite
        </Button>
      </form>

      {/* Team members */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Team members ({members.length})
        </h3>
        <div>
          {members.map((member) => {
            const isCurrentUser = member.user_id === currentUserId;
            return (
              <MemberRow
                key={member.user_id}
                userId={member.user_id}
                fullName={member.full_name}
                initials={member.initials}
                avatarUrl={member.avatar_url}
                role={member.role}
                prefix={prefix}
                action={
                  isCurrentUser ? (
                    <span className="text-sm text-muted-foreground">You</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Select
                        value={member.role}
                        onValueChange={(v) => updateRole(member.user_id, v)}
                      >
                        <SelectTrigger className="h-8 w-24 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setRevokeTarget({
                            userId: member.user_id,
                            name: member.full_name,
                          })
                        }
                      >
                        Revoke
                      </Button>
                    </div>
                  )
                }
              />
            );
          })}
        </div>
      </div>

      {/* Pending invitations */}
      {formattedInvitations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Pending invitations ({formattedInvitations.length})
          </h3>
          <div>
            {formattedInvitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-3 rounded-[10px] py-2"
              >
                <span className="flex-1 text-sm text-foreground">
                  {inv.email}
                </span>
                <Badge color={roleBadgeColor[inv.role]}>
                  {inv.role.charAt(0).toUpperCase() + inv.role.slice(1)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Sent {inv.sentDate}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    const link = `${window.location.origin}${prefix}/auth?email=${encodeURIComponent(inv.email)}`;
                    try {
                      await navigator.clipboard.writeText(link);
                      toast.success("Invite link copied", {
                        description: `Send it to ${inv.email}. They'll join after signing in.`,
                      });
                    } catch {
                      toast.error("Couldn't copy link");
                    }
                  }}
                >
                  <IconCopy className="size-4" />
                  Copy link
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => revokeInvitation(inv.id)}
                >
                  Cancel
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revoke confirm */}
      <AlertDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {revokeTarget?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They'll lose access to all team documents immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={() => {
                if (revokeTarget) {
                  revokeMember(revokeTarget.userId);
                  setRevokeTarget(null);
                }
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
