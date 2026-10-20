import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { guides, TOPMATE_PROFILE, type Guide } from "@/lib/guides";
import LevelTag from "@/components/LevelTag";
import Price from "@/components/Price";

const WHATSAPP_URL = "https://chat.whatsapp.com/L9DG89VrT4V2UFjFkpv0Ok";

export const metadata: Metadata = pageMetadata({
  title: "Guides & Notes — Interview Prep, Notes and Career Calls",
  description:
    "Interview prep guides, subject notes and 1:1 career calls for students and freshers, by the creator of JobNetWork.",
  path: "/guides",
});

function GuideCard({ g }: { g: Guide }) {
  const live = Boolean(g.url);

  return (
    <div className="pinned-card flex flex-col p-6">
      <h3 className="font-display text-xl">{g.title}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <LevelTag level="students" />
        {!live && (
          <span className="rounded-full bg-mustard px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-paper">
            Coming soon
          </span>
        )}
      </div>
      <p className="mt-2 text-sm leading-6 text-ink/70">{g.blurb}</p>
      {g.differentiator && (
        <p className="mt-2 text-sm font-medium leading-6 text-ink">{g.differentiator}</p>
      )}

      {g.includes.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-ink/70">
          {g.includes.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <Price
          price={g.price}
          originalPrice={g.originalPrice}
          className="text-sm [&>span:nth-of-type(2)]:text-lg"
        />

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

// One compact list: titles only, no prices (those can change before launch).
function ComingSoon({ items }: { items: Guide[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 pt-12 md:px-12">
      <h2 className="font-display text-2xl md:text-3xl">Coming soon</h2>
      <p className="mt-2 max-w-2xl text-sm text-ink/70">
        On the way, in no fixed order.{" "}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-denim hover:underline"
        >
          Get notified in our WhatsApp community →
        </a>
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((g) => (
          <li
            key={g.title}
            className="rounded-lg border border-dashed border-ink/25 px-4 py-2.5 text-sm text-ink"
          >
            {g.title}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function GuidesPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-paper pb-16">
      <header className="bg-board px-6 py-12 text-paper md:px-12">
        <div className="mx-auto max-w-5xl">
          <Link href="/jobs" className="inline-flex min-h-[44px] items-center text-sm text-paper/70 hover:text-paper">
            ← Back to jobs
          </Link>
          <h1 className="mt-4 font-display text-4xl md:text-5xl">
            Guides & Notes
          </h1>
          <p className="mt-4 max-w-2xl text-paper/80">
            Interview prep guides, subject notes and 1:1 career calls for
            students and freshers. Experienced? The jobs board, resume match
            and free Prep Trek tools are built for you too, and
            experienced-level guides are coming soon.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-paper/70">
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
          href="/prep-trek/common-questions"
          className="block rounded-xl border-2 border-board p-6 transition hover:-translate-y-0.5"
        >
          <h2 className="font-display text-xl md:text-2xl">
            Start with the free interview questions
          </h2>
          <span className="mt-3 inline-block rounded-full bg-board px-3 py-1 text-xs font-semibold uppercase tracking-wide text-paper">
            Free
          </span>
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
      <ComingSoon items={guides.filter((g) => g.group !== "available")} />

      <section className="mx-auto max-w-5xl px-6 pt-12 md:px-12">
        <Link
          href="/testimonials"
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-ink hover:text-ink/70"
        >
          See what the community says →
        </Link>
      </section>
    </main>
  );
}
