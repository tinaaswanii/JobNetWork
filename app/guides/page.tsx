import type { Metadata } from "next";
import Link from "next/link";
import { guides, TOPMATE_PROFILE, type Guide } from "@/lib/guides";

const SITE_URL = "https://job-net-work.vercel.app";

export const metadata: Metadata = {
  title: "Guides & Notes — Interview Prep, Notes and Career Calls",
  description:
    "Interview prep guides, subject notes and 1:1 career calls for students and freshers, by the creator of JobNetWork.",
  alternates: { canonical: `${SITE_URL}/guides` },
};

function GuideCard({ g }: { g: Guide }) {
  const live = Boolean(g.url);

  return (
    <div className="pinned-card flex flex-col p-6">
      <div className="flex items-start justify-between gap-2">
        {!live && (
          <span className="rounded-full bg-mustard px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink">
            Coming soon
          </span>
        )}
      </div>

      <h3 className="mt-3 font-display text-xl">{g.title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink/70">{g.blurb}</p>

      {g.includes.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-ink/70">
          {g.includes.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <div className="text-sm">
          <span className="text-lg font-semibold text-ink">{g.price}</span>
          {g.originalPrice && (
            <span className="ml-2 text-ink/40 line-through">
              {g.originalPrice}
            </span>
          )}
        </div>

        {live && (
          <a
            href={g.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-board px-4 py-2 text-sm font-semibold text-paper transition hover:bg-board/90"
          >
            Get it on Topmate →
          </a>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  intro,
  items,
}: {
  title: string;
  intro?: string;
  items: Guide[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 pt-12 md:px-12">
      <h2 className="font-display text-2xl md:text-3xl">{title}</h2>
      {intro && <p className="mt-2 max-w-2xl text-ink/70">{intro}</p>}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {items.map((g) => (
          <GuideCard key={g.title} g={g} />
        ))}
      </div>
    </section>
  );
}

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-paper pb-16">
      <header className="bg-board px-6 py-12 text-paper md:px-12">
        <div className="mx-auto max-w-5xl">
          <Link href="/" className="text-sm text-paper/70 hover:text-paper">
            ← Back to jobs
          </Link>
          <h1 className="mt-4 font-display text-4xl md:text-5xl">
            Guides & Notes
          </h1>
          <p className="mt-4 max-w-2xl text-paper/80">
            Practical preparation material based on my own placement season.
            No fluff. These help you prepare in a structured way, but they are
            not a guarantee of getting a job.
          </p>
          <a
            href={TOPMATE_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-lg bg-paper px-5 py-3 text-sm font-semibold text-ink"
          >
            See everything on Topmate →
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-10 md:px-12">
        <Link
          href="/prep-trek/common-questions.html"
          className="block rounded-xl border-2 border-board p-6 transition hover:-translate-y-0.5"
        >
          <span className="inline-block rounded-full bg-board px-3 py-1 text-xs font-semibold uppercase tracking-wide text-paper">
            Free
          </span>
          <h2 className="mt-3 font-display text-xl md:text-2xl">
            Start with the free interview questions
          </h2>
          <p className="mt-2 text-sm text-ink/70">
            7 free flashcards with sample answers. Like them? The full guide is
            below.
          </p>
        </Link>
      </section>

      <Section
        title="Available now"
        items={guides.filter((g) => g.group === "available")}
      />
      <Section
        title="Coming next: subject notes"
        intro="Core CS notes for technical rounds, launching in this order."
        items={guides.filter((g) => g.group === "next")}
      />
      <Section
        title="Then: career guides"
        items={guides.filter((g) => g.group === "career")}
      />

      <section className="mx-auto max-w-5xl px-6 pt-12 md:px-12">
        <Link
          href="/testimonials"
          className="text-sm font-semibold text-ink hover:text-ink/70"
        >
          See what the community says →
        </Link>
      </section>
    </main>
  );
}
