import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { prepTracks } from "@/lib/prep-trek-content";

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
    ...prepTracks.map((track) => ({
      url: `${baseUrl}/prep-trek/${track.slug}`,
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
    ...(ownJobs ?? []).map((job) => ({
      url: `${baseUrl}/jobs/${job.id}`,
      lastModified: new Date(job.posted_date),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),

    ...(cachedJobs ?? []).map((job) => ({
      url: `${baseUrl}/jobs/${job.slug}`,
      lastModified: new Date(job.last_seen_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  return [...staticEntries, ...jobEntries];
}
