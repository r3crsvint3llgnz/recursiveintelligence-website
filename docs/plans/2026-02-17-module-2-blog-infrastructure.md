# Module 2: Blog Infrastructure & Briefs Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the MDX-based blog system and the DynamoDB-backed briefs integration as two architecturally separate content systems, plus an RSS feed route handler and a scaffolded newsletter subscribe endpoint.

**Architecture:** Blog posts are hand-authored MDX files processed at build time by `contentlayer2`. Briefs are Lambda-generated records fetched server-side at request time from DynamoDB via the AWS SDK v3 Document Client. Both have listing and detail pages. They share the same domain and design system but have zero coupling to each other.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, `contentlayer2` + `next-contentlayer2`, `@tailwindcss/typography`, `@aws-sdk/lib-dynamodb`, Tailwind v4 CSS variables

---

## Codebase Reality (read before starting)

- Stub pages already exist at `src/app/blog/page.tsx` and `src/app/briefs/page.tsx` — they will be replaced in place
- `next.config.ts` is currently empty (`nextConfig = {}`) — needs `withContentlayer` wrapper
- `tsconfig.json` uses `"moduleResolution": "bundler"` and `"@/*": ["./src/*"]` — contentlayer path alias must be added
- CSS utility classes used throughout: `.glass`, `.ri-heading`, `.ri-link`, `.ri-divider`, `.ri-page-bg`, `text-gray-400`, `max-w-3xl` width is already applied by the root layout
- `genPageMetadata()` in `src/app/seo.tsx` is the standard way to set per-page metadata
- No test framework — verify with `npm run build` + `npm run lint` + manual browser check
- `@aws-sdk` v3 is NOT currently installed
- The `.contentlayer/` generated directory must be added to `.gitignore`
- ⚠️ Use `contentlayer2` and `next-contentlayer2` — NOT the original `contentlayer` / `next-contentlayer` packages (the originals are abandoned and do not support Next.js 15+)

---

## Task 1: Create Dev Branch

**Files:**
- Git operations only

**Step 1: Create and push dev branch**

```bash
cd /home/r3crsvint3llgnz/01_Projects/recursiveintelligence-website
git checkout -b dev
git push -u origin dev
```

Expected: branch `dev` created and tracking `origin/dev`.

**Step 2: Verify**

```bash
git branch -a
```

Expected: `* dev` listed, `remotes/origin/dev` listed.

---

## Task 2: Install Blog Dependencies

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json` (auto-updated)

**Step 1: Install contentlayer2 and typography plugin**

```bash
npm install contentlayer2 next-contentlayer2 @tailwindcss/typography
```

Expected: packages added, no peer dep errors.

**Step 2: Verify installed versions**

```bash
node -e "console.log(require('./node_modules/contentlayer2/package.json').version)"
node -e "console.log(require('./node_modules/next-contentlayer2/package.json').version)"
```

Expected: version strings printed without error.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install contentlayer2 and tailwindcss/typography"
```

---

## Task 3: Configure Contentlayer

**Files:**
- Create: `contentlayer.config.ts` (project root)
- Modify: `next.config.ts`
- Modify: `tsconfig.json`
- Modify: `.gitignore`

**Step 1: Create `contentlayer.config.ts`**

```typescript
import { defineDocumentType, makeSource } from 'contentlayer2/source-files'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: 'blog/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title:       { type: 'string',  required: true },
    description: { type: 'string',  required: true },
    date:        { type: 'date',    required: true },
    tags:        { type: 'list', of: { type: 'string' }, default: [] },
    featured:    { type: 'boolean', default: false },
    coverImage:  { type: 'string' },
    access: {
      type: 'enum',
      options: ['public', 'members', 'paid'],
      default: 'public',
    },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (post) => post._raw.flattenedPath.replace(/^blog\//, ''),
    },
    readingTime: {
      type: 'number',
      resolve: (post) =>
        Math.max(1, Math.ceil(post.body.raw.split(/\s+/).length / 200)),
    },
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post],
})
```

