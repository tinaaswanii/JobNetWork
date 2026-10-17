import { COMMON_QUESTIONS_HTML } from "@/lib/common-questions-html";

// Served at /prep-trek/common-questions (the old /prep-trek/common-questions.html
// is permanently redirected here in next.config.js).
export const dynamic = "force-static";

export function GET() {
  return new Response(COMMON_QUESTIONS_HTML, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
