import { getBaseUrl } from "@/lib/baseUrl";

export async function GET() {
  const base = getBaseUrl();
  const body = `User-agent: *
Allow: /
Sitemap: ${base}/sitemap.xml`;
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