**Step 2: Wrap `next.config.ts` with `withContentlayer`**

Replace the entire file:

```typescript
import { withContentlayer } from 'next-contentlayer2'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {}

export default withContentlayer(nextConfig)
```

**Step 3: Add contentlayer path alias to `tsconfig.json`**

In the `"paths"` object, add one entry:

```json
"paths": {
  "@/*": ["./src/*"],
  "contentlayer/generated": ["./.contentlayer/generated"]
}
```

Also add `.contentlayer` to the `"include"` array:

```json
"include": [
  "next-env.d.ts",
  "**/*.ts",
  "**/*.tsx",
  ".next/types/**/*.ts",
  ".next/dev/types/**/*.ts",
  ".contentlayer/generated"
]
```

**Step 4: Add `.contentlayer/` to `.gitignore`**

Append to `.gitignore`:

```
# contentlayer generated output
.contentlayer
```

**Step 5: Enable `@tailwindcss/typography` in `src/app/globals.css`**

Add after the first line (`@import "tailwindcss";`):

```css
@plugin "@tailwindcss/typography";
```

**Step 6: Build to confirm contentlayer wires up correctly**

```bash
npm run build
```

Expected: build succeeds. You will see contentlayer generate `.contentlayer/generated/` — it may warn about zero documents; that is fine until Task 4 adds a post.

**Step 7: Commit**

```bash
git add contentlayer.config.ts next.config.ts tsconfig.json .gitignore src/app/globals.css
git commit -m "feat: configure contentlayer2 for MDX blog"
```

---

## Task 4: Add Sample Blog Post

**Files:**
- Create: `content/blog/` directory
- Create: `content/blog/hello-world.mdx`

**Step 1: Create the content directory and sample post**

```bash
mkdir -p content/blog
```

Create `content/blog/hello-world.mdx`:

```mdx
---
title: Hello World
description: The first post on Recursive Intelligence — what this site is and where it's going.
date: 2026-02-17
tags: [meta, introduction]
featured: true
access: public
---

This is a placeholder post to verify the blog infrastructure is working correctly.

## Why This Exists

Recursive Intelligence is a learning-in-public research platform exploring AI, systems thinking,
and philosophy of mind.

## What's Coming

Long-form writing, AI/ML briefs from an automated pipeline, and AWS experiment showcases.

```

**Step 2: Build to verify contentlayer processes the post**

```bash
npm run build
```

Expected: build succeeds. The `.contentlayer/generated/Post/` directory now contains a generated JSON file for `hello-world`.

**Step 3: Commit**

```bash
git add content/
git commit -m "content: add hello-world placeholder post"
```

---

## Task 5: Blog Listing Page

**Files:**
- Modify: `src/app/blog/page.tsx` (replace stub)

**Step 1: Replace `src/app/blog/page.tsx`**

```tsx
import Link from 'next/link'
import { allPosts } from 'contentlayer/generated'
import { compareDesc, format } from 'date-fns'
import { genPageMetadata } from '../seo'

export const metadata = genPageMetadata({
  title: 'Articles',
  description: 'Long-form writing on AI systems and philosophy of mind.',
})

export default function BlogPage() {
  const posts = allPosts
    .filter((p) => p.access === 'public')
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))

  return (
    <main className="py-12">
      <div className="ri-page-bg">
        <h1 className="ri-heading text-4xl font-bold mb-6">Articles</h1>
        <p className="text-gray-400 mb-10">
          Long-form writing on AI systems, philosophy of mind, and systems thinking.
        </p>

        {posts.length === 0 ? (
          <div className="glass p-8 text-center">
            <p className="text-gray-400">No articles yet — check back soon.</p>
          </div>
        ) : (
          <ul className="space-y-6">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="block group">
                  <article className="glass border-l-[3px] border-[color:var(--ri-accent)] hover:bg-white/[0.06] transition-colors p-6">
                    <div className="flex items-center gap-3 mb-2 text-xs text-gray-500">
                      <time dateTime={post.date}>
                        {format(new Date(post.date), 'MMMM d, yyyy')}
                      </time>
                      <span>·</span>
                      <span>{post.readingTime} min read</span>
                      {post.tags.length > 0 && (
                        <>
                          <span>·</span>
                          <span>{post.tags.join(', ')}</span>
                        </>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-100 group-hover:text-[color:var(--ri-accent)] transition-colors mb-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-400 text-sm">{post.description}</p>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
```

