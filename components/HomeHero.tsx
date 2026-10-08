import Link from "next/link";

const WHATSAPP_URL = "https://chat.whatsapp.com/L9DG89VrT4V2UFjFkpv0Ok";

// label shown, search word used. Plain <a> links (not <Link>) on purpose:
// the board reads its filters from the URL when the page loads, so these
// need a real page load to apply.
const popular: [string, string][] = [
  ["Internships", "intern"],
  ["Developer", "developer"],
  ["Data & analytics", "analyst"],
  ["Marketing", "marketing"],
  ["Sales", "sales"],
  ["Support", "support"],
  ["Design", "designer"],
];

export default function HomeHero({ total }: { total: number }) {
  return (
    <section className="bg-board px-6 pb-16 pt-12 text-paper md:px-12 md:pb-20 md:pt-16">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1.4fr_1fr] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-mustard md:text-sm">
            For students, freshers and early-career job seekers
          </p>

          <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
            Find your first job. Get ready for the interview.
          </h1>

          <p className="mt-4 max-w-xl leading-7 text-paper/80">
            Internships, entry-level jobs and placement opportunities across
            tech, sales, marketing, finance, healthcare and more, plus free
            interview prep, all in one place.
          </p>

          <form
            action="/#jobs"
            method="get"
            role="search"
            className="mt-7 flex max-w-xl flex-col gap-2 sm:flex-row"
          >
            <label htmlFor="hero-search" className="sr-only">
              Search jobs and internships
            </label>
            <input
              id="hero-search"
              name="q"
              type="search"
              placeholder="Try “developer”, “marketing” or “intern”"
              className="min-w-0 flex-1 rounded-lg border-0 bg-paper px-4 py-3 text-ink placeholder:text-ink/50"
            />
            <button
              type="submit"
              className="rounded-lg bg-mustard px-6 py-3 font-semibold text-ink transition hover:opacity-90"
            >
              Search jobs
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-sm text-paper/60">Popular:</span>
            {popular.map(([label, q]) => (
              <a
                key={q}
                href={`/?q=${encodeURIComponent(q)}#jobs`}
                className="rounded-full border border-paper/25 px-3 py-1 text-sm text-paper/90 transition hover:bg-paper/10"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <aside className="pinned-card p-6 pl-9 text-ink">
          {total > 0 ? (
            <div>
              <p className="font-display text-4xl">
                {total.toLocaleString("en-IN")}
              </p>
              <p className="text-sm text-ink/60">openings listed right now</p>
            </div>
          ) : (
            <p className="font-display text-2xl">
              New openings, added regularly
            </p>
          )}

          <ul className="mt-5 space-y-4 border-t border-ink/10 pt-5 text-sm">
            <li>
              <Link
                href="/match"
                className="font-semibold text-denim hover:underline"
              >
                Match your resume to a job →
              </Link>
              <span className="mt-0.5 block text-ink/60">
                See how your skills line up with a role.
              </span>
            </li>
            <li>
              <Link
                href="/prep-trek"
                className="font-semibold text-denim hover:underline"
              >
                Free interview cards →
              </Link>
              <span className="mt-0.5 block text-ink/60">
                Quick tap-and-try prep, by subject.
              </span>
            </li>
            <li>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-denim hover:underline"
              >
                Get jobs on WhatsApp →
              </a>
              <span className="mt-0.5 block text-ink/60">
                New openings shared in our community.
              </span>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
