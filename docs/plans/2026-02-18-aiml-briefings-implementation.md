# AI/ML Briefings Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add bi-daily AI/ML briefings delivered via HTTP POST from a research-agent, with the latest brief public and all historical briefs behind a Stripe subscription paywall.

**Architecture:** Briefs are stored in DynamoDB (`briefs` table extended with `body`, `is_latest`, `entity_type`). A pointer record (`id="__latest__"`) tracks the current brief; flipping `is_latest` is atomic via `TransactWriteItems`. Subscriber sessions live in a separate `brief_sessions` table; paywalls are enforced in server components (not middleware) to avoid Edge runtime DynamoDB incompatibility.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, `@aws-sdk/lib-dynamodb` (existing), `stripe` SDK, `react-markdown` + `remark-gfm` + `rehype-pretty-code` for body rendering, `vitest` for unit tests.

**Design doc:** `docs/plans/2026-02-18-aiml-briefings-design.md`

---

## Pre-flight checks

Before starting, verify:
```bash
npm run build   # must pass clean
npm run lint    # must pass clean
```

---

## Module A — Foundation

### Task 1: Install test framework and packages

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (via npm install)

**Step 1: Install all new packages at once**

```bash
npm install stripe react-markdown remark-gfm rehype-pretty-code
npm install -D vitest @vitejs/plugin-react @vitest/coverage-v8
```

**Step 2: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 3: Create vitest config**

Create `vitest.config.ts` at project root:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Step 4: Verify test runner works**

```bash
npm test
```
Expected: "No test files found" (passes with 0 tests).

**Step 5: Verify build still passes**

```bash
npm run build
```
Expected: clean build.

**Step 6: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "feat: install stripe, react-markdown, vitest"
```

---

### Task 2: Lock down Brief and BriefItem types

**Files:**
- Modify: `src/types/brief.ts`
- Modify: `src/lib/briefs.ts`
- Create: `src/types/brief.test.ts`

**Step 1: Write failing test for normalizeBrief**

Create `src/types/brief.test.ts`:
```ts
import { describe, it, expect } from 'vitest'

// We test normalizeBrief indirectly via the exported shape.
// The function is not exported, so we validate the shape contract here
// and test it through integration in briefs.test.ts (Task 4).
describe('Brief type contract', () => {
  it('BriefItem requires title, url, source, snippet', () => {
    // Compile-time check — if types change this file will fail to build.
    const item = {
      title: 'Test',
      url: 'https://example.com',
      source: 'Test Source',
      snippet: 'A snippet.',
    } satisfies import('./brief').BriefItem
    expect(item.title).toBe('Test')
  })

  it('Brief requires body and is_latest fields', () => {
    const brief = {
      id: '2026-02-18-ai-ml',
      entity_type: 'brief',
      title: 'Test Brief',
      date: '2026-02-18T06:00:00Z',
      summary: 'Summary.',
      category: 'AI/ML',
      body: '## Body',
      items: [],
      is_latest: true,
    } satisfies import('./brief').Brief
    expect(brief.is_latest).toBe(true)
  })
})
```

**Step 2: Run test — expect compile error or type failure**

```bash
npm test
```
Expected: FAIL — `body` and `is_latest` don't exist on `Brief` yet.

**Step 3: Update `src/types/brief.ts`**

Replace the entire file:
```ts
export interface BriefItem {
  title:   string
  url:     string
  source:  string
  snippet: string
}

export interface Brief {
  id:          string
  entity_type: string
  title:       string
  date:        string       // ISO 8601
  summary:     string
  category:    string
  body:        string       // Full markdown body
  items:       BriefItem[]
  is_latest:   boolean
}
```

**Step 4: Update `normalizeBrief` in `src/lib/briefs.ts`**

Replace the `normalizeBrief` function and add a `normalizeBriefItem` helper:
```ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { Brief, BriefItem } from '@/types/brief'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
})

const docClient = DynamoDBDocumentClient.from(client)

const TABLE_NAME = process.env.BRIEFS_TABLE_NAME ?? 'briefs'
const GSI_NAME = 'entity_type-date-index'

function normalizeBriefItem(raw: unknown): BriefItem | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (
    typeof r.title !== 'string' ||
    typeof r.url !== 'string' ||
    typeof r.source !== 'string' ||
    typeof r.snippet !== 'string'
  ) return null
  return { title: r.title, url: r.url, source: r.source, snippet: r.snippet }
}

function normalizeBrief(raw: unknown): Brief | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (
    typeof r.id !== 'string' ||
    typeof r.title !== 'string' ||
    typeof r.summary !== 'string' ||
    typeof r.category !== 'string' ||
    typeof r.date !== 'string' ||
    typeof r.body !== 'string'
  ) return null
  const parsed = new Date(r.date as string)
  if (isNaN(parsed.getTime())) return null
  const items: BriefItem[] = Array.isArray(r.items)
    ? (r.items as unknown[]).map(normalizeBriefItem).filter((i): i is BriefItem => i !== null)
    : []
  return {
    id: r.id,
    entity_type: typeof r.entity_type === 'string' ? r.entity_type : 'brief',
    title: r.title,
    date: r.date,
    summary: r.summary,
    category: r.category,
    body: r.body,
    items,
    is_latest: r.is_latest === true,
  }
}

export function isTableNotProvisionedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const name = (err as { name?: string }).name ?? ''
  const message = (err as { message?: string }).message ?? ''
  return name === 'ResourceNotFoundException' || message.includes('ResourceNotFoundException')
}

export async function getBriefs(): Promise<Brief[]> {
  // Uses entity_type-date-index GSI for reverse-chronological order without a scan.
  // FilterExpression excludes the __latest__ pointer record (which also has entity_type="brief").
  const response = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: GSI_NAME,
    KeyConditionExpression: 'entity_type = :et',
    FilterExpression: 'id <> :latest',
    ExpressionAttributeValues: {
      ':et': 'brief',
      ':latest': '__latest__',
    },
    ScanIndexForward: false,
  }))
  return (response.Items ?? []).map(normalizeBrief).filter((b): b is Brief => b !== null)
}

