import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { prepTracks, comingSoonTracks } from "@/lib/prep-trek-content";
import LevelTag from "@/components/LevelTag";
import AccessBadge from "@/components/AccessBadge";

const SITE_URL = "https://job-net-work.vercel.app";

export const metadata: Metadata = pageMetadata({
  title: "Prep Trek — Interview Prep & Study Paths",
  description:
    "Free interview prep by field: common interview questions with real answers, a short learning path, and cold-mail tips — for software engineering, data, sales, marketing, support/ops and design roles.",
  path: "/prep-trek",
  ogDescription:
    "Common interview questions with real answers, a short learning path, and cold-mail tips — organized by field.",
});

export default function PrepTrekIndexPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Prep Trek — Interview Prep & Study Paths",
    url: `${SITE_URL}/prep-trek`,
    description:
      "Interview prep tracks by field: common questions, answers, and learning paths.",
    hasPart: prepTracks.map((t) => ({
      "@type": "WebPage",
      name: t.name,
      url: `${SITE_URL}/prep-trek/${t.slug}`,
    })),
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-paper">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <header className="bg-board text-paper px-6 py-12 md:px-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-display text-4xl md:text-5xl">
            <span aria-hidden="true">🧭</span> Prep Trek
          </h1>

          <p className="mt-4 max-w-2xl text-paper/80">
            Interviews aren't just about knowing your field — they're about
            knowing what you'll be asked. Pick your track for common
            questions with real answers, a short learning path, and what
            actually works in a cold email.
          </p>
        </div>
      </header>

      {/* Founder note — real credibility, not a generic "about us" blurb */}
      <section className="border-b px-6 py-10 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="pinned-card flex flex-col gap-4 p-6 pl-8 md:flex-row md:items-center md:gap-8 md:p-8 md:pl-10">
            <div className="text-4xl" aria-hidden="true">👋</div>
            <p className="text-sm leading-7 text-ink/75 md:text-base">
              <span className="font-semibold text-ink">
                Built by someone who's actually been through it.
              </span>{" "}
              I'm Tina, a BCA graduate who went through placement season and
              ended up with 4 offers (Accenture, Deloitte, Innove8, and
              Cognizant). I built Prep Trek from the same notes and drills I
              used to prepare.{" "}
              <Link
                href="/about"
                className="font-semibold text-denim hover:underline"
              >
                Learn more →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Quick cards: tap-and-try flashcards, not tracks */}
      <section className="mx-auto max-w-5xl px-6 pt-12 md:px-12">
        <h2 className="font-display text-2xl md:text-3xl">Quick cards</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
          Short tap-and-try cards you can work through in one sitting. Free, no
          sign-up.
        </p>
      </section>

      {/* Featured: interactive flashcard page, not a track, so it's called
          out on its own rather than squeezed into the track grid below */}
      <section className="mx-auto max-w-5xl px-6 pt-6 md:px-12">
        <a
          href="/prep-trek/common-questions"
          className="flex flex-col gap-4 rounded-xl border-2 border-board bg-paper p-6 pl-8 transition hover:-translate-y-0.5 md:flex-row md:items-center md:justify-between md:p-8 md:pl-10"
        >
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h2 className="font-display text-xl md:text-2xl">
                <span aria-hidden="true">🎤</span> Interview Questions, Answered Like a Pro
              </h2>{" "}
              <AccessBadge access="free" />
              <span className="inline-block rounded-full bg-board px-3 py-1 text-xs font-semibold uppercase tracking-wide text-paper">
                Interactive
              </span>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-6 text-ink/70">
              7 tappable flashcards with the exact structure to answer the
              questions every interviewer asks — tell me about yourself,
              weaknesses, STAR, and more. Free, no sign-up.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center justify-center rounded-lg bg-board px-6 py-3 text-sm font-semibold text-paper">
            Open flashcards →
          </span>
        </a>
      </section>

      {/* Featured: CS fundamentals as tappable cards, not tracks — same
          interactive format as the flashcards above, one page per subject */}
      <section className="mx-auto max-w-5xl px-6 pt-12 md:px-12">
        <h3 className="font-display text-xl md:text-2xl">
          CS fundamentals, card by card
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink/60">
          A one-line answer, a picture, a quick try-it and the trap for each
          question. About 15 minutes per subject, free, no sign-up.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <a
            href="/prep-trek/dbms"
            className="pinned-card block p-5 pl-7 transition hover:-translate-y-0.5"
          >
            <div className="text-2xl" aria-hidden="true">🗄️</div>
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <h3 className="font-semibold">DBMS</h3>{" "}
              <AccessBadge access="free" />
            </div>
            <p className="mt-2">
              <LevelTag level="freshers" />
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              10 cards — keys, normalization, ACID, joins, indexing
            </p>
          </a>
          <a
            href="/prep-trek/sql"
            className="pinned-card block p-5 pl-7 transition hover:-translate-y-0.5"
          >
            <div className="text-2xl" aria-hidden="true">🧮</div>
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <h3 className="font-semibold">SQL</h3>{" "}
              <AccessBadge access="free" />
            </div>
            <p className="mt-2">
              <LevelTag level="freshers" />
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              10 cards — query order, joins, window functions
            </p>
          </a>
          <a
            href="/prep-trek/computer-networks"
            className="pinned-card block p-5 pl-7 transition hover:-translate-y-0.5"
          >
            <div className="text-2xl" aria-hidden="true">🌐</div>
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <h3 className="font-semibold">Computer Networks</h3>{" "}
              <AccessBadge access="free" />
            </div>
            <p className="mt-2">
              <LevelTag level="freshers" />
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              10 cards — OSI/TCP-IP, DNS, HTTPS, subnetting, ports
            </p>
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12 md:px-12">
        <h2 className="font-display text-2xl md:text-3xl">
          Tracks with roadmaps
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
          Common interview questions with real answers, a short learning path
          with a week-by-week roadmap, and cold-mail tips, by field. Some
          tracks have a premium extension.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {prepTracks.map((track) => (
            <Link
              key={track.slug}
              href={`/prep-trek/${track.slug}`}
              className="pinned-card block p-6 pl-8 transition hover:-translate-y-0.5"
            >
              <div className="text-3xl" aria-hidden="true">{track.emoji}</div>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <h3 className="font-display text-xl">{track.name}</h3>{" "}
                <AccessBadge access={track.premium ? "premium" : "free"} />
              </div>
              <p className="mt-2">
                <LevelTag level={track.level} />
              </p>
              <p className="mt-2 text-sm leading-6 text-ink/70">
                {track.tagline}
              </p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-ink/60">
                {track.commonQuestions.length} questions · {track.roadmap.length}-week roadmap →
              </p>
            </Link>
          ))}

          {/* Not built yet: deliberately not links */}
          {comingSoonTracks.map((t) => (
            <div
              key={t.name}
              className="pinned-card block border-dashed p-6 pl-8"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h3 className="font-display text-xl">{t.name}</h3>{" "}
                <span className="inline-block shrink-0 whitespace-nowrap rounded-full bg-mustard px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-paper">
                  Coming soon
                </span>
              </div>
              <p className="mt-2">
                <LevelTag level={t.level} />
              </p>
              <p className="mt-2 text-sm leading-6 text-ink/70">
                {t.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
