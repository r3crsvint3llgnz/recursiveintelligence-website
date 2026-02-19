import { getBaseUrl } from "@/lib/baseUrl";
import { allPosts } from "contentlayer/generated";

export async function GET() {
  const base = getBaseUrl();

  const staticPaths = ["/", "/about", "/blog", "/briefs", "/subscribe"];

  const staticUrls = staticPaths
    .map((p) => `<url><loc>${base}${p}</loc></url>`)
    .join("");

  const postUrls = allPosts
    .filter((post) => post.access === "public")
    .map((post) => `<url><loc>${base}/blog/${post.slug}</loc></url>`)
    .join("");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${postUrls}</urlset>`;

  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
