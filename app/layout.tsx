
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4GNV3NT58H"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'G-4GNV3NT58H');
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
        <AdSenseScript />
        <Analytics />
      </body>
    </html>
  );
}
