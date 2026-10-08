import Link from "next/link";

const steps = [
  {
    n: "01",
    title: "Search",
    text: "Filter by role, job type, work mode and experience level, then open a job for the full details.",
    href: "#jobs",
    cta: "Browse jobs",
  },
  {
    n: "02",
    title: "Match your resume",
    text: "Upload a PDF resume from any job card to see how your skills line up with that role.",
    href: "/match",
    cta: "Try the match",
  },
  {
    n: "03",
    title: "Prepare",
    text: "Practise the questions interviewers actually ask, with short tap-and-try cards.",
    href: "/prep-trek",
    cta: "Open Prep Trek",
  },
];

export default function HowItWorks() {
  const cls = "mt-5 inline-block text-sm font-semibold text-denim hover:underline";
  return (
    <section className="border-t bg-white px-6 py-16 md:px-12 md:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl">How it works</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Three steps from searching to interview-ready. Free to use.
        </p>

        <ol className="mt-10 grid overflow-hidden rounded-2xl border md:grid-cols-3 md:divide-x">
          {steps.map((s) => (
            <li key={s.n} className="border-b p-7 last:border-b-0 md:border-b-0">
              <span className="text-sm font-semibold tracking-wider text-board">
                {s.n}
              </span>
              <h3 className="mt-3 text-xl">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {s.text}
              </p>
              {s.href.startsWith("#") ? (
                <a href={s.href} className={cls}>
                  {s.cta} →
                </a>
              ) : (
                <Link href={s.href} className={cls}>
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
