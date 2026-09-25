import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";

const SITE_URL = "https://job-net-work.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "JobNetWork — Jobs & Internships for Students",
    template: "%s | JobNetWork",
  },
  description:
    "Real internships, part-time and entry-level roles, and placement opportunities across every field — updated in real time.",
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
    href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
    rel="stylesheet"
  />

  <meta
    name="google-adsense-account"
    content="ca-pub-1266008745090944"
  />

  <script
    async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1266008745090944"
    crossOrigin="anonymous"
  />      </head>

      <body className="font-body bg-paper text-ink">
        {children}
        <Footer />
      </body>
    </html>
  );
}
