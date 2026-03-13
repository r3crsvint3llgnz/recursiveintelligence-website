import { getBaseUrl } from "@/lib/baseUrl";
import { allPosts } from "contentlayer/generated";
import { getBriefs } from "@/lib/briefs";

const today = new Date().toISOString().split("T")[0];

// /resume is excluded — private portfolio page, not for public discovery
const staticPaths = [
  "/", "/about", "/blog", "/briefs",
  "/subscribe", "/support", "/reading-list", "/privacy",
];

export async function GET() {
  const base = getBaseUrl();

  const staticUrls = staticPaths
    .map((p) => `<url><loc>${base}${p}</loc><lastmod>${today}</lastmod></url>`)
    .join("");

  const postUrls = allPosts
    .filter((post) => post.access === "public")
    .map((post) => {
      const lastmod = post.date ? post.date.split("T")[0] : today;
      return `<url><loc>${base}/blog/${post.slug}</loc><lastmod>${lastmod}</lastmod></url>`;
    })
    .join("");

  // Include all public briefs — world briefs are private and excluded
  let briefUrls = "";
  try {
    const briefs = await getBriefs();
    briefUrls = briefs
      .filter((b) => b.category.toLowerCase() !== "world")
      .map((b) => {
        const lastmod = b.date ? b.date.split("T")[0] : today;
        return `<url><loc>${base}/briefs/${b.id}</loc><lastmod>${lastmod}</lastmod></url>`;
      })
      .join("");
  } catch {
    // DynamoDB unavailable — skip briefs gracefully
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${postUrls}${briefUrls}</urlset>`;

  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
