export const SITE_URL = "https://job-net-work.vercel.app";

type PageHeadInput = {
  title: string;
  description: string;
  path: string;
  ogTitle?: string | undefined;
  ogDescription?: string | undefined;
  noindex?: boolean | undefined;
};

/** Per-page <head> for the public site: "%s | JobNetWork" title, canonical, Open Graph. */
export function pageHead({
  title,
  description,
  path,
  ogTitle,
  ogDescription,
  noindex,
}: PageHeadInput) {
  const fullTitle = `${title} | JobNetWork`;
  const url = `${SITE_URL}${path}`;
  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      ...(noindex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "JobNetWork" },
      { property: "og:url", content: url },
      { property: "og:title", content: ogTitle ?? fullTitle },
      { property: "og:description", content: ogDescription ?? description },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
