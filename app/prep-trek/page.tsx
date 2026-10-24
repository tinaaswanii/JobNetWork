import type { Metadata } from "next";
import Link from "next/link";
import {
  prepTracks,
  interviewDayChecklist,
  levelLabel,
} from "@/lib/prep-trek-content";
import { guides } from "@/lib/guides";
import { dbmsFreeCards } from "@/lib/prep-cards/dbms-free";
import { sqlFreeCards } from "@/lib/prep-cards/sql-free";
import { cnFreeCards } from "@/lib/prep-cards/cn-free";

const SITE_URL = "https://job-net-work.vercel.app";

export const metadata: Metadata = {
  title: "Prep Trek — Interview Prep & Study Paths",
  description:
    "Free interview prep by field: common interview questions with real answers, a short learning path, and cold-mail tips — for software engineering, data, sales, marketing, support/ops and design roles.",
  alternates: { canonical: `${SITE_URL}/prep-trek` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/prep-trek`,
    siteName: "JobNetWork",
    title: "Prep Trek — Interview Prep & Study Paths | JobNetWork",
    description:
      "Common interview questions with real answers, a short learning path, and cold-mail tips — organized by field.",
  },
};

// Grid helper: when a row would end with a single orphan card on the 2-column
// layout, stretch that last card across the row so the grid never looks like a
// box is missing. Resets on 3 columns, where the counts here divide evenly.
const fillLastRow =
  "sm:[&:last-child:nth-child(odd)]:col-span-2 lg:[&:last-child:nth-child(odd)]:col-span-1";

// The three card-based subject pages. Counts and paid-notes info come from the
// data files so this page can't drift out of sync with them.
const subjects = [
  {
    href: "/prep-trek/dbms",
    name: "DBMS in 10 cards",
    text: "Keys, normalization, ACID, joins, indexing.",
    topics: ["Keys & normalization", "ACID & transactions", "Indexing & joins", "SQL vs NoSQL"],
    free: dbmsFreeCards.length,
    guide: guides.find((g) => g.title === "DBMS PrepTrek"),
  },
  {
    href: "/prep-trek/sql",
    name: "SQL in 10 cards",
    text: "Query order, GROUP BY, joins, window functions, CTEs.",
    topics: ["Query execution order", "Joins & GROUP BY", "Window functions", "CTEs"],
    free: sqlFreeCards.length,
    guide: guides.find((g) => g.title === "SQL PrepTrek"),
  },
  {
    href: "/prep-trek/computer-networks",
    name: "Computer Networks in 10 cards",
    text: "OSI vs TCP/IP, TCP vs UDP, subnetting, DNS, HTTP and HTTPS.",
    topics: ["OSI vs TCP/IP", "TCP vs UDP", "Subnetting & DNS", "HTTP vs HTTPS"],
    free: cnFreeCards.length,
    guide: guides.find((g) => g.title === "Computer Networks PrepTrek"),
  },
];

const comingNext = guides.filter((g) => g.group === "next");

export default function PrepTrekIndexPage() {
  const totalQuestions = prepTracks.reduce((n, t) => n + t.commonQuestions.length, 0);
  const totalCards = subjects.reduce((n, s) => n + s.free, 0);
  const stats = [
    { value: String(prepTracks.length + subjects.length), label: "prep tracks" },
    { value: `${totalQuestions}+`, label: "interview Q&As" },
    { value: String(totalCards), label: "tap-and-try cards" },
    { value: "₹0", label: "to start, no sign-up" },
  ];

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
    <main className="min-h-screen bg-paper">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <header className="bg-board text-paper px-6 py-12 md:px-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-display text-4xl md:text-5xl">Prep Trek</h1>

          <p className="mt-4 max-w-2xl text-paper/80">
            Interviews aren't just about knowing your field — they're about
            knowing what you'll be asked. Pick your track for common
            questions with real answers, a short learning path, and what
            actually works in a cold email.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-3 md:max-w-2xl md:grid-cols-4">
            {stats.map((st) => (
              <div key={st.label} className="rounded-xl border border-paper/15 bg-paper/5 px-4 py-3">
                <dt className="sr-only">{st.label}</dt>
                <dd className="font-display text-2xl">{st.value}</dd>
                <p className="text-xs text-paper/70">{st.label}</p>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* Founder note — real credibility, not a generic "about us" blurb */}
      <section className="border-b px-6 py-10 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="pinned-card flex flex-col gap-4 p-6 md:flex-row md:items-center md:gap-8 md:p-8">
            <p className="text-sm leading-7 text-ink/75 md:text-base">
              <span className="font-semibold text-ink">
                Built by someone who's actually been through it.
              </span>{" "}
              I'm Tina — a BCA graduate who went into placement season with
              the same last-minute panic Prep Trek exists to fix. I ended up
              with 4 offers (Accenture, Deloitte, Innove8, and Cognizant) and
              got my resume shortlisted at Google and Amazon. These are the
              same notes and drills I actually used to prepare — I'm a job
              seeker too, not a career coach writing from the outside.
            </p>
          </div>
        </div>
      </section>

      {/* How to use Prep Trek */}
      <section className="mx-auto max-w-5xl px-6 pt-12 md:px-12">
        <h2 className="font-display text-2xl">How to use Prep Trek</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            { n: "01", t: "Pick your track", d: "Start with the subject or role you're being interviewed for. Don't try to cover everything." },
            { n: "02", t: "Tap, try, repeat", d: "Each card gives a one-line answer, a picture, a quick check and the trap to avoid. About 15 minutes for ten." },
            { n: "03", t: "Go deeper when ready", d: "The free cards cover the core. Full notes add more cards, practice questions and rapid-fire answers." },
          ].map((st) => (
            <li key={st.n} className="pinned-card h-full py-5">
              <span className="text-xs font-semibold tracking-wider text-board">{st.n}</span>
              <h3 className="mt-2 font-display text-lg">{st.t}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/70">{st.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Featured: interactive flashcard page, not a track, so it's called
          out on its own rather than squeezed into the track grid below */}
      <section className="mx-auto max-w-5xl px-6 pt-12 md:px-12">
        <a
          href="/prep-trek/common-questions.html"
          className="flex flex-col gap-4 rounded-xl border-2 border-board bg-paper p-6 transition hover:-translate-y-0.5 md:flex-row md:items-center md:justify-between md:p-8"
        >
          <div>
            <span className="inline-block rounded-full bg-board px-3 py-1 text-xs font-semibold uppercase tracking-wide text-paper">
              Interactive
            </span>
            <h2 className="mt-3 font-display text-xl md:text-2xl">
              Interview Questions, Answered Like a Pro
            </h2>
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

      {/* Subject cards: short, tappable interview cards by subject */}
      <section className="mx-auto max-w-5xl px-6 pt-12 md:px-12">
        <h2 className="font-display text-2xl">Core CS subjects, as tappable cards</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/70">
          The questions that keep coming up in technical rounds, one card at a time.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`flex h-full flex-col rounded-xl border border-ink/20 bg-white p-6 transition hover:-translate-y-0.5 ${fillLastRow}`}
            >
              <span className="inline-block self-start rounded-full bg-mustard px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
                Free · {s.free} cards
              </span>
              <h3 className="mt-3 font-display text-xl">{s.name}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/70">{s.text}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {s.topics.map((t) => (
                  <li key={t} className="rounded-full border border-ink/15 px-2.5 py-1 text-xs text-ink/70">
                    {t}
                  </li>
                ))}
              </ul>
              {s.guide?.url && (
                <p className="mt-4 rounded-lg bg-paper px-3 py-2 text-xs leading-5 text-ink/70">
                  <span className="font-semibold text-ink">Full notes {s.guide.price}:</span>{" "}
                  {s.guide.blurb}
                </p>
              )}
              <p className="mt-auto pt-4 text-sm font-semibold text-denim">Start free →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pt-12 md:px-12">
        <h2 className="font-display text-2xl">Interview prep by role</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/70">
          Common questions with real answers, a study roadmap and cold-mail tips for the field you're applying in.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {prepTracks.map((track) => (
            <Link
              key={track.slug}
              href={`/prep-trek/${track.slug}`}
              className={`pinned-card flex h-full flex-col p-6 transition hover:-translate-y-0.5 ${fillLastRow}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-3xl">{track.emoji}</div>
                {track.premium && (
                  <span className="rounded-full bg-mustard px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink">
                    Premium available
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-display text-xl">{track.name}</h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-board">
                {levelLabel[track.level]}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink/70">{track.tagline}</p>
              {track.commonQuestions[0] && (
                <p className="mt-3 border-l-2 border-board/50 pl-3 text-xs italic leading-5 text-ink/60">
                  e.g. “{track.commonQuestions[0].question}”
                </p>
              )}
              <p className="mt-auto pt-4 text-xs font-medium uppercase tracking-wide text-ink/50">
                {track.commonQuestions.length} questions · {track.roadmap.length}-week roadmap →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Shared checklist: useful whatever the track */}
      <section className="mx-auto max-w-5xl px-6 pt-12 md:px-12">
        <div className="pinned-card p-6 md:p-8">
          <h2 className="font-display text-2xl">Before any interview</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/70">
            Whatever your track, these six things make the difference between calm and chaos on the day.
          </p>
          <ul className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
            {interviewDayChecklist.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-6 text-ink/75">
                <span aria-hidden="true" className="mt-0.5 text-board">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Honest "coming next" strip, drawn from the guides roadmap */}
      {comingNext.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pt-12 md:px-12">
          <h2 className="font-display text-2xl">Coming next</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {comingNext.map((g) => (
              <li key={g.title} className="rounded-full border border-dashed border-ink/30 px-4 py-2 text-sm text-ink/70">
                <span aria-hidden="true">{g.emoji}</span> {g.title}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Paid full guide on Topmate */}
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-12 md:px-12">
        <div className="pinned-card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="font-display text-xl md:text-2xl">
              Want the full Interview Prep Trek Guide?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-ink/70">
              The complete PDF with all the questions, technical revision
              points and HR guidance. Not a guarantee of a job, but a
              structured way to prepare.
            </p>
          </div>
          <a
            href="https://topmate.io/getyourjob/2334509?utm_source=public_profile&utm_campaign=getyourjob"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-board px-6 py-3 text-sm font-semibold text-paper"
          >
            Get it on Topmate →
          </a>
        </div>
        <Link
          href="/guides"
          className="mt-4 inline-block text-sm font-semibold text-ink hover:text-ink/70"
        >
          More guides and notes →
        </Link>
      </section>
    </main>
  );
}
