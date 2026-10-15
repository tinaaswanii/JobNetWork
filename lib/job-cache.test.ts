import { describe, it, expect, vi, beforeEach } from "vitest";

const fetchJobsMock = vi.fn();
let row: any = null;

vi.mock("@/lib/artha", () => ({ fetchJobs: (q: any) => fetchJobsMock(q) }));
vi.mock("@/lib/supabase", () => ({
  supabaseAdmin: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: row, error: null }) }) }),
      upsert: () => Promise.resolve({ error: null }),
    }),
  }),
}));

import { getArthaJobBySlug } from "@/lib/job-cache";

const url = (exp: number) => `https://r.artha.link/redirect/1?expires=${exp}&signature=s`;
const future = Math.floor(Date.now() / 1000) + 3600;
const past = Math.floor(Date.now() / 1000) - 3600;
const base = {
  slug: "dev-abc123", title: "Dev", company: "Co", logo: null, description: "", location: null, city: null,
  state: null, country: null, job_type: null, salary_min: null, salary_max: null, salary_curr: null,
  exp_min: null, exp_max: null, exp_unit: null, skills: [], posted_date: "2026-10-01",
};

beforeEach(() => {
  fetchJobsMock.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
  delete process.env.SUPABASE_SERVICE_ROLE_KEY; // keeps background caching a no-op
});

describe("getArthaJobBySlug and expired links", () => {
  it("returns a cached job with a valid link without calling Artha", async () => {
    row = { ...base, apply_url: url(future) };
    const job = await getArthaJobBySlug("dev-abc123");
    expect(job?.url).toBe(url(future));
    expect(fetchJobsMock).not.toHaveBeenCalled();
  });

  it("refreshes an expired cached link from live Artha", async () => {
    row = { ...base, apply_url: url(past) };
    fetchJobsMock.mockResolvedValue({ items: [{ ...base, id: "x", url: url(future) }], total: 1, limit: 25, offset: 0, has_more: false });
    const job = await getArthaJobBySlug("dev-abc123");
    expect(job?.url).toBe(url(future));
  });

  it("falls back to the stale row (not a 404) when the live refresh fails", async () => {
    row = { ...base, apply_url: url(past) };
    fetchJobsMock.mockRejectedValue(new TypeError("fetch failed"));
    const job = await getArthaJobBySlug("dev-abc123");
    expect(job?.url).toBe(url(past)); // page checks isArthaUrlExpired and hides Apply
  });

  it("returns null when nothing is cached and Artha has no match", async () => {
    row = null;
    fetchJobsMock.mockResolvedValue({ items: [], total: 0, limit: 25, offset: 0, has_more: false });
    expect(await getArthaJobBySlug("dev-abc123")).toBeNull();
  });
});
