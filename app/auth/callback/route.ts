import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/auth/server";
import { safeNext } from "@/lib/auth/safe-next";

/**
 * OAuth return URL. Supabase redirects here with ?code=... (PKCE); we exchange
 * it for a session cookie, upsert the user's profile, then redirect.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = safeNext(searchParams.get("next"));

  // User cancelled on Google's consent screen, or the provider errored.
  const providerError = searchParams.get("error");
  if (providerError) {
    const reason = providerError === "access_denied" ? "cancelled" : "provider";
    return NextResponse.redirect(`${origin}/login?error=${reason}`);
  }

  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect(`${origin}/login?error=missing_code`);

  const supabase = supabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/login?error=exchange`);

  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return NextResponse.redirect(`${origin}/login?error=exchange`);

  // Profile upsert keyed on the auth user id (primary key => no duplicates).
  // Runs as the user, so RLS ("own row only") enforces ownership.
  const meta = user.user_metadata ?? {};
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      full_name: meta.full_name ?? meta.name ?? null,
      avatar_url: meta.avatar_url ?? meta.picture ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (profileError) console.error("profile upsert failed:", profileError.message);

  return NextResponse.redirect(`${origin}${next}`);
}
