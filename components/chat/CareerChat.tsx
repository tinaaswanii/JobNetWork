"use client";

import { useEffect, useRef, useState } from "react";

type Job = {
  slug: string;
  title: string;
  company: string;
  location: string | null;
  jobType: string | null;
  experience: string | null;
  salary: string | null;
  posted: string | null;
  skills: string[];
  url: string;
};
type Msg = { id: number; role: "user" | "assistant"; content: string; jobs?: Job[] };

// "send" prompts are complete questions. "fill" prompts need the visitor's own
// details first, so they pre-fill the box instead of sending something vague.
const SUGGESTIONS: { label: string; text: string; mode: "send" | "fill" }[] = [
  { label: "Find remote internships", text: "Find remote internships in India.", mode: "send" },
  { label: "Find entry-level jobs for freshers", text: "Find entry-level jobs for freshers in India.", mode: "send" },
  { label: "Find jobs matching my skills", text: "Find jobs matching my skills. My skills are: ", mode: "fill" },
  { label: "Explain a job's requirements", text: "Find a few jobs for this role and explain what they require: ", mode: "fill" },
  { label: "Help me plan my career", text: "Help me plan my career. I am currently ", mode: "fill" },
];

const MAX_LEN = 1000;
let nextId = 1;

export default function CareerChat({ variant = "page" }: { variant?: "page" | "panel" }) {
  const panel = variant === "panel";
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, loading, error]);

  async function request(history: Msg[]) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.success) {
        setError(body?.error?.message ?? "Something went wrong. Please try again.");
        return;
      }
      setMessages((m) => [
        ...m,
        { id: nextId++, role: "assistant", content: body.data.reply, jobs: body.data.jobs ?? [] },
      ]);
    } catch {
      setError("Could not reach the assistant. Check your connection and try again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function send(text: string) {
    const content = text.trim().slice(0, MAX_LEN);
    if (!content || loading) return;
    const next = [...messages, { id: nextId++, role: "user" as const, content }];
    setMessages(next);
    setInput("");
    void request(next);
  }

  function pick(s: (typeof SUGGESTIONS)[number]) {
    if (s.mode === "send") return send(s.text);
    setInput(s.text);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    });
  }

  return (
    <div className={panel ? "flex h-full min-h-0 flex-col bg-white" : "flex flex-col rounded-xl border bg-white"}>
      <div
        role="log"
        aria-live="polite"
        aria-label="Conversation with the JobNetWork AI Career Assistant"
        className={`space-y-4 overflow-y-auto p-4 md:p-5 ${panel ? "min-h-0 flex-1" : "max-h-[60vh] min-h-[320px]"}`}
      >
        <Bubble role="assistant">
          <p>
            Hi! I&apos;m the JobNetWork AI Career Assistant. I can search the jobs and internships listed on
            JobNetWork, explain what a job asks for, and give general career advice, such as which entry-level roles
            suit your skills, what to learn next and how to prepare for interviews.
          </p>
          <p className="mt-2 text-ink/70">
            I haven&apos;t seen your resume or profile, so tell me about your skills if you want tailored ideas.
          </p>
        </Bubble>

        {messages.map((m) => (
          <Bubble key={m.id} role={m.role}>
            <p className="whitespace-pre-wrap">{m.content}</p>
            {m.jobs && m.jobs.length > 0 && <JobList jobs={m.jobs} />}
          </Bubble>
        ))}

        {loading && (
          <Bubble role="assistant">
            <p className="flex items-center gap-2 text-ink/70" role="status">
              <span aria-hidden="true" className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-board [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-board [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-board" />
              </span>
              Searching and thinking…
            </p>
          </Bubble>
        )}

        {error && (
          <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void request(messages)}
              disabled={loading || messages.length === 0}
              className="mt-2 min-h-[44px] rounded-md bg-red-900 px-4 text-sm font-semibold text-white disabled:opacity-50 md:min-h-[36px]"
            >
              Try again
            </button>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length === 0 && (
        <div className="border-t px-4 py-3 md:px-5">
          <p id="suggested-label" className="text-xs font-semibold uppercase tracking-wide text-ink/60">
            Try asking
          </p>
          <ul aria-labelledby="suggested-label" className="mt-2 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <li key={s.label}>
                <button
                  type="button"
                  onClick={() => pick(s)}
                  className="min-h-[44px] rounded-full border border-denim px-4 text-sm text-denim hover:bg-board hover:text-white md:min-h-[36px]"
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form
        className="border-t p-3 md:p-4"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Your message
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id="chat-input"
            ref={inputRef}
            value={input}
            maxLength={MAX_LEN}
            rows={2}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about jobs, skills or interviews…"
            className="min-h-[44px] flex-1 resize-none rounded-lg border bg-white px-3 py-2 text-sm text-ink"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="min-h-[44px] rounded-lg bg-board px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-xs text-ink/60">
          AI can make mistakes. Check job details on the listing before you apply. Please don&apos;t share phone
          numbers, addresses or ID numbers. Messages aren&apos;t saved.
        </p>
      </form>
    </div>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const mine = role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6 md:max-w-[85%] ${
          mine ? "bg-board text-white" : "bg-muted text-ink"
        }`}
      >
        <span className="sr-only">{mine ? "You said: " : "Assistant said: "}</span>
        {children}
      </div>
    </div>
  );
}

function JobList({ jobs }: { jobs: Job[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {jobs.map((j) => {
        const facts = [
          j.location ?? "Location not listed",
          j.jobType ?? "Type not listed",
          j.experience ? `Experience: ${j.experience}` : "Experience not listed",
          j.salary ? `Salary: ${j.salary}` : "Salary not listed",
        ];
        return (
          <li key={j.slug} className="rounded-lg border bg-white p-3 text-ink">
            <a href={`/jobs/${j.slug}`} className="font-semibold text-denim underline-offset-2 hover:underline">
              {j.title}
            </a>
            <p className="text-sm">{j.company}</p>
            <p className="mt-1 text-xs text-ink/70">{facts.join(" · ")}</p>
            {j.posted && <p className="text-xs text-ink/60">Posted {j.posted}</p>}
          </li>
        );
      })}
    </ul>
  );
}
