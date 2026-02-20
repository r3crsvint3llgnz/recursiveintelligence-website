import { fetchReadingList } from '@/lib/raindrop'
import { getBaseUrl } from '@/lib/baseUrl'
import type { RaindropItem } from '@/lib/raindrop'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function buildRssXml(items: RaindropItem[], baseUrl: string): string {
  const itemsXml = items
    .map(
      (item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="false">${escapeXml(item.link)}</guid>
      <description><![CDATA[${item.note}]]></description>
      <pubDate>${new Date(item.created).toUTCString()}</pubDate>
    </item>`
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>AI/ML Reading List — Recursive Intelligence</title>
    <link>${baseUrl}/reading-list</link>
    <description>Curated AI/ML news with summaries by Seth Robins</description>
    <language>en-us</language>
    <ttl>60</ttl>${itemsXml}
  </channel>
</rss>`
}

export async function GET() {
  const items = await fetchReadingList()
  const xml = buildRssXml(items, getBaseUrl())
  return new Response(xml, {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  })
}
