const faqs = [
  {
    q: "Is JobNetWork free?",
    a: "Yes. Browsing jobs, the resume match and the free Prep Trek cards cost nothing. The paid guides on Topmate are optional.",
  },
  {
    q: "Who is it for?",
    a: "Anyone looking for work. Listings run from internships and entry-level roles to experienced and senior positions, so use the experience filter to narrow them down. The paid 1:1 calls and guides on Topmate are aimed at students and freshers.",
  },
  {
    q: "Where do the jobs come from?",
    a: "From partner job feeds plus listings we add ourselves, so you see openings from many companies in one place. The Apply button on each card takes you to the application page.",
  },
  {
    q: "How does the resume match work?",
    a: "Upload a PDF resume (under 5 MB) from any job card and see how its skills line up with that job. Treat it as a guide, not a verdict.",
  },
  {
    q: "How do I get new jobs without checking the site?",
    a: "Join our WhatsApp community or Telegram channel, or sign up for email alerts under the job list.",
  },
];

export default function Faq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section className="border-t px-6 py-16 md:px-12 md:py-20">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl md:text-4xl">
          Questions, answered
        </h2>

        <div className="mt-8 divide-y rounded-2xl border bg-white">
          {faqs.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                {f.q}
                <span
                  aria-hidden="true"
                  className="text-xl text-muted-foreground transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
