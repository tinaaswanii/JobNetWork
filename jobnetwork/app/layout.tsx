import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobNetWork — jobs & internships for students",
  description: "Real internships, part-time and entry-level roles, updated in real time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-paper text-ink">{children}</body>
    </html>
  );
}