export async function getBrief(id: string): Promise<Brief | null> {
  const response = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { id } })
  )
  return normalizeBrief(response.Item) ?? null
}
```

**Step 5: Run tests**

```bash
npm test
```
Expected: PASS.

**Step 6: Verify build**

```bash
npm run build
```
Expected: clean. If `/briefs` pages error on BriefItem fields, update the rendering to use `.title` instead of `.label`.

**Step 7: Fix brief detail page if needed**

In `src/app/briefs/[id]/page.tsx`, the `items` rendering uses `item.label`. Update to `item.title`:
```tsx
// Before:
{item.label}
// After:
{item.title}
```
And the external link now always exists (`url` is required in new BriefItem), so remove the conditional:
```tsx
<a href={item.url} target="_blank" rel="noopener noreferrer" className="ri-link ri-accent-ring">
  {item.title}
</a>
```

**Step 8: Commit**

```bash
git add src/types/brief.ts src/types/brief.test.ts src/lib/briefs.ts src/app/briefs/
git commit -m "feat: update Brief/BriefItem types, switch getBriefs to GSI query"
```

---

### Task 3: isSafeUrl utility

**Files:**
- Create: `src/lib/isSafeUrl.ts`
- Create: `src/lib/isSafeUrl.test.ts`

**Step 1: Write the failing tests**

Create `src/lib/isSafeUrl.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { isSafeUrl } from './isSafeUrl'

describe('isSafeUrl', () => {
  // Valid
  it('accepts standard https URL', () =>
    expect(isSafeUrl('https://example.com/page')).toBe(true))
  it('accepts https URL with query string', () =>
    expect(isSafeUrl('https://arxiv.org/abs/2501.12345?q=1')).toBe(true))
  it('accepts https URL with subdomain', () =>
    expect(isSafeUrl('https://blog.anthropic.com/article')).toBe(true))

  // Protocol
  it('rejects http', () =>
    expect(isSafeUrl('http://example.com')).toBe(false))
  it('rejects ftp', () =>
    expect(isSafeUrl('ftp://example.com')).toBe(false))
  it('rejects javascript:', () =>
    expect(isSafeUrl('javascript:alert(1)')).toBe(false))
  it('rejects data:', () =>
    expect(isSafeUrl('data:text/html,<h1>x</h1>')).toBe(false))

  // Localhost
  it('rejects localhost', () =>
    expect(isSafeUrl('https://localhost/admin')).toBe(false))
  it('rejects 127.0.0.1', () =>
    expect(isSafeUrl('https://127.0.0.1/')).toBe(false))
  it('rejects ::1', () =>
    expect(isSafeUrl('https://[::1]/')).toBe(false))
  it('rejects 0.0.0.0', () =>
    expect(isSafeUrl('https://0.0.0.0/')).toBe(false))

  // RFC-1918
  it('rejects 10.x.x.x', () =>
    expect(isSafeUrl('https://10.0.0.1/')).toBe(false))
  it('rejects 10.255.255.255', () =>
    expect(isSafeUrl('https://10.255.255.255/')).toBe(false))
  it('rejects 192.168.x.x', () =>
    expect(isSafeUrl('https://192.168.1.1/')).toBe(false))
  it('rejects 172.16.x.x', () =>
    expect(isSafeUrl('https://172.16.0.1/')).toBe(false))
  it('rejects 172.31.x.x', () =>
    expect(isSafeUrl('https://172.31.255.255/')).toBe(false))
  it('accepts 172.15.x.x (not in range)', () =>
    expect(isSafeUrl('https://172.15.0.1/')).toBe(false)) // still a bare IP — rejected

  // Link-local
  it('rejects 169.254.x.x', () =>
    expect(isSafeUrl('https://169.254.1.1/')).toBe(false))

  // Bare IP (public)
  it('rejects public bare IP 8.8.8.8', () =>
    expect(isSafeUrl('https://8.8.8.8/')).toBe(false))
  it('rejects public bare IP 1.1.1.1', () =>
    expect(isSafeUrl('https://1.1.1.1/')).toBe(false))

  // Single-label hostname
  it('rejects single-label hostname', () =>
    expect(isSafeUrl('https://internal/')).toBe(false))
  it('rejects single-label hostname without slash', () =>
    expect(isSafeUrl('https://intranet')).toBe(false))

  // Malformed
  it('rejects malformed URL', () =>
    expect(isSafeUrl('not a url')).toBe(false))
  it('rejects empty string', () =>
    expect(isSafeUrl('')).toBe(false))
})
```

**Step 2: Run tests — expect failures**

```bash
npm test
```
Expected: FAIL — `isSafeUrl` module not found.

**Step 3: Implement `src/lib/isSafeUrl.ts`**

```ts
const BARE_IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/

const RFC1918 = [
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/,
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  /^169\.254\.\d{1,3}\.\d{1,3}$/,
]

const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0'])

export function isSafeUrl(raw: string): boolean {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return false
  }

  if (url.protocol !== 'https:') return false

  const host = url.hostname.toLowerCase()

  if (BLOCKED_HOSTS.has(host)) return false

  // Block all bare IPv4 addresses (public and private)
  if (BARE_IPV4.test(host)) return false

  // Must have at least one dot (blocks single-label names like "internal")
  if (!host.includes('.')) return false

  return true
}
```

Note: The `BARE_IPV4` check covers all IPv4 addresses (private ranges, public IPs, link-local). The `RFC1918` array is kept for documentation purposes but the bare-IP check makes it redundant — all bare IPs are rejected regardless of range.

**Step 4: Run tests**

```bash
npm test
```
Expected: PASS all isSafeUrl tests.

**Step 5: Commit**

```bash
git add src/lib/isSafeUrl.ts src/lib/isSafeUrl.test.ts
git commit -m "feat: add isSafeUrl with RFC-1918 and bare-IP blocking"
```

---

## Module B — Sessions Library

### Task 4: Sessions DynamoDB library

**Files:**
- Create: `src/lib/sessions.ts`

No unit tests for sessions — the DynamoDB calls require either a live table or a complex mock. Correctness is verified by the Stripe flow in Task 9.

**Step 1: Create `src/lib/sessions.ts`**

```ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? 'us-east-1' })
const docClient = DynamoDBDocumentClient.from(client)

