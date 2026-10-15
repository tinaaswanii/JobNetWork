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

const perks: [string, string][] = [
  ["Track every application", "From first apply to final offer, all in one place."],
  ["Save jobs for later", "Park a role now, decide when you're ready."],
  ["Never miss a follow-up", "Interviews and reminders, lined up for you."],
];

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
    <main className="relative isolate overflow-hidden px-6 py-14 md:py-20">
      <div aria-hidden="true" className="hero-aurora pointer-events-none absolute inset-x-[-10%] top-[-30%] -z-10 h-[130%] opacity-70" />

      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-[1.1fr_1fr]">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/90">
            <span className="dot-ping h-2 w-2 rounded-full bg-mustard" aria-hidden="true" />
            Your job search, organised
          </p>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-5xl">
            Your net is ready.
            <span className="text-gradient block">Time to land the work.</span>
          </h1>
          <ul className="mt-8 hidden space-y-4 md:block">
            {perks.map(([title, text]) => (
              <li key={title} className="flex gap-3">
                <span aria-hidden="true" className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-board/25 text-sm text-denim">
                  ✓
                </span>
                <span>
                  <span className="block font-semibold text-ink">{title}</span>
                  <span className="block text-sm text-muted-foreground">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full rounded-2xl border border-white/10 bg-gradient-to-br from-[#121f3d] to-[#0d192f] p-8 shadow-[0_20px_60px_-20px_rgba(65,105,241,0.6)]">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">Sign in to JobNetWork</h2>
          <p className="mt-2 text-sm text-muted-foreground">One tap with Google. No passwords to remember.</p>

          {message && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {message}
            </div>
          )}

          <div className="mt-6">
            <GoogleButton next={next} />
          </div>

          <p className="mt-6 text-xs leading-5 text-muted-foreground">
            We only use your Google name, email and photo to create your account.{" "}
            <Link href="/jobs" className="font-medium text-denim underline underline-offset-2">
              Keep browsing jobs
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
