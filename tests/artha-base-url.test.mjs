import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ARTHA_DEFAULT_BASE_URL, getArthaBaseUrl } from "../lib/artha.ts";

describe("Artha base URL normalization", () => {
  it("defaults to https://api.artha.link/api/v1 when no env is provided", () => {
    assert.equal(ARTHA_DEFAULT_BASE_URL, "https://api.artha.link/api/v1");
    assert.equal(getArthaBaseUrl({}), "https://api.artha.link/api/v1");
  });

  it("falls back to default when ARTHA_BASE_URL is empty string", () => {
    assert.equal(getArthaBaseUrl({ ARTHA_BASE_URL: "" }), ARTHA_DEFAULT_BASE_URL);
  });

  it("falls back to default when ARTHA_BASE_URL is whitespace only", () => {
    assert.equal(getArthaBaseUrl({ ARTHA_BASE_URL: "   \t  " }), ARTHA_DEFAULT_BASE_URL);
  });

  it("honors an explicit override and trims trailing slashes", () => {
    assert.equal(
      getArthaBaseUrl({ ARTHA_BASE_URL: "https://custom-artha.test/api/v1///" }),
      "https://custom-artha.test/api/v1"
    );
  });

  it("never defaults to the invalid api-usa host", () => {
    assert.ok(!getArthaBaseUrl({}).includes("api-usa"));
  });
});