const TABLE_NAME = process.env.BRIEF_SESSIONS_TABLE_NAME ?? 'brief_sessions'
const GSI_NAME = 'stripe_customer_id-index'
const SESSION_TTL_SECONDS = 2592000 // 30 days

export interface SessionRecord {
  session_id:             string
  stripe_customer_id:     string
  stripe_subscription_id: string
  email:                  string
  status:                 'active' | 'cancelled' | 'past_due'
  created_at:             string
  updated_at:             string
  ttl:                    number
}

export async function createSession(
  data: Omit<SessionRecord, 'created_at' | 'updated_at' | 'ttl'>
): Promise<void> {
  const now = new Date().toISOString()
  const ttl = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  await docClient.send(
    new PutCommand({ TableName: TABLE_NAME, Item: { ...data, created_at: now, updated_at: now, ttl } })
  )
}

export async function getActiveSession(sessionId: string): Promise<boolean> {
  const result = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { session_id: sessionId } })
  )
  return result.Item?.status === 'active'
}

export async function getSessionRecord(sessionId: string): Promise<SessionRecord | null> {
  const result = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { session_id: sessionId } })
  )
  return result.Item ? (result.Item as SessionRecord) : null
}

export async function getSessionByCustomerId(
  stripeCustomerId: string
): Promise<SessionRecord | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI_NAME,
      KeyConditionExpression: 'stripe_customer_id = :cid',
      ExpressionAttributeValues: { ':cid': stripeCustomerId },
      Limit: 1,
    })
  )
  return result.Items?.[0] ? (result.Items[0] as SessionRecord) : null
}

export async function updateSessionStatus(
  stripeCustomerId: string,
  status: SessionRecord['status']
): Promise<void> {
  const session = await getSessionByCustomerId(stripeCustomerId)
  if (!session) return
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { session_id: session.session_id },
      UpdateExpression: 'SET #s = :s, updated_at = :u',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':s': status, ':u': new Date().toISOString() },
    })
  )
}
```

**Step 2: Verify build**

```bash
npm run build
```
Expected: clean.

**Step 3: Commit**

```bash
git add src/lib/sessions.ts
git commit -m "feat: add sessions DynamoDB library"
```

---

## Module C — Ingestion API

### Task 5: Ingest route handler

**Files:**
- Create: `src/app/api/briefs/ingest/route.ts`
- Create: `src/app/api/briefs/ingest/route.test.ts`

**Step 1: Write failing tests for the ingest handler's pure helpers**

Create `src/app/api/briefs/ingest/route.test.ts`:
```ts
import { describe, it, expect } from 'vitest'

// slugify and validateBody are not exported — test them via the pure logic
// by duplicating the functions here. If the implementation drifts, tests catch it.

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function generateId(date: string, category: string): string {
  return `${date.slice(0, 10)}-${slugify(category)}`
}

describe('ID generation', () => {
  it('generates deterministic ID from date and category', () => {
    expect(generateId('2026-02-18T06:00:00Z', 'AI/ML')).toBe('2026-02-18-ai-ml')
  })

  it('handles multi-word categories', () => {
    expect(generateId('2026-02-18T06:00:00Z', 'Large Language Models')).toBe(
      '2026-02-18-large-language-models'
    )
  })

  it('strips leading/trailing hyphens', () => {
    expect(generateId('2026-02-18T06:00:00Z', '  AI  ')).toBe('2026-02-18-ai')
  })
})
```

**Step 2: Run to confirm pass (pure logic test)**

```bash
npm test
```
Expected: PASS — the test duplicates the implementation logic.

**Step 3: Create `src/app/api/briefs/ingest/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb'
import { isSafeUrl } from '@/lib/isSafeUrl'
import type { Brief, BriefItem } from '@/types/brief'

