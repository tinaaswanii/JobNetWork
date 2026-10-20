import type { Metadata } from "next";

// One place to build page metadata so every public page gets the same set:
// canonical, title, description, og:title/description/url and a large Twitter
// card. og:image comes from the opengraph-image files (app/, app/jobs,
// app/prep-trek, app/guides), which Next attaches per section.

export const POSITIONING_LINE =
  "Jobs and internships in India, from your first job to your next big move.";

// Which share image a page uses: its section's card, else the site-wide one.
// Set explicitly because Next only attaches an inherited opengraph-image to
// pages that do not define their own openGraph.
function shareImage(path: string) {
  const section = ["/jobs", "/prep-trek", "/guides"].find((s) => path === s || path.startsWith(s + "/"));
  return {
    url: `${section ?? ""}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: "JobNetWork: " + POSITIONING_LINE,
  };
}

export function pageMetadata(o: {
  /** Page title. The root layout adds " | JobNetWork" unless `absoluteTitle` is set. */
  title: string;
  description: string;
  /** Path of the page, for example "/guides". Resolved against metadataBase. */
  path: string;
  absoluteTitle?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  type?: "website" | "article";
}): Metadata {
  const fullTitle = o.absoluteTitle ? o.title : `${o.title} | JobNetWork`;
  const ogTitle = o.ogTitle ?? fullTitle;
  const ogDescription = o.ogDescription ?? o.description;
  const image = shareImage(o.path);

  return {
    title: o.absoluteTitle ? { absolute: o.title } : o.title,
    description: o.description,
    alternates: { canonical: o.path },
    openGraph: {
      type: o.type ?? "website",
      url: o.path,
      siteName: "JobNetWork",
      locale: "en_IN",
      title: ogTitle,
      description: ogDescription,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [image.url],
    },
  };
}
