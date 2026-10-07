import type { Metadata } from "next";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";

const SITE_URL = "https://job-net-work.vercel.app";

export const metadata: Metadata = {
  title: "Testimonials — What the JobNetWork Community Says",
  description:
    "Feedback from students and freshers who use the JobNetWork community and Prep Trek.",
  alternates: { canonical: `${SITE_URL}/testimonials` },
};

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="bg-board px-6 py-12 text-paper md:px-12">
        <div className="mx-auto max-w-5xl">
          <Link href="/" className="text-sm text-paper/70 hover:text-paper">
            ← Back to jobs
          </Link>
          <h1 className="mt-4 font-display text-4xl md:text-5xl">
            💬 Testimonials
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
