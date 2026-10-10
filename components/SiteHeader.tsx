"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/auth/client";

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
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  // Reflect auth state client-side so public pages stay statically cacheable.
  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(!!session?.user)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

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

        <div className="hidden items-center gap-3 md:flex">
          {signedIn ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-ink">
                Dashboard
              </Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className="text-sm font-medium text-muted-foreground hover:text-ink">
                  Log out
                </button>
              </form>
            </>
          ) : signedIn === false ? (
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-ink">
              Log in
            </Link>
          ) : null}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-lg bg-board px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-[#0b3a28]"
          >
            Join WhatsApp
          </a>
        </div>

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
            {signedIn ? (
              <>
                <Link href="/dashboard" className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground">Dashboard</Link>
                <form action="/auth/signout" method="post">
                  <button type="submit" className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-muted-foreground">Log out</button>
                </form>
              </>
            ) : signedIn === false ? (
              <Link href="/login" className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground">Log in</Link>
            ) : null}
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
