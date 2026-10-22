"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// The chat code is only downloaded the first time someone opens the panel.
const CareerChat = dynamic(() => import("./CareerChat"), {
  ssr: false,
  loading: () => <p className="p-4 text-sm text-ink/70">Loading assistant…</p>,
});

/** Floating "Ask AI" button on every page. The panel stays mounted once opened, so the conversation survives navigation. */
export default function ChatLauncher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    // Put the cursor in the message box once the panel (and its lazy chunk) is ready.
    const timers = [80, 400, 1200].map((ms) =>
      window.setTimeout(() => {
        const el = document.getElementById("chat-input");
        if (el && document.activeElement?.id !== "chat-input" && !document.activeElement?.closest("#chat-panel")) el.focus();
      }, ms)
    );
    return () => {
      document.removeEventListener("keydown", onKey);
      timers.forEach(window.clearTimeout);
    };
  }, [open]);

  // The full-page assistant has its own chat; don't show two.
  if (pathname.startsWith("/assistant")) return null;

  return (
    <>
      {everOpened && (
        <section
          id="chat-panel"
          role="dialog"
          aria-label="JobNetWork AI Career Assistant"
          className={`${open ? "flex" : "hidden"} fixed inset-x-3 bottom-20 z-40 h-[min(34rem,calc(100dvh-6.5rem))] flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl sm:inset-x-auto sm:right-4 sm:w-[26rem]`}
        >
          <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
            <p className="text-sm font-semibold text-ink">AI Career Assistant</p>
            <div className="flex items-center gap-1">
              <Link href="/assistant" className="flex min-h-[44px] items-center px-2 text-xs text-denim hover:underline md:min-h-[36px]">
                Full page
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  button.current?.focus();
                }}
                aria-label="Close assistant"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-ink hover:bg-muted md:h-9 md:w-9"
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 3l10 10M13 3L3 13" />
                </svg>
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1">
            <CareerChat variant="panel" />
          </div>
        </section>
      )}
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={everOpened ? "chat-panel" : undefined}
        onClick={() => {
          setEverOpened(true);
          setOpen((o) => !o);
        }}
        className="fixed bottom-4 right-4 z-40 flex min-h-[48px] items-center gap-2 rounded-full bg-board px-5 text-sm font-semibold text-white shadow-lg hover:bg-boardDark focus-visible:outline-offset-2"
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
        </svg>
        {open ? "Close chat" : "Ask AI"}
      </button>
    </>
  );
}
