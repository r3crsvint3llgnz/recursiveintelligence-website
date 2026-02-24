import { allPosts } from 'contentlayer/generated'
import { getBaseUrl } from '@/lib/baseUrl'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const siteMetadata = require('../../../data/siteMetadata')
const SITE_TITLE: string = siteMetadata.title
const SITE_DESCRIPTION: string = siteMetadata.description

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(): Promise<Response> {
  const SITE_URL = getBaseUrl()
  const publicPosts = allPosts
    .filter((post) => post.access === 'public')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const lastBuildDate =
    publicPosts.length > 0
      ? new Date(publicPosts[0].date).toUTCString()
      : new Date().toUTCString()

  const items = publicPosts
    .map((post) => {
      const postUrl = `${SITE_URL}/blog/${post.slug}`
      const pubDate = new Date(post.date).toUTCString()
      const categories = (post.tags ?? [])
        .map((tag) => `    <category>${escapeXml(tag)}</category>`)
        .join('\n')

      return `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${escapeXml(postUrl)}</link>
    <description>${escapeXml(post.description)}</description>
    <pubDate>${pubDate}</pubDate>
    <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
${categories}
  </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(SITE_URL)}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
