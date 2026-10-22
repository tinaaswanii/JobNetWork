import { NextRequest, NextResponse } from "next/server";
import { runAssistant, ChatError, type ChatMessage } from "@/lib/chat/assistant";
import { checkLimits } from "@/lib/chat/limits";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BODY_CHARS = 16_000;
const MAX_MESSAGES = 12; // most recent turns kept; older ones are dropped
const MAX_MESSAGE_CHARS = 1000;

function fail(status: number, code: string, message: string, headers?: Record<string, string>) {
  return NextResponse.json({ success: false, error: { code, message } }, { status, headers });
}

function parseMessages(body: unknown): ChatMessage[] | null {
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out: ChatMessage[] = [];
  for (const m of raw.slice(-MAX_MESSAGES)) {
    const role = (m as ChatMessage)?.role;
    const content = (m as ChatMessage)?.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim();
    if (!text) return null;
    out.push({ role, content: text.slice(0, MAX_MESSAGE_CHARS) });
  }
  // The API needs the conversation to start with and end on a user turn.
  while (out.length && out[0].role !== "user") out.shift();
  if (!out.length || out[out.length - 1].role !== "user") return null;
  // Merge accidental consecutive same-role turns (e.g. after a failed send).
  const merged: ChatMessage[] = [];
  for (const m of out) {
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) last.content = `${last.content}\n${m.content}`.slice(0, MAX_MESSAGE_CHARS * 2);
    else merged.push({ ...m });
  }
  return merged;
}

export async function POST(req: NextRequest) {
  const text = await req.text().catch(() => "");
  if (!text || text.length > MAX_BODY_CHARS) return fail(400, "BAD_REQUEST", "Please send a shorter message.");
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return fail(400, "BAD_REQUEST", "Invalid request.");
  }
  const messages = parseMessages(body);
  if (!messages) return fail(400, "BAD_REQUEST", "Please type a message to send.");

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const limit = checkLimits(ip);
  if (!limit.ok) {
    return fail(429, "RATE_LIMITED", "You're sending messages quickly. Please wait a little and try again.", {
      "Retry-After": String(limit.retryAfterSec),
    });
  }

  try {
    const { reply, jobs } = await runAssistant(messages);
    return NextResponse.json({ success: true, data: { reply, jobs } }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof ChatError) {
      return fail(err.status, err.code.toUpperCase(), err.message);
    }
    console.error("[api/chat] unexpected error", err instanceof Error ? err.message : "unknown");
    return fail(500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
  }
}
