import { NextResponse } from "next/server";
import { fetchJobs } from "@/lib/artha";

// TEMPORARY diagnostic route — delete once the sort investigation is done.
// Visit /api/debug-sort directly in the browser. It calls Artha's own API
// three times, once per sort_by value, with cache-busting so we're not
// fooled by Next's fetch cache, and shows the first 8 job titles + posted
// dates for each. If the three lists are identical, the issue is on
// Artha's side (their sort_by isn't reordering); if they differ here but
// still look identical on the live site, the issue is in our own caching
// or merge logic instead.
export async function GET() {
  const sortModes: Array<"newest" | "most_relevant" | "high_cpa"> = [
    "newest",
    "most_relevant",
    "high_cpa",
  ];

  try {
    const results = await Promise.all(
      sortModes.map(async (sort_by) => {
        // cache-bust: a throwaway unique param won't affect Artha's actual
        // results (it's not a documented filter) but guarantees Next's
        // fetch cache treats this as a brand-new request every time.
        const data = await fetchJobs({
          limit: 8,
          offset: 0,
          sort_by,
        });
        return {
          sort_by,
          total: data.total,
          jobs: data.items.map((j) => ({
            title: j.title,
            company: j.company,
            posted_date: j.posted_date,
          })),
        };
      })
    );

    const [a, b, c] = results;
    const allIdentical =
      JSON.stringify(a.jobs) === JSON.stringify(b.jobs) &&
      JSON.stringify(b.jobs) === JSON.stringify(c.jobs);

    return NextResponse.json({
      success: true,
      verdict: allIdentical
        ? "All three sort_by values returned an IDENTICAL job order directly from Artha's API — this is an upstream Artha behavior, not something in our own code."
        : "Artha DID return different orders per sort_by — if the live site still looks identical, the bug is in our own caching or merge logic, not Artha.",
      results,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
