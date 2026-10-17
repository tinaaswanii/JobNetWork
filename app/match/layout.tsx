import type { Metadata } from "next";

// The match page is a client component, so its metadata lives in this layout.
export const metadata: Metadata = {
  // `absolute` so the root title template does not append the brand twice.
  title: { absolute: "Resume Match — See How Your Skills Fit a Job | JobNetWork" },
  description:
    "Upload a PDF resume and see how your skills line up with a job. A guide, not a verdict.",
  alternates: { canonical: "/match" },
  openGraph: {
    type: "website",
    url: "/match",
    siteName: "JobNetWork",
    title: "Resume Match — See How Your Skills Fit a Job | JobNetWork",
    description:
      "Upload a PDF resume and see how your skills line up with a job. A guide, not a verdict.",
  },
};

export default function MatchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
