import Link from "next/link";

const steps = [
  {
    n: "1",
    title: "Search",
    text: "Filter by role, job type, work mode and experience level, then open a job for the full details.",
    href: "#jobs",
    cta: "Browse jobs",
  },
  {
    n: "2",
    title: "Match your resume",
    text: "Upload a PDF resume from any job card to see how your skills line up with that role.",
    href: "/match",
    cta: "Try the match",
  },
  {
    n: "3",
    title: "Prepare",
    text: "Practise the questions interviewers actually ask, with short tap-and-try cards.",
    href: "/prep-trek",
    cta: "Open Prep Trek",
  },
];

export default function HowItWorks() {
  return (
    <section className="border-t px-6 py-16 md:px-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-3xl md:text-4xl">How it works</h2>
        <p className="mt-3 max-w-2xl text-ink/70">
          Three steps from searching to interview-ready. Free to use.
        </p>

        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="pinned-card p-6 pl-9">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-board font-display text-lg text-paper">
                {s.n}
              </span>
              <h3 className="mt-4 font-display text-xl">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/70">{s.text}</p>
              {s.href.startsWith("#") ? (
                <a
                  href={s.href}
                  className="mt-4 inline-block text-sm font-semibold text-denim hover:underline"
                >
                  {s.cta} →
                </a>
              ) : (
                <Link
                  href={s.href}
                  className="mt-4 inline-block text-sm font-semibold text-denim hover:underline"
                >
                  {s.cta} →
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
