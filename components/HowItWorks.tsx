import Link from "next/link";

const WHATSAPP_URL = "https://chat.whatsapp.com/L9DG89VrT4V2UFjFkpv0Ok";
const TELEGRAM_URL = "https://t.me/job_net_work";

const linkCls = "text-sm font-semibold text-denim hover:underline";

const steps = [
  {
    n: "01",
    title: "Search",
    text: "Filter by role, job type, work mode and experience level, then open a job for the full details.",
    href: "/jobs",
    cta: "Browse jobs",
  },
  {
    n: "02",
    title: "Match your resume",
    text: "Upload a PDF resume on the match page or from any job card to see how your skills line up with a role.",
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
  return (
    <section className="border-t bg-white px-6 py-16 md:px-12 md:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl">How it works</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          From searching to interview-ready, plus a way to hear about new jobs.
          Browsing, the resume match and the free Prep Trek cards cost nothing.
        </p>

        <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} className="bg-white p-7">
              <span className="text-sm font-semibold tracking-wider text-board">
                {s.n}
              </span>
              <h3 className="mt-3 text-xl">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {s.text}
              </p>
              <Link href={s.href} className={`mt-5 inline-block ${linkCls}`}>
                {s.cta} →
              </Link>
            </li>
          ))}

          <li className="bg-white p-7">
            <span className="text-sm font-semibold tracking-wider text-board">
              04
            </span>
            <h3 className="mt-3 text-xl">Jobs on WhatsApp &amp; Telegram</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              New openings shared in our community.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={linkCls}
              >
                Join on WhatsApp →
              </a>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={linkCls}
              >
                Join on Telegram →
              </a>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
