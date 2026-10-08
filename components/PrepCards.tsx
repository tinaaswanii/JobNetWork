"use client";

import { useEffect, useState } from "react";
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
              <th key={i} className="px-3 py-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-ink/10">
              {r.map((cell, j) => (
                <td
                  key={j}
                  className={`px-3 py-2 leading-6 ${j === 0 ? "font-semibold" : "text-ink/80"}`}
                >
                  {cell}
                </td>
              ))}
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
        <p className="mt-3 text-sm italic leading-6 text-ink/65">{p.caption}</p>
      )}
    </div>
  );
}

/* ---------- try it ---------- */

function TryIt({ t }: { t: PrepCard["tryIt"] }) {
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div>
      <p className="text-sm font-medium leading-6">{t.prompt}</p>
      <div className="mt-3 grid gap-2">
        {t.options.map((o, i) => {
          let cls = "border-ink/20 bg-white hover:border-board";
          if (picked !== null) {
            if (i === t.correct) cls = "border-green-600 bg-green-50";
            else if (i === picked) cls = "border-red-500 bg-red-50";
            else cls = "border-ink/10 bg-white opacity-60";
          }
          return (
            <button
              key={o}
              type="button"
              disabled={picked !== null}
              onClick={() => setPicked(i)}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${cls}`}
            >
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <p role="status" className="mt-3 text-sm leading-6">
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
    <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
      {children}
    </p>
  );
}

function CardView({
  card,
  index,
  total,
  done,
  onToggle,
}: {
  card: PrepCard;
  index: number;
  total: number;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      id={card.id}
      className={`pinned-card p-5 pl-8 md:p-7 md:pl-10 ${done ? "border-green-600/60" : ""}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-ink/45">
        {index + 1} of {total} · {card.group}
      </p>
      <h2 className="mt-1 font-display text-xl md:text-2xl">{card.q}</h2>

      <div className="mt-4 rounded-lg bg-board p-4 text-paper">
        <p className="text-xs font-semibold uppercase tracking-wide text-paper/70">
          Say this first
        </p>
        <p className="mt-1 font-medium leading-6">{card.say}</p>
      </div>

      <div className="mt-5">
        <Label>Picture it</Label>
        <div className="mt-2">
          <PictureView p={card.picture} />
        </div>
      </div>

      <div className="mt-5">
        <Label>Try it</Label>
        <div className="mt-2">
          <TryIt t={card.tryIt} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-r-lg border-l-4 border-mustard bg-mustard/15 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">
            Common trap
          </p>
          <p className="mt-1 text-sm leading-6">{card.trap}</p>
        </div>
        <div className="rounded-r-lg border-l-4 border-board bg-board/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">
            Say it like this
          </p>
          <p className="mt-1 text-sm font-medium leading-6">{card.sayIt}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-pressed={done}
        className={`mt-5 rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
          done
            ? "border-green-600 bg-green-600 text-white"
            : "border-ink/25 bg-white hover:border-board"
        }`}
      >
        {done ? "Got it ✓" : "Mark as got it"}
      </button>
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
  }, [storageKey]);

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

  const count = cards.filter((c) => done.includes(c.id)).length;
  const pct = Math.round((count / cards.length) * 100);

  return (
    <div>
      <div className="sticky top-14 z-10 border-b bg-paper/95 px-6 py-3 backdrop-blur md:px-12">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <p className="shrink-0 text-sm font-semibold">
            {count} of {cards.length} done
          </p>
          <div
            className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <div
              className="h-full rounded-full bg-board transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-6 py-8 md:px-0">
        {cards.map((card, i) => (
          <CardView
            key={card.id}
            card={card}
            index={i}
            total={cards.length}
            done={done.includes(card.id)}
            onToggle={() => toggle(card.id)}
          />
        ))}
        {count === cards.length && (
          <p className="text-center font-display text-xl">
            All {cards.length} done. Nice work.
          </p>
        )}
      </div>
    </div>
  );
}
