import Link from "next/link";
import type { PublicJob } from "@/lib/types";

const WHATSAPP_URL = "https://chat.whatsapp.com/L9DG89VrT4V2UFjFkpv0Ok";

// Plain <a> links on purpose: the board reads its filters from the URL on
// page load, so these need a real navigation to apply.
const popular: [string, string][] = [
  ["Internships", "intern"],
  ["Developer", "developer"],
  ["Data & analytics", "analyst"],
  ["Marketing", "marketing"],
  ["Sales", "sales"],
  ["Manager", "manager"],
  ["Support", "support"],
  ["Design", "designer"],
];

const quickLinks = [
  {
    href: "/match",
    title: "Match your resume",
    text: "See how your skills line up with a role.",
    icon: "M9 12h6M9 16h6M9 8h3M7 3h7l5 5v13H7z",
  },
  {
    href: "/prep-trek",
    title: "Free interview cards",
    text: "Quick tap-and-try prep, by subject.",
    icon: "M4 6h16M4 12h16M4 18h10",
  },
  {
    href: WHATSAPP_URL,
    title: "Jobs on WhatsApp & Telegram",
    text: "New openings shared in our community.",
    icon: "M21 11.5a8.4 8.4 0 0 1-9 8.5 9.2 9.2 0 0 1-4-.9L3 20l1.1-4.1A8.3 8.3 0 0 1 3 11.5 8.5 8.5 0 1 1 21 11.5z",
    external: true,
  },
];

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export default function HomeHero({
  total,
  jobs,
}: {
  total: number;
  jobs: PublicJob[];
}) {
  return (
    <section className="relative overflow-hidden bg-boardDark px-6 pb-16 pt-14 text-white md:px-12 md:pb-20 md:pt-20">
      {/* faint grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-12 md:grid-cols-[1.3fr_1fr] md:items-center">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/85">
            <span className="h-1.5 w-1.5 rounded-full bg-mustard" />
            {total > 0
              ? `${total.toLocaleString("en-IN")} openings listed`
              : "New openings added regularly"}
          </span>

          <h1 className="mt-5 text-4xl leading-[1.1] md:text-[3.25rem]">
            Find your next job.
            <span className="block text-white/60">
              Get ready for the interview.
            </span>
          </h1>

          <p className="mt-5 max-w-xl leading-7 text-white/75">
            Jobs and internships at every level, across tech, sales,
            marketing, finance, healthcare and more, plus free interview
            prep.
          </p>

          <form
            action="/#jobs"
            method="get"
            role="search"
            className="mt-8 flex max-w-xl items-center gap-2 rounded-xl bg-white p-1.5 shadow-lg shadow-black/20"
          >
            <label htmlFor="hero-search" className="sr-only">
              Search jobs and internships
            </label>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5C6B62"
              strokeWidth="2"
              strokeLinecap="round"
              className="ml-3 h-5 w-5 shrink-0"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              id="hero-search"
              name="q"
              type="search"
              placeholder="Job title, skill or company"
              className="min-w-0 flex-1 border-0 bg-transparent px-1 py-2.5 text-ink placeholder:text-[#5C6B62] focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-board px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b3a28]"
            >
              Search
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-sm text-white/60">Popular:</span>
            {popular.map(([label, q]) => (
              <a
                key={q}
                href={`/?q=${encodeURIComponent(q)}#jobs`}
                className="rounded-full border border-white/20 px-3 py-1 text-sm text-white/85 transition hover:bg-white/10"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <aside className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur">
          <p className="px-3 pb-2 pt-2 text-xs font-medium uppercase tracking-wider text-white/60">
            {jobs.length > 0 ? "Latest openings" : "Get started"}
          </p>

          {jobs.length > 0 ? (
            <ul className="space-y-2">
              {jobs.map((j) => (
                <li key={j.slug}>
                  <Link
                    href={`/jobs/${j.slug}`}
                    className="flex items-center gap-3 rounded-xl bg-white p-3 text-ink transition hover:bg-paper"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-board text-sm font-semibold text-white">
                      {j.company.charAt(0)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {j.title}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {j.company}
                        {j.location ? ` · ${j.location}` : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-2">
              {quickLinks.map((q) => {
                const inner = (
                  <>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-board">
                      <Icon d={q.icon} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {q.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {q.text}
                      </span>
                    </span>
                  </>
                );
                const cls =
                  "flex items-center gap-3 rounded-xl bg-white p-3 text-ink transition hover:bg-paper";
                return (
                  <li key={q.href}>
                    {q.external ? (
                      <a
                        href={q.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cls}
                      >
                        {inner}
                      </a>
                    ) : (
                      <Link href={q.href} className={cls}>
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </section>
  );
}
