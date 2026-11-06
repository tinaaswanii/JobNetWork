import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import PrepCards from "@/components/PrepCards";
import { aptitudeFreeCards } from "@/lib/prep-cards/aptitude-free";
import { guides } from "@/lib/guides";

export const metadata: Metadata = pageMetadata({
  title: "Aptitude Questions for Placements — Free Interactive Cards",
  description:
    "10 free, tappable aptitude cards: percentages, profit and loss, averages, time and work, speed, counting, probability and reasoning. A one-line answer, a picture, a quick try-it and the common trap for each.",
  path: "/prep-trek/aptitude",
  ogDescription:
    "Learn the aptitude questions that come up most in placement tests, in minutes, with pictures and quick checks.",
});

export default function AptitudePage() {
  const notes = guides.find((g) => g.title === "Aptitude PrepTrek");
  const buyUrl = notes?.url;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: aptitudeFreeCards.map((c) => ({
      "@type": "Question",
      name: c.q,
      acceptedAnswer: { "@type": "Answer", text: c.sayIt },
    })),
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-paper">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b border-ink/10 bg-boardDark px-6 py-8 md:px-12 md:py-10">
        <div className="mx-auto max-w-3xl">
          <Link href="/prep-trek" className="inline-flex min-h-[44px] items-center text-sm text-ink/70 hover:text-ink">
            ← All Prep Trek tracks
          </Link>
          <h1 className="mt-3 font-display text-3xl md:text-4xl">
            <span aria-hidden="true">🧠</span> Aptitude, in 10 cards
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-ink/80">
            No chapters to read. Each card gives you the one-line answer, a
            picture, a quick try-it and the trap interviewers hope you fall
            into. About 15 minutes for all ten.
          </p>
        </div>
      </header>

      <PrepCards cards={aptitudeFreeCards} storageKey="prep-trek-aptitude-free" />

      <section className="mx-auto max-w-3xl px-6 pb-16 md:px-0">
        <div className="pinned-card p-6 pl-8 md:p-8 md:pl-10">
          <h2 className="font-display text-2xl">Want the rest?</h2>
          <span className="mt-3 inline-block rounded-full bg-mustard px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-paper">
            Full Aptitude Notes
          </span>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            The free cards cover the core. The full notes add 14 more cards in
            the same style, plus a one-page formula cheat sheet:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink/75">
            <li>• Last digits of powers, number series, percentage points vs percent change</li>
            <li>• Successive discounts, mixtures, simple vs compound interest, ages</li>
            <li>• Pipes and leaks, trains, boats and streams</li>
            <li>• Circular arrangements, direction sense, syllogisms, mirror letters</li>
            <li>• A one-page formula cheat sheet for the night before</li>
          </ul>

          {buyUrl ? (
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-lg bg-board px-5 py-3 text-sm font-semibold text-paper"
            >
              Get Aptitude Notes on Topmate →
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
