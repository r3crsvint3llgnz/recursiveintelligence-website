import { getBaseUrl } from "@/lib/baseUrl";
import { allPosts } from "contentlayer/generated";
import { getBriefs } from "@/lib/briefs";

export async function GET() {
  const base = getBaseUrl();

  const staticPaths = [
    "/", "/about", "/blog", "/briefs",
    "/subscribe", "/support", "/reading-list", "/privacy", "/resume",
  ];

  const staticUrls = staticPaths
    .map((p) => `<url><loc>${base}${p}</loc></url>`)
    .join("");

  const postUrls = allPosts
    .filter((post) => post.access === "public")
    .map((post) => `<url><loc>${base}/blog/${post.slug}</loc></url>`)
    .join("");

  // Include only the latest brief — archive entries are paywalled
  let latestBriefUrl = "";
  try {
    const briefs = await getBriefs();
    const latest = briefs.find(
      (b) => b.is_latest && b.category.toLowerCase() !== "world"
    );
    if (latest) {
      latestBriefUrl = `<url><loc>${base}/briefs/${latest.id}</loc></url>`;
    }
  } catch {
    // DynamoDB unavailable at build time — skip gracefully
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${postUrls}${latestBriefUrl}</urlset>`;

  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
