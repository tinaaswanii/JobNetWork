import { describe, expect, it } from "vitest";

import { isLovableHost } from "@/lib/auth/google-sign-in";
import { safeNext } from "@/lib/auth/safe-next";

describe("safeNext", () => {
  it("keeps same-site relative paths", () => {
    expect(safeNext("/dashboard")).toBe("/dashboard");
    expect(safeNext("/jobs?x=1")).toBe("/jobs?x=1");
  });

  it.each([
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "javascript:alert(1)",
    "",
    null,
    undefined,
  ])("rejects %s", (value) => {
    expect(safeNext(value)).toBe("/dashboard");
  });
});

// The Lovable SDK navigates to the relative path /~oauth/initiate, which only
// Lovable's hosting serves. Anywhere else (e.g. Vercel) must use Supabase OAuth.
describe("isLovableHost", () => {
  it.each([
    "myapp.lovable.app",
    "id-preview--abc.lovable.app",
    "x.lovableproject.com",
    "lovable.dev",
  ])("%s is a Lovable host", (host) => expect(isLovableHost(host)).toBe(true));

  it.each(["job-net-work.vercel.app", "localhost", "evil-lovable.app", "lovable.app.evil.test"])(
    "%s is not a Lovable host",
    (host) => expect(isLovableHost(host)).toBe(false),
  );
});
