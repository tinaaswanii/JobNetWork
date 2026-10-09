import type { Metadata } from "next";
import Link from "next/link";
import PrepCards from "@/components/PrepCards";
import { sqlFreeCards } from "@/lib/prep-cards/sql-free";
import { guides } from "@/lib/guides";

const SITE_URL = "https://job-net-work.vercel.app";

export const metadata: Metadata = {
  title: "SQL Interview Questions — Free Interactive Cards",
  description:
    "10 free, tappable SQL interview cards: query order, GROUP BY, CASE, joins, window functions and CTEs. A one-line answer, a picture, a quick try-it and the common trap for each.",
  alternates: { canonical: `${SITE_URL}/prep-trek/sql` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/prep-trek/sql`,
    siteName: "JobNetWork",
    title: "SQL Interview Questions — Free Interactive Cards | JobNetWork",
    description:
      "Learn the SQL interview questions that come up most, in minutes, with pictures and quick checks.",
  },
};

export default function SqlPage() {
  const notes = guides.find((g) => g.title === "SQL PrepTrek");
  const buyUrl = notes?.url;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: sqlFreeCards.map((c) => ({
      "@type": "Question",
      name: c.q,
      acceptedAnswer: { "@type": "Answer", text: c.sayIt },
    })),
  };

  return (
    <main className="min-h-screen bg-paper">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="bg-board px-6 py-12 text-paper md:px-12">
        <div className="mx-auto max-w-3xl">
          <Link href="/prep-trek" className="text-sm text-paper/70 hover:text-paper">
            ← All Prep Trek tracks
          </Link>
          <h1 className="mt-4 font-display text-4xl md:text-5xl">
            🧮 SQL, in 10 cards
          </h1>
          <p className="mt-4 max-w-xl text-paper/80">
            No chapters to read. Each card gives you the one-line answer, a
            picture, a quick try-it and the trap interviewers hope you fall
            into. About 15 minutes for all ten.
          </p>
        </div>
      </header>

      <PrepCards cards={sqlFreeCards} storageKey="prep-trek-sql-free" />

      <section className="mx-auto max-w-3xl px-6 pb-16 md:px-0">
        <div className="pinned-card p-6 pl-8 md:p-8 md:pl-10">
          <span className="inline-block rounded-full bg-mustard px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink">
            Full SQL Notes
          </span>
          <h2 className="mt-3 font-display text-2xl">Want the rest?</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            The free cards cover the core. The full notes add 14 more cards in
            the same style, plus practice queries and rapid-fire answers:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink/75">
            <li>• ON vs WHERE in joins, EXISTS vs IN, INTERSECT and EXCEPT</li>
            <li>• LAG and LEAD, running totals, top N per group, Nth highest</li>
            <li>• Recursive CTEs, COALESCE, date ranges, duplicates, safe updates</li>
            <li>• 15 SQL interview queries with answers</li>
            <li>• 17 rapid-fire one-line answers</li>
          </ul>

          {buyUrl ? (
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-lg bg-board px-5 py-3 text-sm font-semibold text-paper"
            >
              Get SQL Notes on Topmate →
            </a>
          ) : (
            <Link
              href="/guides"
              className="mt-5 inline-flex rounded-lg bg-board px-5 py-3 text-sm font-semibold text-paper"
            >
              See guides and what's coming →
            </Link>
          )}
          <p className="mt-3 text-xs text-ink/50">
            A prep aid, not a guarantee of a job.
          </p>
        </div>
      </section>
    </main>
  );
}
