import * as cheerio from "cheerio";

/** Strips HTML down to plain text — for meta descriptions, JSON-LD fields, etc. */
export function htmlToText(html: string, maxLen?: number): string {
  const $ = cheerio.load(html);
  const text = $.root().text().replace(/\s+/g, " ").trim();
  if (maxLen && text.length > maxLen) {
    return text.slice(0, maxLen - 1).trimEnd() + "…";
  }
  return text;
}

/**
 * Light sanitization for job description HTML before rendering with
 * dangerouslySetInnerHTML — strips script/style tags and inline event
 * handlers. Artha/own_jobs descriptions are ordinary job-posting prose, not
 * arbitrary user HTML, but this is cheap insurance since the content
 * ultimately comes from a third-party API we don't control.
 */
export function sanitizeJobHtml(html: string): string {
  const $ = cheerio.load(html, null, false);
  $("script, style, iframe, object, embed").remove();
  $("*").each((_, el) => {
    if (el.type !== "tag") return;
    const attribs = el.attribs ?? {};
    for (const name of Object.keys(attribs)) {
      if (name.toLowerCase().startsWith("on")) $(el).removeAttr(name);
    }
    if ("href" in attribs && /^\s*javascript:/i.test(attribs.href)) {
      $(el).removeAttr("href");
    }
  });
  return $.html() ?? "";
}
