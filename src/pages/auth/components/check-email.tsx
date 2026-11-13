import { useState } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { supabase } from "@/integrations/supabase/client";

interface CheckEmailProps {
  email: string;
}

export function CheckEmail({ email }: CheckEmailProps) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    setResent(true);
  };

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h2 className="text-lg font-semibold">Check your email</h2>
      <p className="text-sm text-muted-foreground">
        We sent a confirmation link to{" "}
        <span className="font-medium text-foreground">{email}</span>
      </p>
      <p className="text-sm text-muted-foreground">
        Didn&apos;t get it?{" "}
        {resent ? (
          <span className="text-foreground">Email resent</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-medium text-foreground hover:underline disabled:opacity-50"
          >
            {resending && (
              <IconLoader2 size={14} className="inline animate-spin mr-1" />
            )}
            Resend email
          </button>
        )}
      </p>
    </div>
  );
}
