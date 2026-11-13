import { useState } from "react";
import { Link, useSearchParams, Navigate } from "react-router-dom";
import { IconArrowLeft } from "@tabler/icons-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth/auth-provider";
import { SocialAuthButtons } from "@/components/base/social-auth-buttons";
import { SignInForm } from "./components/sign-in-form";
import { SignUpForm } from "./components/sign-up-form";
import { CheckEmail } from "./components/check-email";

export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "signin";

  const handleTabChange = (value: string) => {
    setConfirmationEmail(null);
    if (value === "signup") {
      setSearchParams({ tab: "signup" });
    } else {
      setSearchParams({});
    }
  };

  if (!loading && user) {
    return <Navigate to="/overview" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowLeft size={16} />
          Back to home
        </Link>

        <Card>
          <CardHeader className="items-center pb-2">
            <h1 className="text-lg font-semibold">Team Docs</h1>
          </CardHeader>
          <CardContent>
            {confirmationEmail ? (
              <CheckEmail email={confirmationEmail} />
            ) : (
              <Tabs
                defaultValue={defaultTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="mb-6 w-full">
                  <TabsTrigger value="signin" className="flex-1">
                    Sign in
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="flex-1">
                    Sign up
                  </TabsTrigger>
                </TabsList>

                {/* The ONE brand-compliant SSO button set. Do not restyle or rebuild
                    it inline — see docs/design/auth.md. */}
                <SocialAuthButtons mode={defaultTab} />

                <div className="relative my-6">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-xs text-muted-foreground">
                    or
                  </span>
                </div>

                <TabsContent value="signin" className="mt-0">
                  <SignInForm />
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
                  <SignUpForm
                    onEmailConfirmation={(email) => setConfirmationEmail(email)}
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
