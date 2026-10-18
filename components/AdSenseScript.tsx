"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

// Pages that contain a resume upload must never show ads.
const NO_ADS = ["/match"];

export default function AdSenseScript() {
  const pathname = usePathname();
  if (NO_ADS.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;

  return (
    <Script
      id="adsense"
      async
      strategy="afterInteractive"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1266008745090944"
      crossOrigin="anonymous"
    />
  );
}
