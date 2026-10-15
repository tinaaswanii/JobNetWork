import { describe, it, expect } from "vitest";
import { isArthaUrlExpired } from "@/lib/artha-url";

const link = (exp: number | string) =>
  `https://r.artha.link/redirect/1?country=IN&expires=${exp}&signature=abc&source=artha-link`;
const NOW = Date.UTC(2026, 9, 15) ; // 15 Oct 2026

describe("isArthaUrlExpired", () => {
  it("flags a link whose expires is in the past", () => {
    expect(isArthaUrlExpired(link(1791835284), NOW)).toBe(true); // 12 Oct 2026
  });
  it("accepts a link that expires in the future", () => {
    expect(isArthaUrlExpired(link(Math.floor(NOW / 1000) + 3600), NOW)).toBe(false);
  });
  it("treats the exact expiry second as expired", () => {
    expect(isArthaUrlExpired(link(Math.floor(NOW / 1000)), NOW)).toBe(true);
  });
  it("never expires own-job or malformed URLs", () => {
    expect(isArthaUrlExpired("https://company.example/apply", NOW)).toBe(false);
    expect(isArthaUrlExpired("not a url", NOW)).toBe(false);
    expect(isArthaUrlExpired("", NOW)).toBe(false);
    expect(isArthaUrlExpired(null, NOW)).toBe(false);
  });
  it("ignores a non-numeric expires value", () => {
    expect(isArthaUrlExpired(link("soon"), NOW)).toBe(false);
  });
});
