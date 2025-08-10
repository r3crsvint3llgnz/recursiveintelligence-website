import { getBaseUrl } from "../lib/baseUrl";

export function GET() {
  const base = getBaseUrl();
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml`);
}
