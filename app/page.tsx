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
    "JobNetWork — Internships, Jobs & Placements for Students & Freshers in India",
  description:
    "Find internships, entry-level jobs, and placement opportunities across tech, sales, marketing, finance, healthcare, design and more — updated in real time for students, freshers, and recent graduates in India.",
  keywords: [
    "internships India",
    "jobs for freshers",
    "student jobs",
    "entry level jobs India",
    "campus placements",
    "remote internships",
    "part time jobs students",
    "job board India",
    "fresher hiring 2026",
    "internship finder",
    "placement resources",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "JobNetWork",
    title: "JobNetWork — Internships, Jobs & Placements for Students",
    description:
      "Real internships, entry-level and placement opportunities across every field, updated in real time for students and freshers.",
    images: [{ url: `${SITE_URL}/Logo.png`, width: 512, height: 512 }],
  },
  twitter: {
    card: "summary",
    title: "JobNetWork — Internships, Jobs & Placements for Students",
    description:
      "Real internships and entry-level opportunities across every field, updated in real time.",
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
      "Internships, jobs and placement resources for students, freshers and recent graduates across every field, updated in real time.",
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

      <HomeHero total={initial.total} />

      {/* Jobs */}
      <div id="jobs" className="scroll-mt-16">
        <Suspense fallback={null}>
          <JobsBoard initialJobs={initial.items} />
        </Suspense>
      </div>

      <HowItWorks />

      {/* Prep Trek teaser */}
      <section className="border-t px-6 py-16 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl md:text-4xl">
                🧭 Prep Trek — get interview-ready
              </h2>
              <p className="mt-3 text-muted-foreground">
                Common interview questions with real answers, a short
                learning path, and cold-mail tips — by field.
              </p>
            </div>
            <Link
              href="/prep-trek"
              className="text-sm font-semibold text-ink hover:text-ink/70"
            >
              See all tracks →
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {prepTracks.slice(0, 3).map((track) => (
              <Link
                key={track.slug}
                href={`/prep-trek/${track.slug}`}
                className="pinned-card block p-5 pl-7 transition hover:-translate-y-0.5"
              >
                <div className="text-2xl">{track.emoji}</div>
                <h3 className="mt-3 font-semibold">{track.name}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/70">
                  {track.tagline}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Guides teaser (testimonials now live on /testimonials) */}
      <section className="border-t px-6 py-16 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl md:text-4xl">
                📚 Guides & Notes
              </h2>
              <p className="mt-3 text-muted-foreground">
                Interview prep guides and 1:1 career calls, built from a real
                placement season.
              </p>
            </div>
            <Link
              href="/guides"
              className="text-sm font-semibold text-ink hover:text-ink/70"
            >
              See all guides →
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {guides
              .filter((g) => g.group === "available")
              .slice(0, 3)
              .map((g) => (
                <Link
                  key={g.title}
                  href="/guides"
                  className="pinned-card block p-5 pl-7 transition hover:-translate-y-0.5"
                >
                  <div className="text-2xl">{g.emoji}</div>
                  <h3 className="mt-3 font-semibold">{g.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/70">
                    {g.blurb}
                  </p>
                  <p className="mt-3 text-sm font-semibold">{g.price}</p>
                </Link>
              ))}
          </div>

          <Link
            href="/testimonials"
            className="mt-6 inline-block text-sm font-semibold text-ink hover:text-ink/70"
          >
            What people are saying →
          </Link>
        </div>
      </section>

      <Faq />

      {/* WhatsApp Community CTA */}
      <section className="px-6 pb-16 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="pinned-card rounded-xl p-7 pl-10 md:p-10 md:pl-12">
            <div className="max-w-2xl">
              <div className="text-3xl">📲</div>

              <h2 className="mt-4 font-display text-3xl md:text-4xl">
                Get Jobs Directly on WhatsApp
              </h2>

              <p className="mt-4 leading-7 text-ink/70">
                New opportunities are regularly shared with our community.
                Join us to receive jobs, internships and fresher opportunities
                directly on WhatsApp.
              </p>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center rounded-lg border border-[#25D366] bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1da851]"
              >
                Join WhatsApp Community →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
