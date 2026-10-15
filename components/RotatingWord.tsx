"use client";

import { useEffect, useState } from "react";

// Cycles a short list of words. Static (first word) for reduced-motion users.
// Screen readers get the full list once, not a flickering word.
export default function RotatingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (words.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let swap: ReturnType<typeof setTimeout> | undefined;
    const tick = setInterval(() => {
      setShow(false);
      swap = setTimeout(() => {
        setI((n) => (n + 1) % words.length);
        setShow(true);
      }, 250);
    }, 2600);
    return () => {
      clearInterval(tick);
      if (swap) clearTimeout(swap);
    };
  }, [words]);

  return (
    <>
      <span className="sr-only">{words.join(", ")}</span>
      <span
        aria-hidden="true"
        className={`inline-block font-semibold text-mustard transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`}
      >
        {words[i]}
      </span>
    </>
  );
}
