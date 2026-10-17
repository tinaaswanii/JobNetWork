import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import SiteHeader from "@/components/SiteHeader";
import AdSenseScript from "@/components/AdSenseScript";

export const metadata: Metadata = {
  metadataBase: new URL("https://job-net-work.vercel.app"),
  title: {
    default: "JobNetWork — Jobs & Internships in India, All Levels",
    template: "%s | JobNetWork",
  },
  description:
    "Find jobs and internships in India across tech, sales, marketing, finance, healthcare and design, from first jobs to senior roles. Free resume match and interview prep.",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    siteName: "JobNetWork",
  },
  twitter: {
    card: "summary",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossOrigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />

  <meta
    name="google-adsense-account"
    content="ca-pub-1266008745090944"
  />

      </head>

      <body className="font-body antialiased bg-paper text-ink">
        <SiteHeader />
        {children}
        <Footer />
        <AdSenseScript />
        <Analytics />
      </body>
    </html>
  );
}
