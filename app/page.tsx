import type { Metadata } from "next";
import { pageMetadata, POSITIONING_LINE } from "@/lib/seo";
import Link from "next/link";
import { getJobsPage } from "@/lib/jobs";
import JobCard from "@/components/JobCard";
import LevelTag from "@/components/LevelTag";
import Price from "@/components/Price";
import { prepTracks } from "@/lib/prep-trek-content";
import { guides } from "@/lib/guides";
import HomeHero from "@/components/HomeHero";
import HowItWorks from "@/components/HowItWorks";
import Faq from "@/components/Faq";
import AccessBadge from "@/components/AccessBadge";

export const revalidate = 300;

const SITE_URL = "https://job-net-work.vercel.app";
const WHATSAPP_URL = "https://chat.whatsapp.com/L9DG89VrT4V2UFjFkpv0Ok";

// Jobs shown in the home-page entry point. The full, filterable list is /jobs.
const HOME_JOBS = 6;

export const metadata: Metadata = pageMetadata({
  title: "JobNetWork — Jobs & Internships in India, All Levels",
  absoluteTitle: true,
  description:
    "Find jobs and internships in India across tech, sales, marketing, finance, healthcare and design, from first jobs to senior roles. Free resume match and interview prep.",
  path: "/",
});

export default async function HomePage() {
  // The home page only previews a few jobs; the full list lives at /jobs.
  const initial = await getJobsPage({ limit: HOME_JOBS, offset: 0, sort_by: "newest" }).catch(() => ({
    items: [],
    total: 0,
    limit: HOME_JOBS,
    offset: 0,
    has_more: false,
    sources: { artha: "unavailable" as const },
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "JobNetWork",
        url: SITE_URL,
        logo: `${SITE_URL}/Logo.png`,
        description: POSITIONING_LINE,
        sameAs: [
          "https://www.linkedin.com/company/job-net-work/",
          "https://t.me/job_net_work",
          "https://github.com/tinaaswanii/JobNetWork",
          "https://www.producthunt.com/products/jobnetwork",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "JobNetWork",
        url: SITE_URL,
        description: POSITIONING_LINE,
        inLanguage: "en-IN",
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/jobs?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-paper">
      {/* Structured data */}
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HomeHero total={initial.total} jobs={initial.items.slice(0, 3)} />

      {/* Jobs entry point: a preview, with /jobs as the one canonical listing */}
      <section id="jobs" className="scroll-mt-16 border-t px-6 py-14 md:px-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl">Latest jobs &amp; internships</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {initial.total > 0
              ? `${initial.total.toLocaleString("en-IN")} openings listed. `
              : ""}
            From internships and first jobs to experienced and senior roles.
          </p>

          {initial.items.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {initial.items.slice(0, HOME_JOBS).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          <Link
            href="/jobs"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-board px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Browse all jobs <span aria-hidden="true">&nbsp;→</span>
          </Link>
        </div>
      </section>

      <HowItWorks />

      {/* Prep Trek teaser */}
      <section className="border-t bg-white px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl">Prep Trek: get interview-ready</h2>
              <p className="mt-3 text-sm font-medium text-ink">
                Core cards are free. Some tracks have a premium extension.
              </p>
              <p className="mt-3 text-muted-foreground">
                Common interview questions with real answers, a short
                learning path, and cold-mail tips, by field.
              </p>
            </div>
            <Link href="/prep-trek" className="inline-flex min-h-[44px] items-center text-sm font-semibold text-denim hover:underline">
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
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  <h3 className="text-lg">{track.name}</h3>{" "}
                  <AccessBadge access={track.premium ? "premium" : "free"} />
                </div>
                <p className="mt-2">
                  <LevelTag level={track.level} />
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {track.tagline}
                </p>
                <p className="mt-4 text-xs font-medium text-denim">
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
            <Link href="/guides" className="inline-flex min-h-[44px] items-center text-sm font-semibold text-denim hover:underline">
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
                  <p className="mt-2">
                    <LevelTag level="students" />
                  </p>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                    {g.blurb}
                  </p>
                  <p className="mt-4 text-sm">
                    <Price price={g.price} originalPrice={g.originalPrice} />
                  </p>
                </Link>
              ))}
          </div>

          <Link href="/testimonials" className="mt-4 inline-flex min-h-[44px] items-center text-sm font-semibold text-denim hover:underline">
            What people are saying →
          </Link>
        </div>
      </section>

      <Faq />

      {/* WhatsApp Community CTA */}
      <section className="bg-boardDark px-6 py-16 text-white md:px-12 md:py-20">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl">Get jobs directly on WhatsApp or Telegram</h2>
            <p className="mt-3 leading-7 text-white/75">
              New jobs and internships, from entry-level to experienced
              roles, shared regularly with our community.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-mustard px-6 py-3 text-sm font-semibold text-paper transition hover:brightness-95"
            >
              Join on WhatsApp →
            </a>
            <a
              href="https://t.me/job_net_work"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Join on Telegram →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
