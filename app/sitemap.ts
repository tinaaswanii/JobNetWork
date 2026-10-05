import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { prepTracks } from "@/lib/prep-trek-content";

// Sitemaps can hold up to 50,000 URLs; cap well under that for now so this
// stays fast and we're not submitting a sitemap a search engine will choke
// on before the site has that much real traffic/content to justify it.
const MAX_JOB_URLS = 2000;

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
    ...prepTracks.map((t) => ({
      url: `${baseUrl}/prep-trek/${t.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  const db = supabaseAdmin();

  const [{ data: ownJobs }, { data: cachedJobs }] = await Promise.all([
    db
      .from("own_jobs")
      .select("id, posted_date")
      .eq("is_active", true)
      .order("posted_date", { ascending: false })
      .limit(MAX_JOB_URLS),
    db
      .from("cached_jobs")
      .select("slug, last_seen_at")
      .order("last_seen_at", { ascending: false })
      .limit(MAX_JOB_URLS),
  ]);

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
