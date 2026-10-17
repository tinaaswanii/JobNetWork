import Link from "next/link";
import type { PublicJob } from "@/lib/types";
import RotatingWord from "@/components/RotatingWord";

// Plain <a> links on purpose: /jobs reads its filters from the URL on page
// load, so these need a real navigation to apply.
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

const rotating = ["first jobs", "next moves", "big leaps", "remote roles", "fresh starts"];

const panel =
  "flex items-center gap-3 rounded-xl border border-white/10 bg-white p-3 text-ink transition hover:border-denim/60 hover:bg-muted";

export default function HomeHero({ total, jobs }: { total: number; jobs: PublicJob[] }) {
  return (
    <section className="relative isolate overflow-hidden bg-boardDark px-6 pb-16 pt-14 text-white md:px-12 md:pb-24 md:pt-20">
      <div aria-hidden="true" className="hero-aurora pointer-events-none absolute inset-x-[-10%] top-[-20%] -z-10 h-[120%]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at 50% 30%, #000 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, #000 20%, transparent 70%)",
        }}
      />

      <div
        className={`relative mx-auto grid max-w-5xl grid-cols-1 gap-12 md:items-center ${jobs.length > 0 ? "md:grid-cols-[1.3fr_1fr]" : ""}`}
      >
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/90">
            <span className="dot-ping h-2 w-2 rounded-full bg-mustard" aria-hidden="true" />
            {total > 0 ? `${total.toLocaleString("en-IN")} openings listed` : "New openings added regularly"}
          </span>

          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.04] tracking-tight md:text-6xl">
            Cast your net.
            <span className="text-gradient block">Land the work.</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-white/85">
            <span className="sr-only">
              Search once and find first jobs, next moves, big leaps, remote roles and fresh starts, at every level,
              across tech, sales, marketing, finance, healthcare and more.
            </span>
            <span aria-hidden="true">
              Search once and find <RotatingWord words={rotating} /> that fit you, at every level, across tech, sales,
              marketing, finance, healthcare and more.
            </span>{" "}
            Free interview prep included.
          </p>

          <form
            action="/jobs"
            method="get"
            role="search"
            aria-label="Search jobs and internships"
            className="mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-white/15 bg-white p-1.5 shadow-[0_20px_60px_-20px_rgba(65,105,241,0.65)] focus-within:border-mustard"
          >
            <label htmlFor="hero-search" className="sr-only">
              Search jobs and internships
            </label>
            <svg viewBox="0 0 24 24" fill="none" stroke="#8295B7" strokeWidth="2" strokeLinecap="round" className="ml-3 h-5 w-5 shrink-0" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              id="hero-search"
              name="q"
              type="search"
              placeholder="Job title, skill or company"
              className="min-w-0 flex-1 border-0 bg-transparent px-1 py-3 text-ink placeholder:text-[#8295B7] focus:outline-none"
            />
            <button
              type="submit"
              className="min-h-[44px] rounded-xl bg-board px-5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Search jobs
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-sm text-white/70">Popular:</span>
            {popular.map(([label, q]) => (
              <a
                key={q}
                href={`/jobs?q=${encodeURIComponent(q)}`}
                className="rounded-full border border-white/25 px-3 py-1.5 text-sm text-white/90 transition hover:border-denim hover:bg-white/10"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {jobs.length > 0 && (
          <aside className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur">
            <p className="px-3 pb-2 pt-2 text-xs font-medium uppercase tracking-wider text-white/70">
              Fresh off the press
            </p>
            <ul className="space-y-2">
              {jobs.map((j) => (
                <li key={j.slug}>
                  <Link href={`/jobs/${j.slug}`} className={panel}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-board text-sm font-semibold text-white">
                      {j.company.charAt(0)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{j.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {j.company}
                        {j.location ? ` · ${j.location}` : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </section>
  );
}
