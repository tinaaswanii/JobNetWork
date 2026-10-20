import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

// The match page is a client component, so its metadata lives in this layout.
export const metadata: Metadata = pageMetadata({
  title: "Resume Match — See How Your Skills Fit a Job | JobNetWork",
  absoluteTitle: true,
  description:
    "Upload a PDF resume and see how your skills line up with a job. A guide, not a verdict.",
  path: "/match",
});

export default function MatchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
