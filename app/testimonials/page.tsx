import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";

export const metadata: Metadata = pageMetadata({
  title: "Testimonials — Community Feedback",
  description:
    "Feedback from people who use the JobNetWork community and Prep Trek.",
  path: "/testimonials",
});

export default function TestimonialsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-paper">
      <header className="bg-board px-6 py-12 text-paper md:px-12">
        <div className="mx-auto max-w-5xl">
          <Link href="/jobs" className="inline-flex min-h-[44px] items-center text-sm text-paper/70 hover:text-paper">
            ← Back to jobs
          </Link>
          <h1 className="mt-4 font-display text-4xl md:text-5xl">
            Testimonials
          </h1>
          <p className="mt-4 max-w-2xl text-paper/80">
            What people in the JobNetWork community have said.
          </p>
        </div>
      </header>

      <Testimonials />
    </main>
  );
}
