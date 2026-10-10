"use client";

import { useEffect, useSyncExternalStore } from "react";
import { supabaseBrowser } from "@/lib/auth/client";

/**
 * Per-browser cache of "which public jobs has this user saved / tracked", loaded
 * ONCE per page rather than once per job card. Reads go through the anon client
 * + the user's session, so RLS limits them to the user's own rows. Writes never
 * happen here — they go through server actions.
 */
type State = {
  status: "idle" | "loading" | "ready";
  signedIn: boolean;
  saved: ReadonlySet<string>;
  apps: ReadonlyMap<string, string>; // job_id -> application id
};

const EMPTY: State = { status: "idle", signedIn: false, saved: new Set(), apps: new Map() };
let state: State = EMPTY;
const listeners = new Set<() => void>();
let watching = false;

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

async function load() {
  set({ status: "loading" });
  const sb = supabaseBrowser();
  const { data } = await sb.auth.getUser();
  if (!data.user) return set({ status: "ready", signedIn: false, saved: new Set(), apps: new Map() });
  const [s, a] = await Promise.all([
    sb.from("saved_jobs").select("job_id"),
    sb.from("applications").select("id, job_id").not("job_id", "is", null),
  ]);
  set({
    status: "ready",
    signedIn: true,
    saved: new Set((s.data ?? []).map((r) => r.job_id as string)),
    apps: new Map((a.data ?? []).map((r) => [r.job_id as string, r.id as string])),
  });
}

function ensureLoaded() {
  if (!watching) {
    watching = true;
    // Reload when the user signs in/out in this tab.
    supabaseBrowser().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") load();
    });
  }
  if (state.status === "idle") load();
}

export function markSaved(jobId: string, on: boolean) {
  const saved = new Set(state.saved);
  on ? saved.add(jobId) : saved.delete(jobId);
  set({ saved });
}

export function markTracked(jobId: string, applicationId: string) {
  set({ apps: new Map(state.apps).set(jobId, applicationId) });
}

export function useTracking() {
  useEffect(ensureLoaded, []);
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => EMPTY
  );
}
