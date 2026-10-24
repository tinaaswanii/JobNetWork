import type { Metadata } from "next";
import Link from "next/link";
import PrepCards from "@/components/PrepCards";
import { cnFreeCards } from "@/lib/prep-cards/cn-free";
import { guides } from "@/lib/guides";

const SITE_URL = "https://job-net-work.vercel.app";

export const metadata: Metadata = {
  title: "Computer Networks Interview Questions — Free Interactive Cards",
  description:
    "10 free, tappable computer networks interview cards: OSI vs TCP/IP, TCP vs UDP, the 3-way handshake, subnetting, DNS, HTTP vs HTTPS and what happens when you type a URL. A one-line answer, a picture, a quick try-it and the common trap for each.",
  alternates: { canonical: `${SITE_URL}/prep-trek/computer-networks` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/prep-trek/computer-networks`,
    siteName: "JobNetWork",
    title: "Computer Networks Interview Questions — Free Interactive Cards | JobNetWork",
    description:
      "Learn the networking interview questions that come up most, in minutes, with pictures and quick checks.",
  },
};

export default function ComputerNetworksPage() {
  const notes = guides.find((g) => g.title === "Computer Networks PrepTrek");
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
      {/* eslint-disable-next-line react/no-danger */}
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
            Computer Networks, in 10 cards
          </h1>
          <p className="mt-4 max-w-xl text-paper/80">
            No chapters to read. Each card gives you the one-line answer, a
            picture, a quick try-it and the trap interviewers hope you fall
            into. About 15 minutes for all ten.
          </p>
        </div>
      </header>

      <PrepCards cards={cnFreeCards} storageKey="prep-trek-cn-free" />

      <section className="mx-auto max-w-3xl px-6 pb-16 md:px-0">
        <div className="pinned-card py-6 md:py-8">
          <span className="inline-block rounded-full bg-mustard px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink">
            Full Computer Networks notes
          </span>
          <h2 className="mt-3 font-display text-2xl">Want the rest?</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            The free cards cover the core. The full notes add 14 more cards in
            the same style, plus practice scenarios and rapid-fire answers:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink/75">
            <li>• Hub vs switch vs router, ports, NAT, DHCP, ARP</li>
            <li>• TCP closing, flow vs congestion control, routing protocols, IPv6</li>
            <li>• HTTP/2 and HTTP/3, cookies vs sessions, TLS handshake, ping and traceroute</li>
            <li>• 13 practice scenarios with worked answers, including subnetting</li>
            <li>• 18 rapid-fire one-line answers</li>
          </ul>

          {buyUrl ? (
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-lg bg-board px-5 py-3 text-sm font-semibold text-paper"
            >
              Get Computer Networks PrepTrek on Topmate →
            </a>
          ) : (
            <Link
              href="/guides"
              className="mt-5 inline-flex rounded-lg bg-board px-5 py-3 text-sm font-semibold text-paper"
            >
              See guides and what's coming →
            </Link>
          )}
          <p className="mt-3 text-xs text-ink/50">
            A prep aid, not a guarantee of a job.
          </p>
        </div>
      </section>
    </main>
  );
}
