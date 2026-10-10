import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cookie-aware Supabase client for server components, route handlers and
 * server actions. Uses the ANON key + the signed-in user's session, so
 * row-level security applies. Never use supabaseAdmin() for user-owned data.
 */
export function supabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component (cookies are read-only there).
            // Safe to ignore: middleware refreshes the session cookie.
          }
        },
      },
    }
  );
}

/**
 * The authenticated user, verified against Supabase Auth (getUser, not
 * getSession, so a forged cookie can't pass). Use this — never an ID sent by
 * the client — as the owner of private records.
 */
export async function getUser() {
  const { data } = await supabaseServer().auth.getUser();
  return data.user ?? null;
}
