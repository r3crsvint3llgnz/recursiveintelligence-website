# AI/ML Reading List + RSS Feed Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `/reading-list` page and `/rss/reading-list.xml` feed powered by a Raindrop.io collection, plus a third CTA button in the HomeHero.

**Architecture:** A shared `fetchReadingList()` utility fetches from the Raindrop REST API with ISR caching (1h). The page renders items as a list; a separate route handler generates RSS 2.0 XML from the same data using a pure `buildRssXml()` helper.

**Tech Stack:** Next.js 15 App Router, TypeScript, Raindrop REST API v1, Vitest for unit tests. No new npm packages.

---

## Prerequisites (manual — do before starting)

1. Get the Raindrop token from SSM:
   ```bash
   aws ssm get-parameter --name /prod/ResearchAgent/Raindrop_Token \
     --with-decryption --region us-east-1 --profile seth-dev \
     --query Parameter.Value --output text
   ```
2. Add `RAINDROP_TOKEN=<value>` to `.env.local`
3. Add `RAINDROP_TOKEN=<value>` to Amplify console:
   - URL: https://us-east-2.console.aws.amazon.com/amplify/apps/d2dmx5f9lbvzyb/settings/variables
   - This makes it available at build time for the SSR Lambda

---

## Task 1: Wire RAINDROP_TOKEN env var

**Files:**
- Modify: `next.config.ts`
- Modify: `.env.example`

**Step 1: Add to next.config.ts env block**

Open `next.config.ts`. In the `env` object, add after the last entry:
```typescript
RAINDROP_TOKEN: process.env.RAINDROP_TOKEN ?? '',
```

Final `env` block should look like:
```typescript
env: {
  BRIEF_API_KEY:               process.env.BRIEF_API_KEY               ?? '',
  APP_REGION:                  process.env.APP_REGION                  ?? 'us-east-1',
  BRIEFS_TABLE_NAME:           process.env.BRIEFS_TABLE_NAME           ?? 'briefs',
  BRIEFS_AWS_ACCESS_KEY_ID:    process.env.BRIEFS_AWS_ACCESS_KEY_ID    ?? '',
  BRIEFS_AWS_SECRET_ACCESS_KEY: process.env.BRIEFS_AWS_SECRET_ACCESS_KEY ?? '',
  OWNER_ACCESS_TOKEN:          process.env.OWNER_ACCESS_TOKEN          ?? '',
  STRIPE_SECRET_KEY:           process.env.STRIPE_SECRET_KEY           ?? '',
  STRIPE_WEBHOOK_SECRET:       process.env.STRIPE_WEBHOOK_SECRET       ?? '',
  STRIPE_PRICE_MONTHLY_ID:     process.env.STRIPE_PRICE_MONTHLY_ID     ?? '',
  STRIPE_PRICE_ANNUAL_ID:      process.env.STRIPE_PRICE_ANNUAL_ID      ?? '',
  STRIPE_PRICE_PATRON_ID:      process.env.STRIPE_PRICE_PATRON_ID      ?? '',
  BRIEF_SESSIONS_TABLE_NAME:   process.env.BRIEF_SESSIONS_TABLE_NAME   ?? 'brief_sessions',
  BRIEF_SESSIONS_AWS_ACCESS_KEY_ID:    process.env.BRIEF_SESSIONS_AWS_ACCESS_KEY_ID    ?? '',
  BRIEF_SESSIONS_AWS_SECRET_ACCESS_KEY: process.env.BRIEF_SESSIONS_AWS_SECRET_ACCESS_KEY ?? '',
  RAINDROP_TOKEN:              process.env.RAINDROP_TOKEN              ?? '',
},
```

**Step 2: Document in .env.example**

Add after the `# Brief Ingestion API` block:
```
# Raindrop (Reading List)
RAINDROP_TOKEN=your-raindrop-test-token
```

