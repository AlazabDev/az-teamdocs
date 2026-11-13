import { useEffect, useState } from "react";
import { useDataProvider } from "@/lib/data-provider";
import { useAuth } from "@/lib/auth/auth-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IconLoader2 } from "@tabler/icons-react";

export function ProfileForm() {
  const dp = useDataProvider();
  const { user } = useAuth();
  const { data: profile } = dp.useProfile();
  const { mutate: updateProfile, isPending } = dp.useUpdateProfile();

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Sync field once profile loads (it's null on first render while query is pending)
  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
  }, [profile?.full_name]);


  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");

    if (newPassword && newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    updateProfile({
      fullName,
      ...(newPassword ? { newPassword } : {}),
    });

    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="full-name">Full name</Label>
        <Input
          id="full-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={user?.email ?? "alex@yourteam.com"}
          readOnly
          className="opacity-60"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {passwordError && (
          <p className="text-sm text-destructive">{passwordError}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <IconLoader2 className="size-4 animate-spin" />}
        Save changes
      </Button>
    </form>
  );
}
