"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PrepCard, Side } from "@/lib/prep-cards/types";

/* ---------- picture types ---------- */

function Chips({ items }: { items: { label: string; note: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {items.map((it, i) => (
          <button
            key={it.label}
            type="button"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              open === i
                ? "border-board bg-board text-paper"
                : "border-ink/20 bg-white text-ink hover:border-board"
            }`}
          >
            {it.label}
          </button>
        ))}
      </div>
      <p className="mt-3 min-h-[3.5rem] rounded-lg bg-paper p-3 text-sm leading-6 text-ink/80">
        {open === null ? "Tap each one to see what it means." : items[open].note}
      </p>
    </div>
  );
}

function Compare({ a, b }: { a: Side; b: Side }) {
  // On phones: tap between the two. On wider screens: both side by side.
  const [side, setSide] = useState<"a" | "b">("a");
  const panel = (s: Side, key: "a" | "b") => (
    <div
      className={`${side === key ? "block" : "hidden"} rounded-lg border border-ink/15 bg-white p-4 sm:block`}
    >
      <p className="font-semibold">{s.title}</p>
      <ul className="mt-2 space-y-1.5 text-sm leading-6 text-ink/80">
        {s.points.map((p) => (
          <li key={p}>• {p}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <div>
      <div className="mb-2 flex gap-2 sm:hidden">
        {(["a", "b"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setSide(k)}
            className={`flex-1 rounded-full border px-3 py-1.5 text-sm font-medium ${
              side === k
                ? "border-board bg-board text-paper"
                : "border-ink/20 bg-white"
            }`}
          >
            {k === "a" ? a.title : b.title}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {panel(a, "a")}
        {panel(b, "b")}
      </div>
    </div>
  );
}

function Steps({ steps }: { steps: { title: string; text: string }[] }) {
  const [n, setN] = useState(1);

  return (
    <div>
      <ol className="space-y-2">
        {steps.slice(0, n).map((s, i) => (
          <li
            key={s.title + i}
            className={`flex gap-3 rounded-lg border p-3 text-sm leading-6 ${
              i === n - 1 ? "border-board bg-white" : "border-ink/10 bg-paper"
            }`}
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-board text-xs font-semibold text-paper">
              {i + 1}
            </span>
            <span>
              <span className="font-semibold">{s.title}</span>{" "}
              <span className="text-ink/75">{s.text}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex gap-2">
        {n < steps.length ? (
          <button
            type="button"
            onClick={() => setN(n + 1)}
            className="rounded-lg bg-board px-4 py-2 text-sm font-semibold text-paper"
          >
            Next step →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setN(1)}
            className="rounded-lg border border-ink/20 bg-white px-4 py-2 text-sm font-semibold"
          >
            Start over
          </button>
        )}
        {n > 1 && n < steps.length && (
          <button
            type="button"
            onClick={() => setN(n - 1)}
            className="rounded-lg border border-ink/20 bg-white px-4 py-2 text-sm"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}

function DataTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-ink/15 bg-white">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead className="bg-board text-paper">
          <tr>
            {head.map((h, i) => (
              <th key={i} scope="col" className="px-3 py-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-ink/10">
              {r.map((cell, j) =>
                j === 0 ? (
                  <th key={j} scope="row" className="px-3 py-2 text-left font-semibold leading-6">
                    {cell}
                  </th>
                ) : (
                  <td key={j} className="px-3 py-2 leading-6 text-ink/80">
                    {cell}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PictureView({ p }: { p: PrepCard["picture"] }) {
  return (
    <div>
      {p.kind === "chips" && <Chips items={p.items} />}
      {p.kind === "compare" && <Compare a={p.a} b={p.b} />}
      {p.kind === "steps" && <Steps steps={p.steps} />}
      {p.kind === "table" && <DataTable head={p.head} rows={p.rows} />}
      {p.code && (
        <pre className="mt-3 overflow-x-auto rounded-lg bg-ink p-3 text-xs leading-5 text-paper">
          <code>{p.code}</code>
        </pre>
      )}
      {p.caption && (
        <p className="mt-3 text-sm italic leading-6 text-ink/75">{p.caption}</p>
      )}
    </div>
  );
}

/* ---------- try it ---------- */

function TryIt({ t }: { t: PrepCard["tryIt"] }) {
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div>
      <p className="text-base font-medium leading-7">{t.prompt}</p>
      <div className="mt-3 grid gap-2">
        {t.options.map((o, i) => {
          let cls = "border-ink/20 bg-white hover:border-board";
          if (picked !== null) {
            if (i === t.correct) cls = "border-green-400 bg-green-500/15";
            else if (i === picked) cls = "border-red-400 bg-red-500/15";
            else cls = "border-ink/10 bg-white opacity-50";
          }
          return (
            <button
              key={o}
              type="button"
              disabled={picked !== null}
              onClick={() => setPicked(i)}
              className={`min-h-[44px] rounded-lg border px-3 py-2 text-left text-base leading-6 transition ${cls}`}
            >
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <p role="status" className="mt-3 text-base leading-7">
          <span className="font-semibold">
            {picked === t.correct ? "Right. " : "Not quite. "}
          </span>
          {t.why}{" "}
          <button
            type="button"
            onClick={() => setPicked(null)}
            className="underline"
          >
            Try again
          </button>
        </p>
      )}
    </div>
  );
}

/* ---------- one card ---------- */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-ink/70">
      {children}
    </p>
  );
}

// One card at a time, one accent colour. The short answer is the only tinted
// block; trap and "say it like this" are plain text with a thin rule.
function CardView({
  card,
  index,
  total,
  done,
}: {
  card: PrepCard;
  index: number;
  total: number;
  done: boolean;
}) {
  return (
    <article id={card.id} className="rounded-2xl border border-ink/15 bg-white p-5 md:p-8">
      <p className="text-sm font-medium text-ink/70">
        Card {index + 1} of {total} · {card.group}
        {done ? " · got it ✓" : ""}
      </p>
      <h2
        id={`${card.id}-title`}
        tabIndex={-1}
        className="mt-2 font-display text-2xl leading-snug outline-none md:text-3xl"
      >
        {card.q}
      </h2>

      <div className="mt-6 border-l-4 border-board bg-board/10 py-3 pl-4 pr-3">
        <Label>Say this first</Label>
        <p className="mt-1 text-lg leading-8">{card.say}</p>
      </div>

      <div className="mt-8">
        <Label>Picture it</Label>
        <div className="mt-3">
          <PictureView p={card.picture} />
        </div>
      </div>

      <div className="mt-8">
        <Label>Try it</Label>
        <div className="mt-3">
          <TryIt t={card.tryIt} />
        </div>
      </div>

      <div className="mt-8 space-y-5 border-t border-ink/15 pt-6">
        <div>
          <Label>Common trap</Label>
          <p className="mt-1 text-base leading-7 text-ink/90">{card.trap}</p>
        </div>
        <div>
          <Label>Say it like this</Label>
          <p className="mt-1 text-base font-medium leading-7">{card.sayIt}</p>
        </div>
      </div>
    </article>
  );
}

/* ---------- the list ---------- */

export default function PrepCards({
  cards,
  storageKey,
}: {
  cards: PrepCard[];
  storageKey: string;
}) {
  const [done, setDone] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  // Remember progress in this browser only (no account needed).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        setDone(parsed.filter((x): x is string => typeof x === "string"));
      }
    } catch {
      /* private mode or blocked storage: progress just won't persist */
    }
    // Deep link: /prep-trek/sql#<card id>
    const i = cards.findIndex((c) => `#${c.id}` === window.location.hash);
    if (i >= 0) setCurrent(i);
  }, [storageKey, cards]);

  const go = useCallback(
    (i: number) => {
      const next = Math.min(cards.length - 1, Math.max(0, i));
      moved.current = true;
      setCurrent(next);
      try {
        window.history.replaceState(null, "", `#${cards[next].id}`);
      } catch {
        /* ignore */
      }
    },
    [cards]
  );

  // After the user moves, bring the new card to the top and focus its heading.
  useEffect(() => {
    if (!moved.current) return;
    const el = topRef.current;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
    }
    document.getElementById(`${cards[current].id}-title`)?.focus({ preventScroll: true });
  }, [current, cards]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === "ArrowRight") go(current + 1);
      else if (e.key === "ArrowLeft") go(current - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, go]);

  function toggle(id: string) {
    setDone((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const card = cards[current];
  const count = cards.filter((c) => done.includes(c.id)).length;
  const pct = Math.round((count / cards.length) * 100);
  const isDone = done.includes(card.id);
  const isLast = current === cards.length - 1;

  return (
    <div ref={topRef}>
      <div className="sticky top-14 z-10 border-b border-ink/10 bg-paper/95 px-6 py-3 backdrop-blur md:px-12">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3">
            <p className="shrink-0 text-sm font-semibold">
              {count} of {cards.length} done
            </p>
            <div
              className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10"
              role="progressbar"
              aria-label="Cards marked as got it"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
            >
              <div className="h-full rounded-full bg-board transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <nav aria-label="Cards" className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
            {cards.map((c, i) => {
              const d = done.includes(c.id);
              const active = i === current;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Card ${i + 1}${d ? ", done" : ""}`}
                  aria-current={active ? "step" : undefined}
                  className={`h-9 min-w-[36px] shrink-0 rounded-full border px-2 text-sm font-semibold transition ${
                    active
                      ? "border-board bg-board text-white"
                      : d
                        ? "border-green-400/60 text-green-300"
                        : "border-ink/20 text-ink/80 hover:border-board"
                  }`}
                >
                  {d && !active ? "✓" : i + 1}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 md:px-0 md:py-8">
        <CardView card={card} index={current} total={cards.length} done={isDone} />

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => go(current - 1)}
            disabled={current === 0}
            className="min-h-[44px] rounded-lg border border-ink/25 px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={() => toggle(card.id)}
            aria-pressed={isDone}
            className={`min-h-[44px] rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              isDone ? "border-green-400 bg-green-500/15 text-green-200" : "border-ink/25 hover:border-board"
            }`}
          >
            {isDone ? "Got it ✓" : "Mark as got it"}
          </button>
          {!isLast ? (
            <button
              type="button"
              onClick={() => {
                if (!isDone) toggle(card.id);
                go(current + 1);
              }}
              className="ml-auto min-h-[44px] rounded-lg bg-board px-5 py-2 text-sm font-semibold text-white"
            >
              {isDone ? "Next card →" : "Got it, next →"}
            </button>
          ) : (
            count === cards.length && (
              <p className="ml-auto font-display text-lg">All {cards.length} done. Nice work.</p>
            )
          )}
        </div>
        <p className="mt-3 hidden text-xs text-ink/60 md:block">Tip: use the ← and → keys to move between cards.</p>
      </div>
    </div>
  );
}