**Step 3: Commit**
```bash
git add next.config.ts .env.example
git commit -m "feat: add RAINDROP_TOKEN env var"
```

---

## Task 2: Raindrop fetch utility + tests

**Files:**
- Create: `src/lib/raindrop.ts`
- Create: `src/lib/raindrop.test.ts`

**Step 1: Write the failing tests**

Create `src/lib/raindrop.test.ts`:
```typescript
import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchReadingList } from './raindrop'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchReadingList', () => {
  it('returns items from Raindrop API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            _id: 1,
            title: 'Test Article',
            link: 'https://example.com/article',
            note: 'A useful summary.',
            created: '2026-01-01T00:00:00.000Z',
            tags: ['llm'],
          },
        ],
      }),
    }))

    const items = await fetchReadingList()

    expect(items).toHaveLength(1)
    expect(items[0].title).toBe('Test Article')
    expect(items[0].note).toBe('A useful summary.')
  })

  it('calls the correct Raindrop collection endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await fetchReadingList()

    const [url] = mockFetch.mock.calls[0] as [string, unknown]
    expect(url).toContain('67035667')
    expect(url).toContain('api.raindrop.io')
  })

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }))

    await expect(fetchReadingList()).rejects.toThrow('Raindrop API error: 401')
  })
})
```

**Step 2: Run tests — verify they fail**
```bash
cd recursiveintelligence-website && npm test -- raindrop.test.ts
```
Expected: FAIL with "Cannot find module './raindrop'"

**Step 3: Implement the utility**

Create `src/lib/raindrop.ts`:
```typescript
export interface RaindropItem {
  _id: number
  title: string
  link: string
  note: string
  created: string
  tags: string[]
}

const COLLECTION_ID = '67035667'

export async function fetchReadingList(): Promise<RaindropItem[]> {
  const res = await fetch(
    `https://api.raindrop.io/rest/v1/raindrops/${COLLECTION_ID}?perpage=50&sort=-created`,
    {
      headers: { Authorization: `Bearer ${process.env.RAINDROP_TOKEN}` },
      next: { revalidate: 3600 },
    }
  )
  if (!res.ok) throw new Error(`Raindrop API error: ${res.status}`)
  const data = (await res.json()) as { items: RaindropItem[] }
  return data.items
}
```

**Step 4: Run tests — verify they pass**
```bash
npm test -- raindrop.test.ts
```
Expected: 3 passing

**Step 5: Commit**
```bash
git add src/lib/raindrop.ts src/lib/raindrop.test.ts
git commit -m "feat: add Raindrop fetch utility"
```

---

## Task 3: RSS feed route handler + tests

**Files:**
- Create: `src/app/rss/reading-list.xml/route.ts`
- Create: `src/app/rss/reading-list.xml/route.test.ts`

**Step 1: Write the failing tests**

Create `src/app/rss/reading-list.xml/route.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { buildRssXml } from './route'
import type { RaindropItem } from '@/lib/raindrop'

const baseUrl = 'https://recursiveintelligence.io'

const sampleItems: RaindropItem[] = [
  {
    _id: 1,
    title: 'GPT-5 Released',
    link: 'https://openai.com/gpt5',
    note: 'Major capability jump with new reasoning modes.',
    created: '2026-01-15T10:00:00.000Z',
    tags: ['llm', 'openai'],
  },
  {
    _id: 2,
    title: 'Diffusion Model Survey',
    link: 'https://arxiv.org/abs/2601.00001',
    note: '',
    created: '2026-01-10T08:00:00.000Z',
    tags: [],
  },
]

