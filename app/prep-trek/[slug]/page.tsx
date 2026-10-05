import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrepTrack, prepTracks } from "@/lib/prep-trek-content";

const SITE_URL = "https://job-net-work.vercel.app";

export function generateStaticParams() {
  return prepTracks.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const track = getPrepTrack(params.slug);
  if (!track) return {};

  const title = `${track.name} Interview Prep & Study Path`;
  const description = `${track.overview.slice(0, 150)}${
    track.overview.length > 150 ? "..." : ""
  }`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/prep-trek/${track.slug}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/prep-trek/${track.slug}`,
      siteName: "JobNetWork",
      title: `${title} | Prep Trek`,
      description,
    },
    twitter: {
      card: "summary",
      title: `${title} | Prep Trek`,
      description,
    },
  };
}

export default function PrepTrackPage({
  params,
}: {
  params: { slug: string };
}) {
  const track = getPrepTrack(params.slug);
  if (!track) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: track.commonQuestions.map((qa) => ({
      "@type": "Question",
      name: qa.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: qa.answer,
      },
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
          <Link href="/prep-trek" className="text-sm text-paper/70 hover:text-paper">
            ← All Prep Trek tracks
          </Link>

          <h1 className="mt-3 font-display text-4xl md:text-5xl">
            {track.emoji} {track.name}
          </h1>

          <p className="mt-4 max-w-2xl text-paper/80">{track.overview}</p>
        </div>
      </header>

      <section className="mx-auto max-w-4xl space-y-12 px-6 py-12 md:px-12">
        {/* Common questions */}
        <div>
          <h2 className="font-display text-2xl">Common interview questions</h2>
          <p className="mt-2 text-sm text-ink/60">
            Not exact questions you'll be asked — but the shape of what gets
            asked, and how a strong answer is structured.
          </p>

          <div className="mt-6 space-y-4">
            {track.commonQuestions.map((qa, i) => (
              <div key={i} className="pinned-card p-6 pl-8">
                <h3 className="font-semibold text-ink">{qa.question}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/70">
                  {qa.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Learning path */}
        <div>
          <h2 className="font-display text-2xl">Your learning path</h2>
          <p className="mt-2 text-sm text-ink/60">
            In order — each step builds on the last.
          </p>

          <ol className="mt-6 space-y-4">
            {track.learningPath.map((step, i) => (
              <li key={i} className="flex gap-4 rounded-xl border p-5">
                <div className="font-display text-xl text-ink/30">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink/70">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Cold mail tips */}
        <div className="pinned-card p-6 pl-8">
          <h2 className="font-display text-2xl">Cold mail tips for this field</h2>
          <ul className="mt-4 space-y-2">
            {track.coldMailTips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm leading-6 text-ink/75">
                <span className="text-ink/30">—</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA back to jobs */}
        <div className="border-t border-ink/10 pt-8 text-center">
          <p className="font-display text-xl">Ready to put this to use?</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center rounded-lg bg-board px-5 py-3 text-sm font-semibold text-paper transition hover:bg-boardDark"
          >
            Browse open roles →
          </Link>
        </div>
      </section>
    </main>
  );
}
