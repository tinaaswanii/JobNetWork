import { createFileRoute, redirect } from "@tanstack/react-router";

// The previous site signed in at /login; keep old links and bookmarks working.
export const Route = createFileRoute("/login")({
  beforeLoad: ({ location }) => {
    const params = new URLSearchParams(location.searchStr);
    const error = params.get("error") ?? undefined;
    const next = params.get("next") ?? undefined;
    throw redirect({
      to: "/auth",
      search: { error, next },
      replace: true,
    });
  },
});
