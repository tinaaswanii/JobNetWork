import type { Metadata } from "next";
import Link from "next/link";
import GoogleButton from "@/components/auth/GoogleButton";
import { safeNext } from "@/lib/auth/safe-next";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

const MESSAGES: Record<string, string> = {
  cancelled: "Sign-in was cancelled. You can try again whenever you're ready.",
  provider: "Google reported a problem signing you in. Please try again.",
  missing_code: "The sign-in link was incomplete. Please try again.",
  exchange: "We couldn't complete sign-in. Please try again.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  const message = searchParams.error
    ? MESSAGES[searchParams.error] ?? "Something went wrong signing you in."
    : null;
  const next = safeNext(searchParams.next);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-6 py-16">
      <div className="pinned-card w-full rounded-2xl border bg-white p-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome to JobNetWork</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to track applications and save jobs.
        </p>

        {message && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {message}
          </div>
        )}

        <div className="mt-6">
          <GoogleButton next={next} />
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          We only use your Google name, email and photo to create your account.{" "}
          <Link href="/jobs" className="underline">
            Keep browsing jobs
          </Link>
        </p>
      </div>
    </main>
  );
}
