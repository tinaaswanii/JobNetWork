import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getJobsPage } from "@/lib/jobs";
import JobsBoard, { LIMIT } from "@/components/JobsBoard";
import { prepTracks } from "@/lib/prep-trek-content";
import { guides } from "@/lib/guides";
import HomeHero from "@/components/HomeHero";
import HowItWorks from "@/components/HowItWorks";
import Faq from "@/components/Faq";

export const revalidate = 300;

const SITE_URL = "https://job-net-work.vercel.app";
const WHATSAPP_URL = "https://chat.whatsapp.com/L9DG89VrT4V2UFjFkpv0Ok";

export const metadata: Metadata = {
  title:
    "JobNetWork — Jobs & Internships in India, From Entry-Level to Experienced",
  description:
    "Find jobs and internships across tech, sales, marketing, finance, healthcare, design and more, from entry-level to experienced roles, updated in real time. Free interview prep and resume match included.",
  keywords: [
    "internships India",
    "jobs for freshers",
    "experienced jobs India",
    "entry level jobs India",
    "campus placements",
    "remote internships",
    "part time jobs",
    "job board India",
    "remote jobs India",
    "internship finder",
    "placement resources",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "JobNetWork",
    title: "JobNetWork — Jobs & Internships in India, Entry-Level to Experienced",
    description:
      "Real jobs and internships across every field and level, updated in real time.",
    images: [{ url: `${SITE_URL}/Logo.png`, width: 512, height: 512 }],
  },
  twitter: {
    card: "summary",
    title: "JobNetWork — Jobs & Internships in India, Entry-Level to Experienced",
    description:
      "Real jobs and internships across every field and level, updated in real time.",
    images: [`${SITE_URL}/Logo.png`],
  },
};

export default async function HomePage() {
  // Match the client's own page size (JobsBoard's LIMIT) — fetching more
  // than that here just means a huge wall of cards on first paint that the
  // client immediately throws away on its first real fetch.
  const initial = await getJobsPage({ limit: LIMIT, offset: 0, sort_by: "newest" }).catch(() => ({
    items: [],
    total: 0,
    limit: LIMIT,
    offset: 0,
    has_more: false,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "JobNetWork",
    url: SITE_URL,
    description:
      "Jobs, internships and placement resources across every field and experience level, updated in real time.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main className="min-h-screen bg-paper">
      {/* Structured data */}
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HomeHero total={initial.total} jobs={initial.items.slice(0, 3)} />

      {/* Jobs */}
      <div id="jobs" className="scroll-mt-16">
        <Suspense fallback={null}>
          <JobsBoard initialJobs={initial.items} />
        </Suspense>
      </div>

      <HowItWorks />

      {/* Prep Trek teaser */}
      <section className="border-t bg-white px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl">Prep Trek: get interview-ready</h2>
              <p className="mt-3 text-muted-foreground">
                Common interview questions with real answers, a short
                learning path, and cold-mail tips, by field.
              </p>
            </div>
            <Link href="/prep-trek" className="text-sm font-semibold text-denim hover:underline">
              See all tracks →
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {prepTracks.slice(0, 3).map((track) => (
              <Link
                key={track.slug}
                href={`/prep-trek/${track.slug}`}
                className="pinned-card block py-6"
              >
                <h3 className="text-lg">{track.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {track.tagline}
                </p>
                <p className="mt-4 text-xs font-medium text-board">
                  {track.commonQuestions.length} questions · {track.roadmap.length}-week roadmap
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Guides teaser (testimonials live on /testimonials) */}
      <section className="border-t px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl">Guides & notes</h2>
              <p className="mt-3 text-muted-foreground">
                Interview prep guides and 1:1 career calls for students and
                freshers, built from a real placement season.
              </p>
            </div>
            <Link href="/guides" className="text-sm font-semibold text-denim hover:underline">
              See all guides →
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {guides
              .filter((g) => g.group === "available")
              .slice(0, 3)
              .map((g) => (
                <Link key={g.title} href="/guides" className="pinned-card flex flex-col py-6">
                  <h3 className="text-lg">{g.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                    {g.blurb}
                  </p>
                  <p className="mt-4 text-sm font-semibold">
                    {g.price}
                    {"originalPrice" in g && g.originalPrice ? (
                      <span className="ml-2 font-normal text-muted-foreground line-through">
                        {g.originalPrice}
                      </span>
                    ) : null}
                  </p>
                </Link>
              ))}
          </div>

          <Link href="/testimonials" className="mt-6 inline-block text-sm font-semibold text-denim hover:underline">
            What people are saying →
          </Link>
        </div>
      </section>

      <Faq />

      {/* WhatsApp Community CTA */}
      <section className="bg-boardDark px-6 py-16 text-white md:px-12 md:py-20">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl">Get jobs directly on WhatsApp</h2>
            <p className="mt-3 leading-7 text-white/75">
              New jobs and internships, from entry-level to experienced
              roles, shared regularly with our community.
            </p>
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-mustard px-6 py-3 text-sm font-semibold text-ink transition hover:brightness-95"
          >
            Join the community →
          </a>
        </div>
      </section>
    </main>
  );
}
