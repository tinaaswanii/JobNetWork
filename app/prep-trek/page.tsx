import type { Metadata } from "next";
import Link from "next/link";
import { prepTracks } from "@/lib/prep-trek-content";

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
    <main className="min-h-screen bg-paper">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <header className="bg-board text-paper px-6 py-12 md:px-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-display text-4xl md:text-5xl">🧭 Prep Trek</h1>

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
            <div className="text-4xl">👋</div>
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

      {/* Featured: interactive flashcard page, not a track, so it's called
          out on its own rather than squeezed into the track grid below */}
      <section className="mx-auto max-w-5xl px-6 pt-12 md:px-12">
        <a
          href="/prep-trek/common-questions.html"
          className="flex flex-col gap-4 rounded-xl border-2 border-board bg-paper p-6 pl-8 transition hover:-translate-y-0.5 md:flex-row md:items-center md:justify-between md:p-8 md:pl-10"
        >
          <div>
            <span className="inline-block rounded-full bg-board px-3 py-1 text-xs font-semibold uppercase tracking-wide text-paper">
              Interactive
            </span>
            <h2 className="mt-3 font-display text-xl md:text-2xl">
              🎤 Interview Questions, Answered Like a Pro
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

      <section className="mx-auto max-w-5xl px-6 py-12 md:px-12">
        <div className="grid gap-5 md:grid-cols-2">
          {prepTracks.map((track) => (
            <Link
              key={track.slug}
              href={`/prep-trek/${track.slug}`}
              className="pinned-card block p-6 pl-8 transition hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-3xl">{track.emoji}</div>
                {track.premium && (
                  <span className="rounded-full bg-mustard px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink">
                    Premium available
                  </span>
                )}
              </div>
              <h2 className="mt-3 font-display text-xl">{track.name}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/70">
                {track.tagline}
              </p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-ink/40">
                {track.commonQuestions.length} questions · {track.roadmap.length}-week roadmap →
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
