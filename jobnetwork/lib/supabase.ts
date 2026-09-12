import { createClient } from "@supabase/supabase-js";

/**
 * Server-only client using the service role key — bypasses row-level security,
 * so only import this from route handlers / server code, never a client component.
 */
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

/** Public/anon client — safe to use in client components for read-only public data. */
export function supabasePublic() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