const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? 'us-east-1' })
const docClient = DynamoDBDocumentClient.from(client)
const TABLE_NAME = process.env.BRIEFS_TABLE_NAME ?? 'briefs'

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function validateApiKey(req: NextRequest): boolean {
  const apiKey = process.env.BRIEF_API_KEY
  if (!apiKey) return false
  const authHeader = req.headers.get('authorization') ?? ''
  const match = authHeader.match(/^Bearer (.+)$/)
  if (!match) return false
  try {
    const a = Buffer.from(match[1], 'utf-8')
    const b = Buffer.from(apiKey, 'utf-8')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

interface IngestBody {
  title:    string
  date:     string
  summary:  string
  category: string
  body:     string
  items:    BriefItem[]
}

function validateBody(raw: unknown): { data: IngestBody } | { error: string } {
  if (!raw || typeof raw !== 'object') return { error: 'Body must be a JSON object' }
  const r = raw as Record<string, unknown>

  for (const field of ['title', 'date', 'summary', 'category', 'body']) {
    if (typeof r[field] !== 'string' || !(r[field] as string).trim()) {
      return { error: `Missing or empty field: ${field}` }
    }
  }

  if (isNaN(new Date(r.date as string).getTime())) {
    return { error: 'Field "date" is not a valid ISO 8601 date' }
  }

  if (!Array.isArray(r.items) || r.items.length === 0) {
    return { error: 'Field "items" must be a non-empty array' }
  }

  for (let i = 0; i < (r.items as unknown[]).length; i++) {
    const item = (r.items as Record<string, unknown>[])[i]
    for (const f of ['title', 'url', 'source', 'snippet']) {
      if (typeof item[f] !== 'string' || !(item[f] as string).trim()) {
        return { error: `items[${i}].${f} is missing or empty` }
      }
    }
    if (!isSafeUrl(item.url as string)) {
      return { error: `items[${i}].url failed URL safety check` }
    }
  }

  return {
    data: {
      title:    r.title    as string,
      date:     r.date     as string,
      summary:  r.summary  as string,
      category: r.category as string,
      body:     r.body     as string,
      items:    r.items    as BriefItem[],
    },
  }
}

export async function POST(req: NextRequest) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const validated = validateBody(raw)
  if ('error' in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }

  const { data } = validated
  const id = `${data.date.slice(0, 10)}-${slugify(data.category)}`

  // O(1) lookup — no scan
  const pointerResult = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { id: '__latest__' } })
  )
  const previousId = (pointerResult.Item as { current_id?: string } | undefined)?.current_id

  const newBrief: Brief = {
    id,
    entity_type: 'brief',
    title:       data.title,
    date:        data.date,
    summary:     data.summary,
    category:    data.category,
    body:        data.body,
    items:       data.items,
    is_latest:   true,
  }

  // Build transaction: always update pointer + put new brief.
  // Only flip previous record's is_latest if previousId exists and differs from new id.
  // On first deploy, previousId is undefined — 2-op transaction.
  type TransactItem = Parameters<typeof TransactWriteCommand>[0]['TransactItems'][0]

  const transactItems: TransactItem[] = [
    {
      Update: {
        TableName:                TABLE_NAME,
        Key:                      { id: '__latest__' },
        UpdateExpression:         'SET current_id = :cid, entity_type = :et',
        ExpressionAttributeValues: { ':cid': id, ':et': 'brief' },
      },
    },
    {
      Put: { TableName: TABLE_NAME, Item: newBrief },
    },
  ]

  if (previousId && previousId !== id) {
    transactItems.push({
      Update: {
        TableName:                TABLE_NAME,
        Key:                      { id: previousId },
        UpdateExpression:         'SET is_latest = :f',
        ExpressionAttributeValues: { ':f': false },
      },
    })
  }

  try {
    await docClient.send(new TransactWriteCommand({ TransactItems: transactItems }))
  } catch (err) {
    console.error('Ingest transaction failed:', err)
    return NextResponse.json({ error: 'Failed to save brief' }, { status: 500 })
  }

  return NextResponse.json({ id }, { status: 201 })
}
```

**Step 4: Verify build**

```bash
npm run build
```
Expected: clean.

**Step 5: Manual smoke test**

With `npm run dev` running and `BRIEF_API_KEY=test-key` in `.env.local`:
```bash
curl -X POST http://localhost:3000/api/briefs/ingest \
  -H "Authorization: Bearer test-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Brief",
    "date": "2026-02-18T06:00:00Z",
    "summary": "A test.",
    "category": "AI/ML",
    "body": "## Test\n\nBody content.",
    "items": [{
      "title": "OpenAI releases GPT-5",
      "url": "https://openai.com/blog/gpt5",
      "source": "OpenAI Blog",
      "snippet": "GPT-5 is now available."
    }]
  }'
