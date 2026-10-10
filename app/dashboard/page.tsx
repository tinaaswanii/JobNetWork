import type { Metadata } from "next";
import { getUser } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

// Placeholder landing page so post-login redirects have a target.
// Dashboard features are built in a later step. Middleware already protects it.
export default async function DashboardPage() {
  const user = await getUser();
  const name =
    (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "there";
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-12">
      <h1 className="text-2xl font-bold tracking-tight">Hi, {name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">You&apos;re signed in.</p>
    </main>
  );
}
