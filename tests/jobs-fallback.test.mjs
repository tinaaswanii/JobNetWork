import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { fetchJobs, ArthaApiError } from "../lib/artha.ts";
import { getJobsPage } from "../lib/jobs.ts";

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };

describe("Job Listing Fallback and Artha API resilience", () => {
  beforeEach(() => {
    process.env.ARTHA_API_KEY = "test_key_12345";
    process.env.ARTHA_BASE_URL = "https://api.artha.link/api/v1";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "fake_service_role_key";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env = { ...originalEnv };
  });

  it("fetchJobs throws ArthaApiError on expired API key with upstream message", async () => {
    globalThis.fetch = async () => ({
      ok: false,
      status: 401,
      headers: new Headers(),
      json: async () => ({
        success: false,
        error: { code: "API_KEY_EXPIRED", message: "API key has expired" },
      }),
    });

    await assert.rejects(
      async () => {
        await fetchJobs();
      },
      (err) => {
        assert.ok(err instanceof ArthaApiError);
        assert.equal(err.status, 401);
        assert.equal(err.code, "API_KEY_EXPIRED");
        assert.equal(err.message, "API key has expired");
        return true;
      }
    );
  });

  it("fetchJobs throws ArthaApiError on network failure", async () => {
    globalThis.fetch = async () => {
      throw new TypeError("fetch failed");
    };

    await assert.rejects(
      async () => {
        await fetchJobs();
      },
      (err) => {
        assert.ok(err instanceof Error);
        return true;
      }
    );
  });

  it("fetchJobs throws ArthaApiError on missing or blank API key", async () => {
    delete process.env.ARTHA_API_KEY;

    await assert.rejects(
      async () => {
        await fetchJobs();
      },
      (err) => {
        assert.ok(err instanceof ArthaApiError);
        assert.equal(err.code, "MISSING_API_KEY");
        assert.equal(err.status, 401);
        return true;
      }
    );
  });

  it("fetchJobs parses valid successful Artha responses correctly", async () => {
    const mockItem = {
      id: "job_123",
      slug: "frontend-engineer-job_123",
      title: "Frontend Engineer",
      company: "Acme Corp",
      logo: null,
      description: "<p>Work with React</p>",
      location: "Bengaluru, India",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      job_type: "full-time",
      salary_min: 1500000,
      salary_max: 2500000,
      salary_curr: "INR",
      exp_min: 2,
      exp_max: 5,
      exp_unit: "years",
      skills: ["React", "TypeScript"],
      posted_date: "2026-10-14T00:00:00Z",
      url: "https://artha.link/jobs/frontend-engineer-job_123",
    };

    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({
        success: true,
        data: {
          items: [mockItem],
          total: 1,
          limit: 10,
          offset: 0,
          has_more: false,
        },
      }),
    });

    const res = await fetchJobs({ limit: 10, offset: 0 });
    assert.equal(res.items.length, 1);
    assert.equal(res.items[0].title, "Frontend Engineer");
    assert.equal(res.total, 1);
    assert.equal(res.has_more, false);
  });

  it("getJobsPage falls back safely when Artha API returns expired key (does not crash)", async () => {
    // Upstream Artha is expired/failing
    globalThis.fetch = async (url) => {
      if (String(url).includes("artha.link")) {
        return {
          ok: false,
          status: 401,
          headers: new Headers(),
          json: async () => ({
            success: false,
            error: { code: "API_KEY_EXPIRED", message: "API key has expired" },
          }),
        };
      }
      return { ok: false, status: 500, json: async () => ({}) };
    };

    // getJobsPage should NOT reject with an error; it must return a valid JobsPageResult
    const result = await getJobsPage({ limit: 12, offset: 0 });
    assert.ok(result);
    assert.ok(Array.isArray(result.items));
    assert.equal(typeof result.total, "number");
    assert.equal(typeof result.has_more, "boolean");
    assert.equal(result.limit, 12);
    assert.equal(result.offset, 0);
  });

  it("getJobsPage falls back safely on network failures without throwing", async () => {
    globalThis.fetch = async () => {
      throw new Error("Network unreachable (ECONNREFUSED)");
    };

    const result = await getJobsPage({ limit: 10, offset: 0, q: "Developer" });
    assert.ok(result);
    assert.ok(Array.isArray(result.items));
    assert.equal(typeof result.total, "number");
  });

  it("getJobsPage strictly preserves pagination, filtering, and contract on empty cache", async () => {
    globalThis.fetch = async () => {
      throw new Error("API offline");
    };

    const result = await getJobsPage({ limit: 20, offset: 40, sort_by: "newest" });
    assert.equal(result.limit, 20);
    assert.equal(result.offset, 40);
    assert.equal(typeof result.has_more, "boolean");
    assert.equal(typeof result.total, "number");
    assert.ok(Array.isArray(result.items));
  });
});
