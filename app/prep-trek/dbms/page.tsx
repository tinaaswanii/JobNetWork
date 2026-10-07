import type { Metadata } from "next";
import Link from "next/link";
import PrepCards from "@/components/PrepCards";
import { dbmsFreeCards } from "@/lib/prep-cards/dbms-free";
import { guides } from "@/lib/guides";

const SITE_URL = "https://job-net-work.vercel.app";

export const metadata: Metadata = {
  title: "DBMS Interview Questions — Free Interactive Cards",
  description:
    "10 free, tappable DBMS interview cards: keys, normalization, ACID, joins, indexing, SQL vs NoSQL. A one-line answer, a picture, a quick try-it and the common trap for each.",
  alternates: { canonical: `${SITE_URL}/prep-trek/dbms` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/prep-trek/dbms`,
    siteName: "JobNetWork",
    title: "DBMS Interview Questions — Free Interactive Cards | JobNetWork",
    description:
      "Learn the 10 most-asked DBMS interview questions in minutes, with pictures and quick checks.",
  },
};

export default function DbmsPage() {
  const notes = guides.find((g) => g.title === "DBMS Notes");
  const buyUrl = notes?.url;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dbmsFreeCards.map((c) => ({
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
          <Link
            href="/prep-trek"
            className="text-sm text-paper/70 hover:text-paper"
          >
            ← All Prep Trek tracks
          </Link>
          <h1 className="mt-4 font-display text-4xl md:text-5xl">
            🗄️ DBMS, in 10 cards
          </h1>
          <p className="mt-4 max-w-xl text-paper/80">
            No chapters to read. Each card gives you the one-line answer, a
            picture, a quick try-it and the trap interviewers hope you fall
            into. About 15 minutes for all ten.
          </p>
        </div>
      </header>

      <PrepCards cards={dbmsFreeCards} storageKey="prep-trek-dbms-free" />

      <section className="mx-auto max-w-3xl px-6 pb-16 md:px-0">
        <div className="pinned-card p-6 pl-8 md:p-8 md:pl-10">
          <span className="inline-block rounded-full bg-mustard px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink">
            Full DBMS Notes
          </span>
          <h2 className="mt-3 font-display text-2xl">Want the rest?</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            The free cards cover the basics. The full notes add 21 more cards
            in the same style, plus SQL practice and rapid-fire answers:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink/75">
            <li>• ER model, cardinality, BCNF and denormalization</li>
            <li>
              • Transaction states, isolation levels, deadlocks and MVCC
            </li>
            <li>• Clustered indexes, B-trees, views, triggers and NULLs</li>
            <li>• 8 SQL interview queries with answers</li>
            <li>• 20 rapid-fire one-line answers</li>
          </ul>

          {buyUrl ? (
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-lg bg-board px-5 py-3 text-sm font-semibold text-paper"
            >
              Get DBMS Notes on Topmate →
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
