import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import Link from "@/components/site/AppLink";
import PrepCards from "@/components/site/PrepCards";
import { cnFreeCards } from "@/lib/prep-cards/cn-free";
import { guides } from "@/lib/guides";

function ComputerNetworksPage() {
  const notes = guides.find((g) => g.title === "Computer Networks Notes");
  const buyUrl = notes?.url;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: cnFreeCards.map((c) => ({
      "@type": "Question",
      name: c.q,
      acceptedAnswer: { "@type": "Answer", text: c.sayIt },
    })),
  };

  return (
    <main className="min-h-screen bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="bg-board px-6 py-12 text-paper md:px-12">
        <div className="mx-auto max-w-3xl">
          <Link href="/prep-trek" className="text-sm text-paper/70 hover:text-paper">
            ← All Prep Trek tracks
          </Link>
          <h1 className="mt-4 font-display text-4xl md:text-5xl">
            🌐 Computer Networks, in 10 cards
          </h1>
          <p className="mt-4 max-w-xl text-paper/80">
            No chapters to read. Each card gives you the one-line answer, a picture, a quick try-it
            and the trap interviewers hope you fall into. About 15 minutes for all ten.
          </p>
        </div>
      </header>

      <PrepCards cards={cnFreeCards} storageKey="prep-trek-cn-free" />

      <section className="mx-auto max-w-3xl px-6 pb-16 md:px-0">
        <div className="pinned-card p-6 pl-8 md:p-8 md:pl-10">
          <span className="inline-block rounded-full bg-mustard px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink">
            Full Computer Networks Notes
          </span>
          <h2 className="mt-3 font-display text-2xl">Want the rest?</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            The free cards cover the basics. The full notes go deeper into the questions that
            actually come up in interviews:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink/75">
            <li>• Routing protocols, NAT edge cases and firewalls</li>
            <li>• Congestion control, flow control and error detection</li>
            <li>• IPv4 vs IPv6, ARP, and the full subnetting toolkit</li>
            <li>• More common interview questions, rapid-fire style</li>
          </ul>

          {buyUrl ? (
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-lg bg-board px-5 py-3 text-sm font-semibold text-paper"
            >
              Get Computer Networks Notes on Topmate →
            </a>
          ) : (
            <Link
              href="/guides"
              className="mt-5 inline-flex rounded-lg bg-board px-5 py-3 text-sm font-semibold text-paper"
            >
              See guides and what's coming →
            </Link>
          )}
          <p className="mt-3 text-xs text-ink/50">A prep aid, not a guarantee of a job.</p>
        </div>
      </section>
    </main>
  );
}

export const Route = createFileRoute("/_site/prep-trek/computer-networks")({
  head: () =>
    pageHead({
      title: "Computer Networks Interview Questions — Free Interactive Cards",
      description:
        "10 free, tappable Computer Networks interview cards: OSI vs TCP/IP, TCP vs UDP, the handshake, subnetting, DNS, HTTPS, common ports, and routers vs switches. A one-line answer, a picture, a quick try-it and the common trap for each.",
      path: "/prep-trek/computer-networks",
      ogTitle: "Computer Networks Interview Questions — Free Interactive Cards | JobNetWork",
      ogDescription:
        "Learn the 10 most-asked Computer Networks interview questions in minutes, with pictures and quick checks.",
    }),
  component: ComputerNetworksPage,
});
