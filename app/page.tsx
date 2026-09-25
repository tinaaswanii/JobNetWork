import type { Metadata } from "next";
import { getJobsPage } from "@/lib/jobs";
import JobsBoard from "@/components/JobsBoard";

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
      {/* Structured data */}
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
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
            students, freshers and recent graduates — across tech, sales,
            marketing, finance, healthcare and more — all in one place,
            updated in real time.
          </p>
        </div>
      </header>

      {/* Jobs */}
      <JobsBoard initialJobs={initial.items} />

      {/* Why JobNetWork */}
      <section className="border-t px-6 py-16 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl">
              Why JobNetWork?
            </h2>

            <p className="mt-3 text-muted-foreground">
              Finding jobs and internships can get scattered across different
              websites, company pages and online communities. We’re building
              JobNetWork to make that process a little simpler.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border p-6">
              <div className="text-2xl">🔎</div>

              <h3 className="mt-4 font-semibold">
                Find opportunities in one place
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Browse jobs, internships and fresher opportunities without
                having to search through multiple places.
              </p>
            </div>

            <div className="rounded-xl border p-6">
              <div className="text-2xl">📲</div>

              <h3 className="mt-4 font-semibold">
                Get new opportunities on WhatsApp
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Join our community to receive newly shared opportunities
                directly in your WhatsApp.
              </p>
            </div>

            <div className="rounded-xl border p-6">
              <div className="text-2xl">🎓</div>

              <h3 className="mt-4 font-semibold">
                Built for students & freshers
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                We focus on opportunities that are relevant to students,
                recent graduates and people starting their careers.
              </p>
            </div>
          </div>
        </div>
      </section>

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
