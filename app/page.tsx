import type { Metadata } from "next";
import { getJobsPage } from "@/lib/jobs";
import JobsBoard from "@/components/JobsBoard";

// Re-fetch the server-rendered first page at most every 5 minutes, so
// search engine crawlers and first-time visitors always see recent,
// real job content in the initial HTML instead of a stale or empty shell.
export const revalidate = 300;

const SITE_URL = "https://job-net-work.vercel.app";

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
    "resume match",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "JobNetWork",
    title: "JobNetWork — Internships, Jobs & Placements for Students",
    description:
      "Real internships, entry-level and placement opportunities across every field, updated in real time — plus a free AI resume-match tool.",
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
  const initial = await getJobsPage({ limit: 50, offset: 0 }).catch(() => ({
    items: [],
    total: 0,
    limit: 50,
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
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="bg-board text-paper px-6 py-10 md:px-12">
        <div className="max-w-5xl mx-auto flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <img
              src="/Logo.png"
              alt="JobNetWork logo"
              className="w-20 h-20 object-contain rounded-full bg-white"
            />
            <h1 className="font-display text-3xl md:text-4xl">
              JobNetWork — Internships & Jobs for Students and Freshers
            </h1>
          </div>

          <p className="text-paper/80 max-w-md">
            Internships, entry-level jobs, and placement opportunities for
            students, working professionals and recent grads — across tech,
            sales, marketing, finance, healthcare and more — all in one
            place, updated in real time.
          </p>
        </div>
      </header>

      <JobsBoard initialJobs={initial.items} />
    </main>
  );
}
