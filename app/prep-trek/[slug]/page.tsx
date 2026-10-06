import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPrepTrack,
  prepTracks,
  interviewDayChecklist,
} from "@/lib/prep-trek-content";
import PrepChecklist from "@/components/PrepChecklist";

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
        {/* Free PDF download — the same content below, typeset to actually
            study from instead of scrolling a long page */}
        {track.freeDownload && (
          <div className="rounded-xl border-2 border-board bg-paper p-6 pl-8 md:p-8 md:pl-10">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="inline-block rounded-full bg-board px-3 py-1 text-xs font-semibold uppercase tracking-wide text-paper">
                  Free download
                </span>
                <h2 className="mt-3 font-display text-xl md:text-2xl">
                  {track.freeDownload.label}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-ink/70">
                  {track.freeDownload.note}
                </p>
              </div>
              <a
                href={track.freeDownload.url}
                download
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-board px-6 py-3 text-sm font-semibold text-paper transition hover:bg-boardDark"
              >
                Download PDF ↓
              </a>
            </div>

            {track.premium && (
              <div className="mt-5 border-t border-ink/10 pt-5">
                <a
                  href={track.premium.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-semibold text-ink underline decoration-mustard decoration-2 underline-offset-4 hover:text-ink/70"
                >
                  Want the full 44-question pack, or a 1:1 mock review? Book it on Topmate →
                </a>
              </div>
            )}
          </div>
        )}

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
                {qa.code && (
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-board p-4 text-xs leading-5 text-paper">
                    <code>{qa.code}</code>
                  </pre>
                )}
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

        {/* 4-week study roadmap */}
        <div>
          <h2 className="font-display text-2xl">4-week study roadmap</h2>
          <p className="mt-2 text-sm text-ink/60">
            A week-by-week plan, not just a topic list. Check items off as
            you go — your progress is saved on this device.
          </p>

          <div className="mt-6 space-y-6">
            {track.roadmap.map((week) => (
              <div key={week.week} className="pinned-card p-6 pl-8">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-lg text-ink/40">
                    Week {week.week}
                  </span>
                  <h3 className="font-semibold">{week.title}</h3>
                </div>
                <div className="mt-4">
                  <PrepChecklist
                    storageKey={`prep-trek:${track.slug}:week-${week.week}`}
                    items={week.goals}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pre-interview checklist */}
        <div className="rounded-xl border p-6">
          <h2 className="font-display text-2xl">
            Before you walk in: field checklist
          </h2>
          <p className="mt-2 text-sm text-ink/60">
            The field-specific things worth double-checking you've covered.
          </p>
          <div className="mt-5">
            <PrepChecklist
              storageKey={`prep-trek:${track.slug}:checklist`}
              items={track.checklist}
            />
          </div>
        </div>

        {/* Universal interview-day checklist */}
        <div className="rounded-xl border p-6">
          <h2 className="font-display text-2xl">Interview-day checklist</h2>
          <p className="mt-2 text-sm text-ink/60">
            The same basics matter whatever role you're interviewing for.
          </p>
          <div className="mt-5">
            <PrepChecklist
              storageKey="prep-trek:interview-day"
              items={interviewDayChecklist}
            />
          </div>
        </div>

        {/* Free resources */}
        <div>
          <h2 className="font-display text-2xl">Free resources to study from</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {track.resources.map((res) => (
              <a
                key={res.url}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pinned-card block p-5 pl-7 transition hover:-translate-y-0.5"
              >
                <h3 className="font-semibold text-ink">{res.name} ↗</h3>
                <p className="mt-1 text-sm leading-6 text-ink/70">
                  {res.note}
                </p>
              </a>
            ))}
          </div>
        </div>

        {/* Premium teaser — sold outside this app via Topmate, never reproduced here */}
        {track.premium && (
          <div className="rounded-xl bg-board p-7 text-paper md:p-9">
            <span className="inline-block rounded-full bg-mustard px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
              Premium
            </span>
            <h2 className="mt-4 font-display text-2xl md:text-3xl">
              {track.premium.heading}
            </h2>
            <p className="mt-3 max-w-2xl text-paper/80">{track.premium.intro}</p>

            <ul className="mt-6 space-y-2.5">
              {track.premium.bullets.map((bullet, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-6 text-paper/85">
                  <span className="shrink-0 text-mustard">✓</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={track.premium.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-mustard px-5 py-3 text-sm font-semibold text-ink transition hover:brightness-95"
              >
                {track.premium.ctaLabel} →
              </a>
              {track.premium.secondaryCtaLabel && track.premium.secondaryCtaUrl && (
                <a
                  href={track.premium.secondaryCtaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-lg border border-paper/30 px-5 py-3 text-sm font-semibold text-paper transition hover:bg-paper/10"
                >
                  {track.premium.secondaryCtaLabel}
                </a>
              )}
            </div>
          </div>
        )}

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