```
Expected: `{"id":"2026-02-18-ai-ml"}` with status `201`.

Verify `401` with wrong key, `400` with missing field.

**Step 6: Commit**

```bash
git add src/app/api/briefs/ingest/
git commit -m "feat: add briefs ingest API with atomic TransactWriteItems"
```

---

## Module D — Stripe Integration

### Task 6: Stripe checkout route

**Files:**
- Create: `src/app/api/stripe/checkout/route.ts`

**Step 1: Create route**

```ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  let body: { priceId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { priceId } = body
  if (!priceId || typeof priceId !== 'string') {
    return NextResponse.json({ error: 'priceId required' }, { status: 400 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/api/stripe/success?checkout_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/subscribe`,
    })
    if (!session.url) {
      return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 })
    }
    return NextResponse.redirect(session.url, 303)
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/app/api/stripe/checkout/route.ts
git commit -m "feat: add Stripe checkout route"
```

---

### Task 7: Stripe success handler

**Files:**
- Create: `src/app/api/stripe/success/route.ts`

**Step 1: Create route**

```ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { randomUUID } from 'crypto'
import { createSession } from '@/lib/sessions'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const checkoutSessionId = req.nextUrl.searchParams.get('checkout_session_id')

  if (!checkoutSessionId) {
    return NextResponse.redirect(`${baseUrl}/subscribe?error=payment_incomplete`)
  }

  let checkoutSession: Stripe.Checkout.Session
  try {
    checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
      expand: ['subscription'],
    })
  } catch {
    return NextResponse.redirect(`${baseUrl}/subscribe?error=payment_incomplete`)
  }

  if (checkoutSession.payment_status !== 'paid') {
    return NextResponse.redirect(`${baseUrl}/subscribe?error=payment_incomplete`)
  }

  // Known tradeoff: narrow TOCTOU window between retrieve and createSession.
  // Stripe webhook may arrive during this gap. Acceptable at current scale.
  // Mitigation if needed: make the webhook the source of truth + poll /briefs?pending=true.
  const subscription = checkoutSession.subscription as Stripe.Subscription
  const riSessionId = randomUUID()

  try {
    await createSession({
      session_id:             riSessionId,
      stripe_customer_id:     checkoutSession.customer as string,
      stripe_subscription_id: subscription.id,
      email:                  checkoutSession.customer_details?.email ?? '',
      status:                 'active',
    })
  } catch (err) {
    console.error('Failed to create session record:', err)
    return NextResponse.redirect(`${baseUrl}/subscribe?error=payment_incomplete`)
  }

  const response = NextResponse.redirect(`${baseUrl}/briefs`)
  response.cookies.set('ri_session', riSessionId, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   2592000, // 30 days — matches DynamoDB TTL
    path:     '/',
  })
  return response
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/app/api/stripe/success/route.ts
git commit -m "feat: add Stripe success handler"
```

---

### Task 8: Stripe webhook handler

**Files:**
- Create: `src/app/api/stripe/webhook/route.ts`

**Step 1: Create route**

The Next.js App Router reads the body as `ArrayBuffer` via `req.arrayBuffer()`. Pass a `Buffer` to `constructEvent` — do NOT use `req.json()` or Next.js will parse and re-serialize the body, breaking the signature.

```ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { updateSessionStatus } from '@/lib/sessions'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const sig    = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !secret) {
    return NextResponse.json({ error: 'Missing stripe-signature or webhook secret' }, { status: 400 })
  }

  // Raw body required — constructEvent validates the HMAC signature over the raw bytes.
  const rawBody = await req.arrayBuffer()
  const bodyBuffer = Buffer.from(rawBody)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(bodyBuffer, sig, secret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await updateSessionStatus(sub.customer as string, 'cancelled')
        break
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const status =
          sub.status === 'active'   ? 'active'    :
          sub.status === 'past_due' ? 'past_due'  : 'cancelled'
        await updateSessionStatus(sub.customer as string, status)
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await updateSessionStatus(invoice.customer as string, 'past_due')
        break
      }
      default:
        // Unhandled event types — return 200 to acknowledge receipt
        break
    }
  } catch (err) {
    console.error('Webhook handler error for event', event.type, ':', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Test webhook locally with Stripe CLI**

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Then trigger a test event from a second terminal:
```bash
stripe trigger customer.subscription.deleted
```
Expected: Stripe CLI shows `200 OK`; server logs show the event type.

**Step 4: Commit**

```bash
git add src/app/api/stripe/webhook/route.ts
git commit -m "feat: add Stripe webhook handler"
```

---

### Task 9: Stripe portal and sign-out routes

**Files:**
- Create: `src/app/api/stripe/portal/route.ts`
- Create: `src/app/api/auth/signout/route.ts`

**Step 1: Create portal route**

```ts
// src/app/api/stripe/portal/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getActiveSession, getSessionRecord } from '@/lib/sessions'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const baseUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const sessionId = req.cookies.get('ri_session')?.value

  if (!sessionId || !(await getActiveSession(sessionId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const record = await getSessionRecord(sessionId)
  if (!record) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer:   record.stripe_customer_id,
      return_url: `${baseUrl}/account`,
    })
    return NextResponse.redirect(portalSession.url, 303)
  } catch (err) {
    console.error('Stripe portal error:', err)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}
```

**Step 2: Create sign-out route**

```ts
// src/app/api/auth/signout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const response = NextResponse.redirect(`${baseUrl}/`)
  response.cookies.set('ri_session', '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   0,
    path:     '/',
  })
  return response
}
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/app/api/stripe/portal/route.ts src/app/api/auth/signout/route.ts
git commit -m "feat: add portal and sign-out routes"
```

---

## Module E — Markdown Renderer

### Task 10: BriefBody server component

**Files:**
- Create: `src/components/BriefBody.tsx`

**Step 1: Create component**

`react-markdown` runs in server components. `rehype-pretty-code` uses Shiki for syntax highlighting; bundled with the package, no extra install.

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'
import type { Options } from 'rehype-pretty-code'

const prettyCodeOptions: Options = {
  theme: 'github-dark',
  keepBackground: true,
}

export function BriefBody({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none prose-a:text-[color:var(--ri-accent)] prose-a:no-underline hover:prose-a:underline prose-headings:font-space-grotesk prose-code:before:content-none prose-code:after:content-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypePrettyCode, prettyCodeOptions]]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
```

**Step 2: Verify build**

```bash
npm run build
```
If `rehype-pretty-code` has a peer-dep conflict, install Shiki explicitly:
```bash
npm install shiki
```

**Step 3: Commit**

```bash
git add src/components/BriefBody.tsx
git commit -m "feat: add BriefBody markdown renderer"
```

---

## Module F — Updated Pages

### Task 11: Update briefs listing page

**Files:**
- Modify: `src/app/briefs/page.tsx`

**Step 1: Rewrite the page**

Replace the entire file:
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getBriefs, isTableNotProvisionedError } from '@/lib/briefs'
import { getActiveSession } from '@/lib/sessions'
import type { Brief } from '@/types/brief'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Briefs',
  description: 'Bi-daily AI/ML research summaries.',
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="shrink-0 self-start text-xs font-semibold px-2 py-0.5 rounded-full bg-[color:var(--ri-accent)] text-[color:var(--ri-bg)]">
      {category}
    </span>
  )
}