describe('buildRssXml', () => {
  it('returns valid RSS 2.0 envelope', () => {
    const xml = buildRssXml([], baseUrl)
    expect(xml).toContain('<?xml version="1.0"')
    expect(xml).toContain('<rss version="2.0"')
    expect(xml).toContain('</rss>')
  })

  it('includes channel title and link', () => {
    const xml = buildRssXml([], baseUrl)
    expect(xml).toContain('AI/ML Reading List')
    expect(xml).toContain(`${baseUrl}/reading-list`)
  })

  it('renders item title in CDATA', () => {
    const xml = buildRssXml(sampleItems, baseUrl)
    expect(xml).toContain('<![CDATA[GPT-5 Released]]>')
  })

  it('renders item link', () => {
    const xml = buildRssXml(sampleItems, baseUrl)
    expect(xml).toContain('<link>https://openai.com/gpt5</link>')
  })

  it('renders note as description in CDATA', () => {
    const xml = buildRssXml(sampleItems, baseUrl)
    expect(xml).toContain('<![CDATA[Major capability jump with new reasoning modes.]]>')
  })

  it('includes pubDate', () => {
    const xml = buildRssXml(sampleItems, baseUrl)
    // toUTCString output varies, just check the year
    expect(xml).toContain('2026')
  })

  it('handles empty note gracefully', () => {
    const xml = buildRssXml(sampleItems, baseUrl)
    // item with empty note should still produce a description tag
    expect(xml).toContain('<description><![CDATA[]]></description>')
  })
})
```

**Step 2: Run tests — verify they fail**
```bash
npm test -- "reading-list.xml/route.test.ts"
```
Expected: FAIL with "Cannot find module './route'"

**Step 3: Implement the route**

Create `src/app/rss/reading-list.xml/route.ts`:
```typescript
import { fetchReadingList } from '@/lib/raindrop'
import { getBaseUrl } from '@/lib/baseUrl'
import type { RaindropItem } from '@/lib/raindrop'

