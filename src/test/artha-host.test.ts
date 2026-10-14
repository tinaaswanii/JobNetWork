import { describe, expect, it } from "vitest";

import { ARTHA_DEFAULT_BASE_URL, getArthaBaseUrl } from "@/lib/jobs/artha-config";

// Regression: an overlay of the Lovable app changed the default Artha host to
// api-usa.artha.link. The original working client (lib/artha.ts) used
// https://api.artha.link/api/v1.
describe("Artha base URL", () => {
  it("defaults to https://api.artha.link/api/v1", () => {
    expect(ARTHA_DEFAULT_BASE_URL).toBe("https://api.artha.link/api/v1");
    expect(getArthaBaseUrl({})).toBe("https://api.artha.link/api/v1");
  });

  it("falls back to the default when ARTHA_BASE_URL is empty or whitespace", () => {
    expect(getArthaBaseUrl({ ARTHA_BASE_URL: "" })).toBe(ARTHA_DEFAULT_BASE_URL);
    expect(getArthaBaseUrl({ ARTHA_BASE_URL: "   " })).toBe(ARTHA_DEFAULT_BASE_URL);
  });

  it("honors an explicit override and strips trailing slashes", () => {
    expect(getArthaBaseUrl({ ARTHA_BASE_URL: "https://example.test/api/v1/" })).toBe(
      "https://example.test/api/v1",
    );
  });

  it("never defaults to the api-usa host", () => {
    expect(getArthaBaseUrl({})).not.toContain("api-usa");
  });
});