**Step 2: Install `date-fns`** (needed for `format` and `compareDesc`)

```bash
npm install date-fns
```

**Step 3: Build and lint**

```bash
npm run build && npm run lint
```

Expected: build succeeds, lint clean.

**Step 4: Commit**

```bash
git add src/app/blog/page.tsx package.json package-lock.json
git commit -m "feat: implement blog listing page"
```

---

## Task 6: Blog Post Detail Page

**Files:**
- Create: `src/app/blog/[slug]/page.tsx`

**Step 1: Create `src/app/blog/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { allPosts } from 'contentlayer/generated'
import { getMDXComponent } from 'next-contentlayer2/hooks'
import { format } from 'date-fns'
import { genPageMetadata } from '../../seo'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return allPosts
    .filter((p) => p.access === 'public')
    .map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = allPosts.find((p) => p.slug === slug)
  if (!post) return {}
  return genPageMetadata({
    title: post.title,
    description: post.description,
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = allPosts.find((p) => p.slug === slug && p.access === 'public')

  if (!post) notFound()

  const Content = getMDXComponent(post.body.code)

  return (
    <main className="py-12">
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
            <time dateTime={post.date}>
              {format(new Date(post.date), 'MMMM d, yyyy')}
            </time>
            <span>·</span>
            <span>{post.readingTime} min read</span>
            {post.tags.length > 0 && (
              <>
                <span>·</span>
                <span>{post.tags.join(', ')}</span>
              </>
            )}
          </div>
          <h1 className="ri-heading text-4xl font-bold mb-4">{post.title}</h1>
          <p className="text-gray-400 text-lg">{post.description}</p>
        </header>

        <hr className="ri-divider mb-10" />

        <div className="prose prose-invert prose-orange max-w-none
          prose-headings:font-bold prose-headings:text-gray-100
          prose-a:text-[color:var(--ri-accent)] prose-a:no-underline hover:prose-a:underline
          prose-code:text-orange-300 prose-code:bg-white/5 prose-code:rounded prose-code:px-1
          prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10">
          <Content />
        </div>
      </article>
    </main>
  )
}
```

**Step 2: Build and lint**

```bash
npm run build && npm run lint
```

Expected: build succeeds. The `/blog/hello-world` route renders the sample post.

**Step 3: Commit**

```bash
git add src/app/blog/
git commit -m "feat: implement blog post detail page"
```

---

## Task 7: Install AWS SDK for DynamoDB

**Files:**
- Modify: `package.json` / `package-lock.json` (auto-updated)

**Step 1: Install DynamoDB Document Client**

```bash
npm install @aws-sdk/lib-dynamodb @aws-sdk/client-dynamodb
```

The `lib-dynamodb` package provides the `DynamoDBDocumentClient` wrapper that marshals/unmarshals JavaScript types automatically (no need to deal with `{ S: "string" }` AttributeValue syntax).

**Step 2: Verify**

```bash
node -e "require('@aws-sdk/lib-dynamodb'); console.log('ok')"
```

Expected: prints `ok`.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install @aws-sdk/lib-dynamodb for DynamoDB access"
```

---

## Task 8: Brief Types and DynamoDB Client Library

**Files:**
- Create: `src/types/brief.ts`
- Create: `src/lib/briefs.ts`

**Step 1: Create `src/types/brief.ts`**

This interface reflects the shape of a record written by the Lambda pipeline: one Brief per run (twice daily), each containing an array of classified article items.

```typescript
export interface BriefItem {
  title: string
  url: string
  source: string
  summary: string
  tags: string[]
}

