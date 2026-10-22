import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import CareerChat from "@/components/chat/CareerChat";

export const metadata: Metadata = pageMetadata({
  title: "AI Career Assistant",
  description:
    "Ask our AI assistant to search jobs and internships in India, explain what a job requires, and get general career advice.",
  path: "/assistant",
});

export default function AssistantPage() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-6 py-10 md:py-12">
      <h1 className="font-display text-2xl text-ink md:text-3xl">JobNetWork AI Career Assistant</h1>
      <p className="mt-2 text-sm leading-6 text-ink/70">
        Search the jobs and internships listed on JobNetWork by chatting, and get general career guidance. Job
        details come from our listings; career advice is general guidance.
      </p>
      <div className="mt-6">
        <CareerChat />
      </div>
    </main>
  );
}