export function buildRssXml(items: RaindropItem[], baseUrl: string): string {
  const itemsXml = items
    .map(
      (item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
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
```

**Step 4: Run tests — verify they pass**
```bash
npm test -- "reading-list.xml/route.test.ts"
```
Expected: 7 passing

**Step 5: Commit**
```bash
git add src/app/rss/reading-list.xml/route.ts src/app/rss/reading-list.xml/route.test.ts
git commit -m "feat: add RSS feed route for reading list"
```

---

## Task 4: Reading list page

**Files:**
- Create: `src/app/reading-list/page.tsx`

No unit tests for the page component — it's a thin async server component; the build step (`npm run build`) acts as the integration test.

**Step 1: Create the page**

Create `src/app/reading-list/page.tsx`:
```tsx
import Link from 'next/link'
import { fetchReadingList } from '@/lib/raindrop'
import { genPageMetadata } from '../seo'

export const revalidate = 3600

export const metadata = genPageMetadata({
  title: 'AI/ML Reading List',
  description:
    'Curated AI/ML news and research with summaries — updated continuously.',
})

export default async function ReadingListPage() {
  let items = await fetchReadingList()

  return (
    <>
      <div className="mb-8">
        <h1 className="ri-heading text-4xl font-extrabold tracking-tight mb-3">
          AI/ML Reading List
        </h1>
        <p className="text-gray-400">
          Curated links with summaries.{' '}
          <a
            href="/rss/reading-list.xml"
            className="ri-link text-sm"
          >
            RSS feed ↗
          </a>
        </p>
      </div>

      {items.length === 0 && (
        <p className="text-gray-500">No items yet.</p>
      )}

      <ul className="space-y-8">
        {items.map((item) => (
          <li key={item._id} className="glass p-5 rounded-lg">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="ri-link text-lg font-semibold leading-snug"
            >
              {item.title}
            </a>
            {item.note && (
              <p className="mt-2 text-gray-300 text-sm leading-relaxed">
                {item.note}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <time dateTime={item.created}>
                {new Date(item.created).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded border border-gray-700 text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
```

**Step 2: Verify no TypeScript errors**
```bash
cd recursiveintelligence-website && npx tsc --noEmit
```
Expected: no errors

**Step 3: Commit**
```bash
git add src/app/reading-list/page.tsx
git commit -m "feat: add reading list page"
```

---

## Task 5: HomeHero — add AI/ML News CTA

**Files:**
- Modify: `src/components/HomeHero.tsx`

**Step 1: Add the third button**

In `src/components/HomeHero.tsx`, add the import at the top:
```tsx
import Link from 'next/link'
```

Then in the `<div>` containing the two existing buttons, add a third button after "View Research":
```tsx
<Link
  href="/reading-list"
  className="inline-flex items-center justify-center px-6 py-3 rounded-md text-base font-semibold border-2 border-[color:var(--ri-accent)] text-[color:var(--ri-accent)] hover:bg-[color:var(--ri-accent)] hover:text-black transition-colors"
  aria-label="Browse curated AI/ML news"
>
  AI/ML News
</Link>
```

The full button `<div>` should look like:
```tsx
<div
  className="ri-fade-up flex flex-col sm:flex-row gap-3 mt-8"
  style={{ animationDelay: "320ms" }}
>
  <a
    href="https://substack.com/@r3crsvint3llgnz"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center justify-center px-6 py-3 rounded-md text-base font-semibold bg-[color:var(--ri-accent)] text-black hover:bg-[color:var(--ri-accent-700)] transition-colors"
    aria-label="Subscribe to Recursive Intelligence newsletter"
  >
    Subscribe to Newsletter
  </a>
  <a
    href="https://github.com/r3crsvint3llgnz/recursive-prompting"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center justify-center px-6 py-3 rounded-md text-base font-semibold border-2 border-[color:var(--ri-accent)] text-[color:var(--ri-accent)] hover:bg-[color:var(--ri-accent)] hover:text-black transition-colors"
    aria-label="View Recursive Prompting research on GitHub"
  >
    View Research
  </a>
  <Link
    href="/reading-list"
    className="inline-flex items-center justify-center px-6 py-3 rounded-md text-base font-semibold border-2 border-[color:var(--ri-accent)] text-[color:var(--ri-accent)] hover:bg-[color:var(--ri-accent)] hover:text-black transition-colors"
    aria-label="Browse curated AI/ML news"
  >
    AI/ML News
  </Link>
</div>
```

**Step 2: Commit**
```bash
git add src/components/HomeHero.tsx
git commit -m "feat: add AI/ML News CTA to HomeHero"
```

---

## Task 6: Sitemap update

**Files:**
- Modify: `src/app/sitemap.xml/route.ts`

**Step 1: Add /reading-list to static paths**

In `src/app/sitemap.xml/route.ts`, update the `staticPaths` array:
```typescript
const staticPaths = ["/", "/about", "/blog", "/briefs", "/subscribe", "/support", "/reading-list"];
```

**Step 2: Commit**
```bash
git add src/app/sitemap.xml/route.ts
git commit -m "feat: add /reading-list to sitemap"
```

---

## Task 7: Build verification

**Step 1: Run full test suite**
```bash
cd recursiveintelligence-website && npm test
```
Expected: all tests pass (raindrop + RSS + existing tests)

**Step 2: Production build**
```bash
npm run build
```
Expected: exits 0, no TypeScript or lint errors. You should see `/reading-list` and `/rss/reading-list.xml` in the route output.

**Step 3: Smoke test locally**
```bash
npm run start
```
- Visit http://localhost:3000 — confirm "AI/ML News" button appears in hero
- Visit http://localhost:3000/reading-list — page renders (may show empty or items depending on token in .env.local)
- Visit http://localhost:3000/rss/reading-list.xml — should return XML with `Content-Type: application/rss+xml`

**Step 4: Push to main**
```bash
git push origin main
```
Amplify will pick up the push and rebuild. Monitor at:
```bash
aws amplify list-jobs --app-id d2dmx5f9lbvzyb --branch-name main \
  --region us-east-2 --profile seth-dev --query 'jobSummaries[0]'
```