export interface Brief {
  /** DynamoDB partition key — e.g. "2026-02-17-am" */
  id: string
  /** Human-readable heading — e.g. "AI/ML Brief — Feb 17 AM" */
  title: string
  /** ISO 8601 timestamp when the brief was generated */
  date: string
  /** One-paragraph synthesis of the items */
  summary: string
  /** Ordered list of curated article items */
  items: BriefItem[]
  /** Top-level category — e.g. "AI/ML" */
  category: string
}
```

**Step 2: Create `src/lib/briefs.ts`**

```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb'
import type { Brief } from '@/types/brief'

function getClient(): DynamoDBDocumentClient {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION ?? 'us-east-2',
  })
  return DynamoDBDocumentClient.from(client)
}

function getTableName(): string {
  const name = process.env.BRIEFS_TABLE_NAME
  if (!name) throw new Error('BRIEFS_TABLE_NAME env var is not set')
  return name
}

/**
 * Returns all briefs, sorted newest-first.
 * Returns [] if the table name env var is not set (graceful degradation in dev).
 */
export async function listBriefs(): Promise<Brief[]> {
  if (!process.env.BRIEFS_TABLE_NAME) {
    console.warn('[briefs] BRIEFS_TABLE_NAME not set — returning empty list')
    return []
  }
  const doc = getClient()
  const result = await doc.send(new ScanCommand({ TableName: getTableName() }))
  const items = (result.Items ?? []) as Brief[]
  return items.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

/**
 * Returns a single brief by its id, or null if not found.
 * Returns null if the table name env var is not set.
 */
export async function getBrief(id: string): Promise<Brief | null> {
  if (!process.env.BRIEFS_TABLE_NAME) {
    console.warn('[briefs] BRIEFS_TABLE_NAME not set — returning null')
    return null
  }
  const doc = getClient()
  const result = await doc.send(
    new GetCommand({ TableName: getTableName(), Key: { id } })
  )
  return (result.Item as Brief) ?? null
}
```

**Step 3: Build and lint**

```bash
npm run build && npm run lint
```

Expected: clean. The new files are type-checked but not yet imported by any page.

**Step 4: Commit**

```bash
git add src/types/brief.ts src/lib/briefs.ts
git commit -m "feat: add Brief types and DynamoDB client library"
```

---

## Task 9: Briefs Listing Page

**Files:**
- Modify: `src/app/briefs/page.tsx` (replace stub)

**Step 1: Replace `src/app/briefs/page.tsx`**

This is a Server Component — it fetches from DynamoDB at request time. No `'use client'` directive.

```tsx
import Link from 'next/link'
import { format } from 'date-fns'
import { listBriefs } from '@/lib/briefs'
import { genPageMetadata } from '../seo'

export const metadata = genPageMetadata({
  title: 'AI/ML Briefs',
  description: 'Twice-daily research summaries synthesized from ~50 sources.',
})

// Do not cache — briefs update twice daily
export const revalidate = 3600

export default async function BriefsPage() {
  const briefs = await listBriefs()

  return (
    <main className="py-12">
      <div className="ri-page-bg">
        <h1 className="ri-heading text-4xl font-bold mb-4">AI/ML Briefs</h1>
        <p className="text-gray-400 mb-2">
          Twice-daily research summaries synthesized from ~50 sources.
        </p>
        <p className="text-xs text-gray-600 mb-10">
          Generated automatically by the NewsBlur → LLM pipeline. Not hand-authored.
        </p>

        {briefs.length === 0 ? (
          <div className="glass p-8 text-center">
            <p className="text-gray-400">No briefs available yet.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {briefs.map((brief) => (
              <li key={brief.id}>
                <Link href={`/briefs/${brief.id}`} className="block group">
                  <article className="glass border-l-[3px] border-[color:var(--ri-accent)] hover:bg-white/[0.06] transition-colors p-6">
                    <div className="flex items-center gap-3 mb-2 text-xs text-gray-500">
                      <time dateTime={brief.date}>
                        {format(new Date(brief.date), 'MMMM d, yyyy · h:mm a')}
                      </time>
                      <span>·</span>
                      <span>{brief.items.length} items</span>
                      <span>·</span>
                      <span>{brief.category}</span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-100 group-hover:text-[color:var(--ri-accent)] transition-colors mb-1">
                      {brief.title}
                    </h2>
                    <p className="text-gray-400 text-sm line-clamp-2">{brief.summary}</p>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
```

**Step 2: Build and lint**

```bash
npm run build && npm run lint
```

Expected: build succeeds. The page renders empty state (no `BRIEFS_TABLE_NAME` env var in dev).

**Step 3: Commit**

```bash
git add src/app/briefs/page.tsx
git commit -m "feat: implement briefs listing page (DynamoDB-backed)"
```

---

## Task 10: Briefs Detail Page

**Files:**
- Create: `src/app/briefs/[id]/page.tsx`

**Step 1: Create `src/app/briefs/[id]/page.tsx`**

This is also a Server Component — dynamic route, fetches a single brief by id.

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { getBrief } from '@/lib/briefs'
import { genPageMetadata } from '../../seo'

interface Props {
  params: Promise<{ id: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const brief = await getBrief(id)
  if (!brief) return {}
  return genPageMetadata({
    title: brief.title,
    description: brief.summary,
  })
}

export default async function BriefDetailPage({ params }: Props) {
  const { id } = await params
  const brief = await getBrief(id)

  if (!brief) notFound()

  return (
    <main className="py-12">
      <article>
        <header className="mb-8">
          <Link href="/briefs" className="ri-link text-sm mb-6 inline-block">
            ← All briefs
          </Link>
          <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
            <time dateTime={brief.date}>
              {format(new Date(brief.date), 'MMMM d, yyyy · h:mm a')}
            </time>
            <span>·</span>
            <span>{brief.items.length} items</span>
            <span>·</span>
            <span>{brief.category}</span>
          </div>
          <h1 className="ri-heading text-4xl font-bold mb-4">{brief.title}</h1>
          <p className="text-gray-400 text-lg">{brief.summary}</p>
        </header>

        <hr className="ri-divider mb-10" />

        <ul className="space-y-8">
          {brief.items.map((item, i) => (
            <li key={i} className="glass p-6">
              <div className="flex items-start justify-between gap-4 mb-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ri-link font-semibold text-base leading-snug"
                >
                  {item.title}
                </a>
              </div>
              <p className="text-xs text-gray-500 mb-3">{item.source}</p>
              <p className="text-gray-300 text-sm">{item.summary}</p>
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </article>
    </main>
  )
}
```

**Step 2: Build and lint**

```bash
npm run build && npm run lint
```

Expected: clean.

**Step 3: Commit**

```bash
git add src/app/briefs/
git commit -m "feat: implement briefs detail page"
```

---

## Task 11: RSS Feed Route Handler

**Files:**
- Create: `src/app/feed.xml/route.ts`

This mirrors the pattern already used by `src/app/sitemap.xml/route.ts` and `src/app/robots.txt/route.ts` — a standard Next.js App Router route handler that returns a `Response`. No external RSS library needed.

**Step 1: Create `src/app/feed.xml/route.ts`**

```typescript
import { allPosts } from 'contentlayer/generated'
import { compareDesc } from 'date-fns'
import { getBaseUrl } from '@/lib/baseUrl'

export async function GET() {
  const base = getBaseUrl()

  const posts = allPosts
    .filter((p) => p.access === 'public')
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))

  const items = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${base}/blog/${post.slug}</link>
      <guid isPermaLink="true">${base}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`
    )
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Recursive Intelligence</title>
    <link>${base}</link>
    <description>Exploring AI, systems thinking, and philosophy of mind.</description>
    <language>en-us</language>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  })
}
```

**Step 2: Add `<link>` autodiscovery tag to `src/app/layout.tsx`**

Inside the `<head>` block (after the existing Mastodon `<link rel="me">`), add:

```tsx
<link
  rel="alternate"
  type="application/rss+xml"
  title="Recursive Intelligence"
  href="/feed.xml"
/>
```

**Step 3: Build and lint**

```bash
npm run build && npm run lint
```

**Step 4: Commit**

```bash
git add src/app/feed.xml/ src/app/layout.tsx
git commit -m "feat: add RSS feed route handler at /feed.xml"
```

---

## Task 12: Newsletter Subscribe Scaffold

**Files:**
- Create: `src/app/api/newsletter/subscribe/route.ts`

This route handler is scaffolded but not wired to any provider. It validates the request shape and returns a placeholder response. Buttondown API integration comes in Phase 3 when the API key is available.

**Step 1: Create `src/app/api/newsletter/subscribe/route.ts`**

```typescript
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).email !== 'string' ||
    !(body as Record<string, unknown>).email
  ) {
    return Response.json({ error: 'email is required' }, { status: 400 })
  }

  // TODO (Phase 3): wire to Buttondown API
  // const email = (body as { email: string }).email
  // await fetch('https://api.buttondown.email/v1/subscribers', {
  //   method: 'POST',
  //   headers: {
  //     Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ email }),
  // })

  return Response.json(
    { message: 'Newsletter subscribe endpoint scaffolded — Buttondown integration coming in Phase 3.' },
    { status: 200 }
  )
}
```

**Step 2: Build and lint**

```bash
npm run build && npm run lint
```

**Step 3: Commit**

```bash
git add src/app/api/
git commit -m "feat: scaffold /api/newsletter/subscribe route (Buttondown wiring in Phase 3)"
```

---

## Task 13: Update Sitemap to Include Blog Posts

**Files:**
- Modify: `src/app/sitemap.xml/route.ts`

**Step 1: Update `src/app/sitemap.xml/route.ts`**

Replace the entire file:

```typescript
import { allPosts } from 'contentlayer/generated'
import { getBaseUrl } from '@/lib/baseUrl'

export async function GET() {
  const base = getBaseUrl()

  const staticPaths = ['/', '/about', '/blog', '/briefs']

  const blogPaths = allPosts
    .filter((p) => p.access === 'public')
    .map((p) => `/blog/${p.slug}`)

  const urls = [...staticPaths, ...blogPaths]
    .map((p) => `<url><loc>${base}${p}</loc></url>`)
    .join('')

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`

  return new Response(xml, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  })
}
```

**Step 2: Build and lint**

```bash
npm run build && npm run lint
```

Expected: `/blog/hello-world` appears in the sitemap output.

**Step 3: Commit**

```bash
git add src/app/sitemap.xml/route.ts
git commit -m "feat: include published blog posts in sitemap"
```

---

## Task 14: Update `.env.example`

**Files:**
- Modify: `.env.example`

**Step 1: Replace `.env.example`**

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://recursiveintelligence.io
NEXT_PUBLIC_GARDEN_URL=https://recursiveintelligence.xyz

# Briefs — DynamoDB-backed, generated by the NewsBlur → LLM Lambda pipeline
# Table name for the briefs DynamoDB table (us-east-2)
BRIEFS_TABLE_NAME=your-briefs-table-name
# AWS credentials for DynamoDB access (server-side only — NOT NEXT_PUBLIC_)
# When deployed on Amplify/Lambda, use IAM role instead of explicit keys
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-2

# Newsletter — Buttondown (Phase 3)
# BUTTONDOWN_API_KEY=your-buttondown-api-key

# Analytics — CloudWatch RUM (Module 6)
# NEXT_PUBLIC_AWS_RUM_APPLICATION_ID=
# NEXT_PUBLIC_AWS_RUM_IDENTITY_POOL_ID=
# NEXT_PUBLIC_AWS_RUM_REGION=us-east-2

# Development
NODE_ENV=development
```

**Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: update .env.example with Module 2 env vars"
```

---

## Task 15: Final Build Verification + PR

**Step 1: Full build and lint**

```bash
npm run build && npm run lint
```

Expected:
- Build succeeds with all routes listed
- `npm run lint` exits 0 (one pre-existing warning about `eslint-disable` in `seo.tsx` is acceptable)

**Step 2: Verify routes visually**

Start the dev server and spot-check:

```bash
npm run dev
```

Check:
- `http://localhost:3000/blog` — article listing with hello-world post
- `http://localhost:3000/blog/hello-world` — article detail, prose renders correctly
- `http://localhost:3000/briefs` — shows empty state (no `BRIEFS_TABLE_NAME` in dev)
- `http://localhost:3000/feed.xml` — valid RSS XML with hello-world entry
- `http://localhost:3000/sitemap.xml` — includes `/blog/hello-world`
- `http://localhost:3000/api/newsletter/subscribe` POST with `{"email":"test@example.com"}` — returns 200 JSON

**Step 3: Push and open PR**

```bash
git push origin dev
gh pr create \
  --title "Module 2: Blog infrastructure & briefs integration" \
  --base main \
  --body "$(cat <<'EOF'
## Summary

- MDX blog system via contentlayer2: listing page, detail page, static params generation
- Post schema with title/description/date/tags/featured/coverImage/access (public|members|paid) + computed slug/readingTime
- DynamoDB-backed Briefs: TypeScript interface, DynamoDB Document Client library, listing + detail pages (graceful empty state when BRIEFS_TABLE_NAME unset)
- RSS feed route handler at /feed.xml (mirrors sitemap.xml pattern)
- Scaffolded /api/newsletter/subscribe — validates input, returns placeholder (Buttondown wiring in Phase 3)
- Sitemap updated to include published blog post slugs
- .env.example updated with BRIEFS_TABLE_NAME and AWS_REGION

## Architecture note
Blog (contentlayer2/MDX) and Briefs (DynamoDB) are intentionally separate systems with no shared code path.

## Test plan
- [ ] npm run build passes
- [ ] npm run lint clean
- [ ] /blog lists hello-world post
- [ ] /blog/hello-world renders prose correctly
- [ ] /briefs shows graceful empty state
- [ ] /feed.xml returns valid RSS
- [ ] /sitemap.xml includes /blog/hello-world
- [ ] POST /api/newsletter/subscribe with valid email returns 200
- [ ] POST /api/newsletter/subscribe without email returns 400
EOF
)"
```

---

## Reference: CSS Classes Available

When implementing the UI tasks, use these existing classes from `globals.css`:

| Class | Use |
|---|---|
| `.glass` | Frosted panel (bg 3% white, 1px white/12 border, 16px radius, backdrop blur) |
| `.ri-heading` | Orange accent underline on heading |
| `.ri-link` | Orange link (`var(--ri-accent)`) |
| `.ri-divider` | 1px orange-gradient horizontal rule |
| `.ri-page-bg` | Page wrapper with subtle top glow |
| `.ri-section` | Section with top border + margin |
| `text-gray-400` | Muted body text |
| `text-gray-500` | Very muted / metadata text |
| `prose prose-invert` | Tailwind typography for MDX content (dark mode) |

Orange accent color: `var(--ri-accent)` = `#ff6600`

---

## Reference: Decision Log

| Decision | Choice | Rationale |
|---|---|---|
| Blog CMS | `contentlayer2` + MDX | Git-based, type-safe, build-time, no external deps |
| Briefs source | DynamoDB via AWS SDK v3 | Lambda pipeline writes there; not hand-authored MDX |
| `access` field | `public \| members \| paid` | Baked in now; auth enforcement is Phase 3+ |
| RSS | Next.js route handler at `/feed.xml` | Consistent with existing sitemap.xml pattern |
| Newsletter | Scaffold only (Buttondown in Phase 3) | API key not yet available |
| `pliny` library | Skip | Would fight the existing design system |
| Brief detail URL | `/briefs/[id]` (not `/briefs/[slug]`) | DynamoDB partition key is `id`, not a slug |
