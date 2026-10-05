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
