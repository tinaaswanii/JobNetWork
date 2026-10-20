import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { prepTracks } from "@/lib/prep-trek-content";

// Sitemaps can hold up to 50,000 URLs; cap well under that for now so this
// stays fast and we're not submitting a sitemap a search engine will choke
// on before the site has that much real traffic/content to justify it.
const MAX_JOB_URLS = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://job-net-work.vercel.app";

  // lastModified is left out for static pages on purpose: there is no real
  // modified date for them, and a made-up "now" teaches crawlers to ignore it.
  const staticPaths: [string, "daily" | "weekly" | "monthly", number][] = [
    ["/", "daily", 1],
    ["/jobs", "daily", 0.9],
    ["/match", "monthly", 0.7],
    ["/prep-trek", "monthly", 0.7],
    ["/prep-trek/common-questions", "monthly", 0.6],
    ["/prep-trek/dbms", "monthly", 0.6],
    ["/prep-trek/sql", "monthly", 0.6],
    ["/prep-trek/computer-networks", "monthly", 0.6],
    ["/guides", "weekly", 0.7],
    ["/testimonials", "monthly", 0.5],
    ["/about", "monthly", 0.7],
    // Every Prep Trek track, straight from the content list.
    ...prepTracks.map((t): [string, "monthly", number] => [`/prep-trek/${t.slug}`, "monthly", 0.6]),
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map(([path, changeFrequency, priority]) => ({
    url: path === "/" ? `${baseUrl}/` : `${baseUrl}${path}`,
    changeFrequency,
    priority,
  }));

  // Only list the newest, recently-seen jobs. Old/expired postings 404 or are
  // thin duplicates, and a big pile of them makes Google slow to index the
  // pages that matter. If the database is unreachable, still serve the
  // static pages instead of failing the whole sitemap.
  const cutoff = new Date(Date.now() - 30 * 86400000).toISOString();
  let ownJobs: any[] | null = [];
  let cachedJobs: any[] | null = [];
  try {
    const db = supabaseAdmin();
    const [own, cached] = await Promise.all([
      db
        .from("own_jobs")
        .select("id, posted_date")
        .eq("is_active", true)
        .order("posted_date", { ascending: false })
        .limit(MAX_JOB_URLS),
      db
        .from("cached_jobs")
        .select("slug, last_seen_at")
        .gte("last_seen_at", cutoff)
        .order("last_seen_at", { ascending: false })
        .limit(MAX_JOB_URLS),
    ]);
    ownJobs = own.data;
    cachedJobs = cached.data;
  } catch {
    // fall through with empty job lists
  }

  const jobEntries: MetadataRoute.Sitemap = [
    ...(ownJobs ?? []).map((row) => ({
      url: `${baseUrl}/jobs/${row.id}`,
      lastModified: new Date(row.posted_date),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...(cachedJobs ?? []).map((row) => ({
      url: `${baseUrl}/jobs/${row.slug}`,
      lastModified: new Date(row.last_seen_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  return [...staticEntries, ...jobEntries];
}
