import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import { signInWithGoogle } from "@/lib/auth/google-sign-in";
import { safeNext } from "@/lib/auth/safe-next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AuthSearch = { error?: string | undefined; next?: string | undefined };

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

const ERROR_MESSAGES: Record<string, string> = {
  cancelled: "Sign-in was cancelled. You can try again whenever you're ready.",
  provider: "Google reported a problem signing you in. Please try again.",
  missing_code: "The sign-in link was incomplete. Please try again.",
  exchange: "We couldn't complete sign-in. Please try again.",
};

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    error: str(search["error"]),
    next: str(search["next"]),
  }),
  head: () => ({
    meta: [
      { title: "Sign in — JobNetWork Tracker" },
      { name: "description", content: "Sign in with Google to manage your job applications." },
      { property: "og:title", content: "Sign in — JobNetWork Tracker" },
      { property: "og:description", content: "Sign in with Google to manage your job applications." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { error: errorCode, next } = Route.useSearch();
  const [error, setError] = useState<string | null>(
    errorCode ? (ERROR_MESSAGES[errorCode] ?? "Something went wrong signing you in.") : null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) window.location.replace(safeNext(next));
    });
  }, [next]);

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    const result = await signInWithGoogle(next);
    if (result.error) {
      setError("Sign-in failed. Please try again.");
      setLoading(false);
      return;
    }
    if (result.redirected) return; // browser is navigating to Google
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Briefcase className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">JobNetWork Tracker</CardTitle>
          <CardDescription>
            Sign in to track your job applications, interviews, and follow-ups.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            size="lg"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? "Redirecting…" : "Continue with Google"}
          </Button>
          {error && (
            <p className="mt-3 text-center text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
