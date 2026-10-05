"use client";

import { useEffect, useState } from "react";

// Lightweight, per-browser progress tracking for a Prep Trek checklist.
// Nothing here is synced anywhere — it's a convenience for the person
// working through their own prep, stored only in their own browser.
export default function PrepChecklist({
  storageKey,
  items,
}: {
  storageKey: string;
  items: string[];
}) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved) && saved.length === items.length) {
          setChecked(saved);
        }
      }
    } catch {
      // localStorage can be unavailable (private mode, blocked) — just
      // fall back to an unchecked, non-persistent checklist.
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(checked));
    } catch {
      /* ignore */
    }
  }, [checked, loaded, storageKey]);

  const doneCount = checked.filter(Boolean).length;
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  function toggle(i: number) {
    setChecked((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full bg-mustard transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium text-ink/60">
          {doneCount}/{items.length} done
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {items.map((item, i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 -mx-2 hover:bg-ink/5">
              <input
                type="checkbox"
                checked={checked[i] ?? false}
                onChange={() => toggle(i)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-board"
              />
              <span
                className={`text-sm leading-6 ${
                  checked[i] ? "text-ink/40 line-through" : "text-ink/80"
                }`}
              >
                {item}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
