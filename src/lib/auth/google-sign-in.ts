import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { safeNext } from "@/lib/auth/safe-next";

// Hosts where Lovable's own hosting serves the OAuth broker at /~oauth/initiate.
// The Lovable SDK navigates to that *relative* path, so it only exists on these
// hosts. On any other host (e.g. Vercel) it is a 404 and sign-in never reaches
// Google, so there we use Supabase's native OAuth redirect instead.
const LOVABLE_ZONES = [
  "lovable.app",
  "lovableproject.com",
  "lovableproject-dev.com",
  "lovable.dev",
  "gpt-eng.com",
  "gptengineer.run",
];

export function isLovableHost(hostname: string): boolean {
  return LOVABLE_ZONES.some((zone) => hostname === zone || hostname.endsWith(`.${zone}`));
}

export type GoogleSignInResult = { error: Error | null; redirected: boolean };

/** Start Google sign-in. Browser-only: call from an event handler. */
export async function signInWithGoogle(
  next: string | null | undefined,
): Promise<GoogleSignInResult> {
  const target = safeNext(next);
  const { origin, hostname } = window.location;

  if (isLovableHost(hostname)) {
    // Unchanged behaviour on Lovable-hosted previews.
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: origin });
    if (result.error) return { error: result.error, redirected: false };
    return { error: null, redirected: Boolean(result.redirected) };
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(target)}` },
  });
  // On success the browser navigates away to Google.
  return { error: error ?? null, redirected: !error };
}
