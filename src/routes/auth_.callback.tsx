import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { safeNext } from "@/lib/auth/safe-next";

type CallbackSearch = {
  code?: string | undefined;
  error?: string | undefined;
  next?: string | undefined;
};

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

// OAuth return URL. Supabase redirects here either with ?code=... (PKCE) or with
// tokens in the URL hash (implicit flow, which supabase-js parses on load).
// Handles both, verifies the user server-side, then continues to `next`.
export const Route = createFileRoute("/auth_/callback")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): CallbackSearch => ({
    code: str(search["code"]),
    error: str(search["error"]),
    next: str(search["next"]),
  }),
  head: () => ({
    meta: [{ title: "Signing in…" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const { code, error, next } = Route.useSearch();
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // the code is single-use; never exchange twice
    ran.current = true;

    const fail = (reason: string) =>
      navigate({ to: "/auth", search: { error: reason }, replace: true });

    (async () => {
      if (error) {
        fail(error === "access_denied" ? "cancelled" : "provider");
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          fail("exchange");
          return;
        }
      } else {
        // Awaits supabase-js initialization, which consumes any hash tokens.
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          fail("missing_code");
          return;
        }
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        fail("exchange");
        return;
      }

      // Profile rows are created by a database trigger on sign-up.
      window.location.replace(safeNext(next));
    })().catch(() => fail("exchange"));
  }, [code, error, next, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  );
}
