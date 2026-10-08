"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const WHATSAPP_URL = "https://chat.whatsapp.com/L9DG89VrT4V2UFjFkpv0Ok";

const links = [
  { name: "Jobs", href: "/jobs" },
  { name: "Match resume", href: "/match" },
  { name: "Prep Trek", href: "/prep-trek" },
  { name: "Guides", href: "/guides" },
  { name: "About", href: "/about" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu after navigating.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-6 md:px-12">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Logo.png"
            alt=""
            className="h-8 w-8 rounded-full bg-white object-contain"
          />
          <span className="text-base font-semibold tracking-tight">JobNetWork</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 text-sm md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(pathname, l.href) ? "page" : undefined}
              className={
                isActive(pathname, l.href)
                  ? "font-semibold text-ink"
                  : "text-muted-foreground transition hover:text-ink"
              }
            >
              {l.name}
            </Link>
          ))}
        </nav>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-lg bg-board px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-[#0b3a28] md:inline-flex"
        >
          Join WhatsApp
        </a>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border text-lg md:hidden"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav
          aria-label="Mobile"
          className="border-t bg-white px-6 py-3 md:hidden"
        >
          <div className="flex flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(pathname, l.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-2.5 text-sm ${
                  isActive(pathname, l.href)
                    ? "bg-muted font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {l.name}
              </Link>
            ))}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 rounded-lg bg-board px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              Join WhatsApp community
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
