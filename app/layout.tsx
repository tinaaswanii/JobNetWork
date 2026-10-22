
import Script from "next/script";
import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import ChatLauncher from "@/components/chat/ChatLauncher";
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
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4GNV3NT58H"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.gtag = function() {
              window.dataLayer.push(arguments);
            };
            window.gtag('js', new Date());
            window.gtag('config', 'G-4GNV3NT58H');
          `}
        </Script>

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-board focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>

        <SiteHeader />

        {children}

        <Footer />
        <ChatLauncher />
        <AdSenseScript />
        <Analytics />
      </body>
    </html>
  );
}
