import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Scheduled job (see vercel.json) that refreshes a small table of external
 * reference prices — e.g. bootcamp tuition, internship stipend benchmarks.
 *
 * THIS IS A STARTING TEMPLATE, not a finished scraper: plug in real target
 * URLs + CSS selectors once you've picked sources. Before adding a source:
 *   1. Check its /robots.txt and Terms of Service — some sites prohibit scraping.
 *   2. Prefer sites with no anti-scraping stance, or ones with an open data/API option.
 *   3. Cache results (this table) rather than hitting the source on every page view.
 */

// Example shape — replace with real sources you've vetted.
const SOURCES: { source: string; url: string; selector: string }[] = [
  // { source: "example-bootcamp", url: "https://example.com/pricing", selector: ".price-amount" },
];

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  if (SOURCES.length === 0) {
    return NextResponse.json({
      success: true,
      message: "No sources configured yet — add entries to SOURCES in this file.",
    });
  }

  const db = supabaseAdmin();
  const results: { source: string; ok: boolean }[] = [];

  for (const src of SOURCES) {
    try {
      const res = await fetch(src.url, {
        headers: { "User-Agent": "CampusBoardPriceBot/1.0 (+https://yourdomain.com/bot)" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const $ = cheerio.load(html);
      const raw = $(src.selector).first().text().trim();
      const price = Number(raw.replace(/[^0-9.]/g, ""));

      await db.from("scraped_prices").insert({
        source: src.source,
        label: src.source,
        price: Number.isFinite(price) ? price : null,
        url: src.url,
      });
      results.push({ source: src.source, ok: true });
    } catch (err) {
      console.error(`[price-scrape] failed for ${src.source}`, err);
      results.push({ source: src.source, ok: false });
    }
    // Be polite: space out requests instead of firing them all at once.
    await new Promise((r) => setTimeout(r, 1500));
  }

  return NextResponse.json({ success: true, results });
}