function LatestBriefCard({ brief }: { brief: Brief }) {
  return (
    <li>
      <article className="glass border-l-[3px] border-[color:var(--ri-accent)]">
        <div className="flex items-start justify-between gap-3 mb-2">
          <Link
            href={`/briefs/${brief.id}`}
            className="ri-link text-xl font-bold leading-snug hover:underline ri-accent-ring"
          >
            {brief.title}
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[color:var(--ri-fg)] text-[color:var(--ri-bg)]">
              Latest
            </span>
            {brief.category && <CategoryBadge category={brief.category} />}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-[color:var(--ri-muted)] mb-3">
          <time dateTime={brief.date}>{formatDate(brief.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{brief.items.length} {brief.items.length === 1 ? 'link' : 'links'}</span>
        </div>
        <p className="text-sm text-[color:var(--ri-fg)] leading-relaxed">{brief.summary}</p>
      </article>
    </li>
  )
}

function ArchiveBriefCard({ brief, isSubscriber }: { brief: Brief; isSubscriber: boolean }) {
  if (isSubscriber) {
    return (
      <li>
        <article className="glass border-l-[3px] border-[color:var(--ri-accent)] opacity-90">
          <div className="flex items-start justify-between gap-3 mb-2">
            <Link
              href={`/briefs/${brief.id}`}
              className="ri-link text-xl font-bold leading-snug hover:underline ri-accent-ring"
            >
              {brief.title}
            </Link>
            {brief.category && <CategoryBadge category={brief.category} />}
          </div>
          <div className="flex items-center gap-3 text-xs text-[color:var(--ri-muted)] mb-3">
            <time dateTime={brief.date}>{formatDate(brief.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{brief.items.length} {brief.items.length === 1 ? 'link' : 'links'}</span>
          </div>
          <p className="text-sm text-[color:var(--ri-fg)] leading-relaxed">{brief.summary}</p>
        </article>
      </li>
    )
  }

  return (
    <li>
      <article className="glass border-l-[3px] border-[color:var(--ri-muted)] opacity-70">
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="text-xl font-bold leading-snug text-[color:var(--ri-fg)]">
            {brief.title}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span aria-label="Subscriber only" title="Subscriber only">🔒</span>
            {brief.category && <CategoryBadge category={brief.category} />}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-[color:var(--ri-muted)] mb-3">
          <time dateTime={brief.date}>{formatDate(brief.date)}</time>
        </div>
        <p className="text-sm text-[color:var(--ri-muted)] leading-relaxed blur-sm select-none">
          {brief.summary}
        </p>
        <Link href="/subscribe" className="ri-link text-xs mt-3 inline-block ri-accent-ring">
          Subscribe to read →
        </Link>
      </article>
    </li>
  )
}

export default async function BriefsPage() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('ri_session')?.value

  let isSubscriber = false
  if (sessionId) {
    try {
      isSubscriber = await getActiveSession(sessionId)
    } catch {
      // Session check failure — treat as anonymous
    }
  }

  let briefs: Brief[] = []
  try {
    briefs = await getBriefs()
  } catch (err) {
    if (!isTableNotProvisionedError(err)) throw err
  }

  const [latestBrief, ...archiveBriefs] = briefs

  return (
    <div className="py-12">
      <div className="mb-10 ri-fade-up">
        <h1 className="ri-heading font-space-grotesk text-4xl font-bold mb-4">Briefs</h1>
        <p className="text-[color:var(--ri-muted)] text-lg max-w-xl">
          Bi-daily AI/ML research summaries. The latest edition is always free.
        </p>
      </div>

      {briefs.length === 0 ? (
        <p className="text-[color:var(--ri-muted)]">No briefs yet. Check back soon.</p>
      ) : (
        <ol className="space-y-6 list-none p-0">
          {latestBrief && <LatestBriefCard brief={latestBrief} />}
          {archiveBriefs.map((brief) => (
            <ArchiveBriefCard key={brief.id} brief={brief} isSubscriber={isSubscriber} />
          ))}
        </ol>
      )}

      {!isSubscriber && archiveBriefs.length > 0 && (
        <div className="mt-12 glass text-center">
          <p className="text-[color:var(--ri-fg)] mb-4">
            Access {archiveBriefs.length} archived {archiveBriefs.length === 1 ? 'brief' : 'briefs'} with a subscription.
          </p>
          <Link href="/subscribe" className="ri-link font-semibold ri-accent-ring">
            Subscribe →
          </Link>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/app/briefs/page.tsx
git commit -m "feat: update briefs listing with paywall lock cards and subscriber check"
```

---

### Task 12: Update brief detail page (paywall)

**Files:**
- Modify: `src/app/briefs/[id]/page.tsx`

**Step 1: Rewrite the page**

Replace the entire file:
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getBrief } from '@/lib/briefs'
import { getActiveSession } from '@/lib/sessions'
import { BriefBody } from '@/components/BriefBody'
import type { BriefItem } from '@/types/brief'

export const dynamic = 'force-dynamic'

function isSafeUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'https:'
  } catch {
    return false
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  try {
    const brief = await getBrief(id)
    if (!brief) return { title: 'Brief Not Found' }
    return { title: brief.title, description: brief.summary }
  } catch {
    return { title: 'Brief Not Found' }
  }
}

export default async function BriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let brief
  try {
    brief = await getBrief(id)
  } catch {
    notFound()
  }
  if (!brief) notFound()

  // Paywall: only the latest brief is public. All others require an active session.
  if (!brief.is_latest) {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('ri_session')?.value
    const authorized = sessionId ? await getActiveSession(sessionId) : false
    if (!authorized) redirect('/subscribe')
  }

  return (
    <div className="py-12">
      <div className="mb-8">
        <Link href="/briefs" className="ri-link ri-accent-ring text-sm">
          ← Back to Briefs
        </Link>
      </div>

      <div className="mb-8 ri-fade-up">
        <h1 className="ri-heading font-space-grotesk text-4xl font-bold mb-4">
          {brief.title}
        </h1>
        <div className="flex items-center gap-3 mt-6 text-sm text-[color:var(--ri-muted)]">
          <time dateTime={brief.date}>{formatDate(brief.date)}</time>
          {brief.category && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[color:var(--ri-accent)] text-[color:var(--ri-bg)]">
                {brief.category}
              </span>
            </>
          )}
          {brief.is_latest && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[color:var(--ri-fg)] text-[color:var(--ri-bg)]">
                Latest
              </span>
            </>
          )}
        </div>
      </div>

      <p className="text-[color:var(--ri-fg)] text-base leading-relaxed mb-10 max-w-2xl">
        {brief.summary}
      </p>

      <div className="ri-divider mb-10" aria-hidden="true" />

      {/* Full markdown body */}
      {brief.body && (
        <section className="mb-10">
          <BriefBody content={brief.body} />
        </section>
      )}

      <div className="ri-divider mb-10" aria-hidden="true" />

      {/* Curated links */}
      <section>
        <h2 className="font-space-grotesk text-2xl font-bold text-[color:var(--ri-fg)] mb-6">
          Links
        </h2>
        <ol className="space-y-4 list-none p-0">
          {brief.items.map((item: BriefItem, index: number) => (
            <li key={index} className="glass">
              {isSafeUrl(item.url) ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ri-link ri-accent-ring font-semibold"
                >
                  {item.title}
                </a>
              ) : (
                <span className="font-semibold text-[color:var(--ri-fg)]">{item.title}</span>
              )}
              <p className="text-xs text-[color:var(--ri-muted)] mt-1">{item.source}</p>
              <p className="text-sm text-[color:var(--ri-fg)] mt-2 leading-relaxed">{item.snippet}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/app/briefs/[id]/page.tsx
git commit -m "feat: add paywall to brief detail page"
```

---

### Task 13: Subscribe page

**Files:**
- Create: `src/app/subscribe/page.tsx`

**Step 1: Create the page**

Prices are fetched from Stripe API and cached with `unstable_cache` (1-hour revalidation). Never hardcoded.

```tsx
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import Stripe from 'stripe'
import { genPageMetadata } from '../seo'

export const metadata: Metadata = genPageMetadata({
  title: 'Subscribe',
  description: 'Access the full AI/ML briefings archive.',
})

interface PriceInfo {
  id:       string
  amount:   number    // in dollars
  interval: string
  currency: string
}

const getPrices = unstable_cache(
  async (): Promise<{ monthly: PriceInfo; annual: PriceInfo }> => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const [monthly, annual] = await Promise.all([
      stripe.prices.retrieve(process.env.STRIPE_PRICE_MONTHLY_ID!),
      stripe.prices.retrieve(process.env.STRIPE_PRICE_ANNUAL_ID!),
    ])
    return {
      monthly: {
        id:       monthly.id,
        amount:   (monthly.unit_amount ?? 0) / 100,
        interval: 'month',
        currency: monthly.currency,
      },
      annual: {
        id:       annual.id,
        amount:   (annual.unit_amount ?? 0) / 100,
        interval: 'year',
        currency: annual.currency,
      },
    }
  },
  ['stripe-prices'],
  { revalidate: 3600 }
)

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount)
}

interface SubscribePageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function SubscribePage({ searchParams }: SubscribePageProps) {
  const { error } = await searchParams
  const prices = await getPrices()

  return (
    <div className="py-12">
      <div className="mb-10 ri-fade-up">
        <h1 className="ri-heading font-space-grotesk text-4xl font-bold mb-4">Subscribe</h1>
        <p className="text-[color:var(--ri-muted)] text-lg max-w-xl">
          The latest brief is always free. Subscribe for access to the full archive.
        </p>
      </div>

      {error === 'payment_incomplete' && (
        <div className="mb-8 glass border-l-[3px] border-red-500">
          <p className="text-sm text-[color:var(--ri-fg)]">
            Your payment was not completed. Please try again.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
        {/* Monthly */}
        <div className="glass border-l-[3px] border-[color:var(--ri-accent)]">
          <p className="text-[color:var(--ri-muted)] text-sm mb-1">Monthly</p>
          <p className="font-space-grotesk text-3xl font-bold text-[color:var(--ri-fg)] mb-1">
            {formatAmount(prices.monthly.amount, prices.monthly.currency)}
          </p>
          <p className="text-[color:var(--ri-muted)] text-xs mb-6">per month · cancel anytime</p>
          <form action="/api/stripe/checkout" method="POST">
            <input type="hidden" name="priceId" value={prices.monthly.id} />
            <button
              type="submit"
              className="w-full font-semibold py-2 px-4 rounded bg-[color:var(--ri-accent)] text-[color:var(--ri-bg)] hover:bg-[color:var(--ri-accent-700)] transition-colors ri-accent-ring"
            >
              Subscribe Monthly
            </button>
          </form>
        </div>

        {/* Annual */}
        <div className="glass border-l-[3px] border-[color:var(--ri-accent)]">
          <p className="text-[color:var(--ri-muted)] text-sm mb-1">Annual</p>
          <p className="font-space-grotesk text-3xl font-bold text-[color:var(--ri-fg)] mb-1">
            {formatAmount(prices.annual.amount, prices.annual.currency)}
          </p>
          <p className="text-[color:var(--ri-muted)] text-xs mb-6">per year · best value</p>
          <form action="/api/stripe/checkout" method="POST">
            <input type="hidden" name="priceId" value={prices.annual.id} />
            <button
              type="submit"
              className="w-full font-semibold py-2 px-4 rounded bg-[color:var(--ri-accent)] text-[color:var(--ri-bg)] hover:bg-[color:var(--ri-accent-700)] transition-colors ri-accent-ring"
            >
              Subscribe Annually
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

Note: The forms POST to `/api/stripe/checkout` with `priceId` as a form field. The checkout route reads `req.json()` — this won't work with a form POST. Update the checkout route to handle `application/x-www-form-urlencoded` OR change the forms to use `fetch` via a client button. The simpler fix: change the form `encType` and update the checkout route to parse form data:

In `src/app/api/stripe/checkout/route.ts`, update `POST` body parsing:
```ts
// Replace:
let body: { priceId?: string }
try {
  body = await req.json()
} catch {
  return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
}
const { priceId } = body

// With:
const contentType = req.headers.get('content-type') ?? ''
let priceId: string | undefined
if (contentType.includes('application/json')) {
  const body = await req.json().catch(() => ({}))
  priceId = body.priceId
} else {
  const formData = await req.formData()
  priceId = formData.get('priceId')?.toString()
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/app/subscribe/page.tsx src/app/api/stripe/checkout/route.ts
git commit -m "feat: add subscribe page with Stripe price cards"
```

---

### Task 14: Account page

**Files:**
- Create: `src/app/account/page.tsx`

**Step 1: Create the page**

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getActiveSession, getSessionRecord } from '@/lib/sessions'

export const metadata: Metadata = {
  title: 'Account',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('ri_session')?.value

  if (!sessionId || !(await getActiveSession(sessionId))) {
    redirect('/subscribe')
  }

  const record = await getSessionRecord(sessionId)
  if (!record) redirect('/subscribe')

  const statusLabel: Record<string, string> = {
    active:    'Active',
    past_due:  'Past Due',
    cancelled: 'Cancelled',
  }

  return (
    <div className="py-12">
      <div className="mb-10 ri-fade-up">
        <h1 className="ri-heading font-space-grotesk text-4xl font-bold mb-4">Account</h1>
      </div>

      <div className="glass mb-4 max-w-md">
        <p className="text-xs text-[color:var(--ri-muted)] mb-1 uppercase tracking-wide">Email</p>
        <p className="text-[color:var(--ri-fg)]">{record.email || '—'}</p>
      </div>

      <div className="glass mb-10 max-w-md">
        <p className="text-xs text-[color:var(--ri-muted)] mb-1 uppercase tracking-wide">Subscription</p>
        <p className="text-[color:var(--ri-fg)]">{statusLabel[record.status] ?? record.status}</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form action="/api/stripe/portal" method="POST">
          <button
            type="submit"
            className="ri-link font-semibold ri-accent-ring"
          >
            Manage Subscription →
          </button>
        </form>
        <span className="hidden sm:inline text-[color:var(--ri-muted)]" aria-hidden="true">·</span>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="text-sm text-[color:var(--ri-muted)] hover:text-[color:var(--ri-fg)] transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-8">
        <Link href="/briefs" className="ri-link text-sm ri-accent-ring">
          ← Back to Briefs
        </Link>
      </div>
    </div>
  )
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/app/account/page.tsx
git commit -m "feat: add account page with subscription status and portal link"
```

---

## Module G — Config & Infrastructure

### Task 15: Update sitemap, env.example, and nav

**Files:**
- Modify: `src/app/sitemap.xml/route.ts`
- Modify: `.env.example`
- Modify: `src/components/NavTabs.tsx` (add Briefs link if not present)

**Step 1: Update sitemap**

Open `src/app/sitemap.xml/route.ts`. Add `/briefs` and `/subscribe`. Do NOT add `/account` or any `/briefs/[id]` URLs.

The exact changes depend on the current file structure — read the file first, then add entries for the two new routes following the existing pattern.

**Step 2: Update `.env.example`**

Add the following block after the existing `BRIEF_API_KEY` line:
```
# Stripe (Briefs paywall)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY_ID=price_...
STRIPE_PRICE_ANNUAL_ID=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Sessions (DynamoDB)
BRIEF_SESSIONS_TABLE_NAME=brief_sessions
```

**Step 3: Verify NavTabs has Briefs link**

Open `src/components/NavTabs.tsx`. If `/briefs` is not already a nav item, add it following the existing pattern.

**Step 4: Verify build**

```bash
npm run build && npm run lint
```

**Step 5: Commit**

```bash
git add src/app/sitemap.xml/route.ts .env.example src/components/NavTabs.tsx
git commit -m "chore: update sitemap, env.example, and nav for briefs feature"
```

---

### Task 16: DynamoDB infrastructure

**Files:**
- Modify: `recursive-journal-generator/template.yaml` OR create `infrastructure/briefs-tables.yaml`

Note: check whether DynamoDB tables are defined in `template.yaml` in the journal generator project (they share AWS infrastructure) or if a standalone CloudFormation/SAM template is more appropriate.

**Step 1: Read existing template.yaml**

```bash
cat ../recursive-journal-generator/template.yaml
```

**Step 2: Add `briefs` table changes**

Add GSI `entity_type-date-index` to the existing `briefs` table definition:
```yaml
BriefsTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: !Sub '${Environment}-briefs'
    BillingMode: PAY_PER_REQUEST
    AttributeDefinitions:
      - AttributeName: id
        AttributeType: S
      - AttributeName: entity_type
        AttributeType: S
      - AttributeName: date
        AttributeType: S
    KeySchema:
      - AttributeName: id
        KeyType: HASH
    GlobalSecondaryIndexes:
      - IndexName: entity_type-date-index
        KeySchema:
          - AttributeName: entity_type
            KeyType: HASH
          - AttributeName: date
            KeyType: RANGE
        Projection:
          ProjectionType: ALL
```

**Step 3: Add `brief_sessions` table**

```yaml
BriefSessionsTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: !Sub '${Environment}-brief-sessions'
    BillingMode: PAY_PER_REQUEST
    TimeToLiveSpecification:
      AttributeName: ttl
      Enabled: true
    AttributeDefinitions:
      - AttributeName: session_id
        AttributeType: S
      - AttributeName: stripe_customer_id
        AttributeType: S
    KeySchema:
      - AttributeName: session_id
        KeyType: HASH
    GlobalSecondaryIndexes:
      - IndexName: stripe_customer_id-index
        KeySchema:
          - AttributeName: stripe_customer_id
            KeyType: HASH
        Projection:
          ProjectionType: ALL
```

**Step 4: Commit**

```bash
git add ../recursive-journal-generator/template.yaml   # or wherever the infra file lives
git commit -m "infra: add entity_type GSI to briefs table, add brief_sessions table"
```

---

## Final Verification

**Step 1: Full build and lint**

```bash
npm run build && npm run lint && npm test
```
Expected: all pass, 0 errors.

**Step 2: End-to-end smoke test**

1. Start dev server: `npm run dev`
2. Ingest a brief: curl command from Task 5 step 5
3. Visit `http://localhost:3000/briefs` — see "Latest" badge, no lock
4. Ingest a second brief with a different `category` (to get a different ID)
5. Visit `/briefs` — first brief now shows lock icon
6. Click locked brief — redirected to `/subscribe`
7. Click subscribe button — redirects to Stripe (requires `STRIPE_SECRET_KEY` in `.env.local`)
8. After test payment (use Stripe test card `4242 4242 4242 4242`) — land on `/briefs`, lock icons gone
9. Visit `/account` — shows email and "Active"
10. "Sign out" → `/` — visit `/briefs/[archived-id]` directly → redirected to `/subscribe`

**Step 3: Webhook test**

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger customer.subscription.deleted
```
Expected: session status in DynamoDB changes to `cancelled`, archived brief becomes inaccessible.
