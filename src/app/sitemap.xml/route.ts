import { getBaseUrl } from "../../lib/baseUrl";

export async function GET() {
  const base = getBaseUrl();

  // Static pages for MVP; expand later if needed
  const paths = ["/", "/services", "/about"];

  const urls = paths
    .map((p) => `<url><loc>${base}${p}</loc></url>`)
    .join("");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
