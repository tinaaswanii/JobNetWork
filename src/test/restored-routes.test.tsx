import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Regression: these URLs worked on the Next.js site until 12 Oct and returned
// 404 after the Lovable overlay. Each must match a real route, not the root
// not-found fallback.
const RESTORED = [
  "/about",
  "/guides",
  "/testimonials",
  "/match",
  "/prep-trek",
  "/prep-trek/dbms",
  "/prep-trek/sql",
  "/prep-trek/computer-networks",
  "/prep-trek/software-engineering",
  "/auth",
  "/auth/callback",
  "/login",
  "/jobs",
  "/",
];

describe("Restored routes", () => {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

  it.each(RESTORED)("%s matches a page", (path) => {
    const matches = router.matchRoutes(path);
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("prefers the static DBMS page over the dynamic track page", () => {
    expect(router.matchRoutes("/prep-trek/dbms").at(-1)?.routeId).toBe("/_site/prep-trek/dbms");
  });

  it("serves /auth/callback from its own route, not nested under /auth", () => {
    expect(router.matchRoutes("/auth/callback").at(-1)?.routeId).toBe("/auth_/callback");
  });
});
