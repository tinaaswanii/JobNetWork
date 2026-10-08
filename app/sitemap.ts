import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { prepTracks } from "@/lib/prep-trek-content";

// Sitemaps can hold up to 50,000 URLs; cap well under that for now so this
// stays fast and we're not submitting a sitemap a search engine will choke
// on before the site has that much real traffic/content to justify it.
const MAX_JOB_URLS = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://job-net-work.vercel.app";

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/prep-trek`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/prep-trek/dbms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/prep-trek/sql`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/testimonials`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/prep-trek/common-questions.html`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...prepTracks.map((t) => ({
      url: `${baseUrl}/prep-trek/${t.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

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
