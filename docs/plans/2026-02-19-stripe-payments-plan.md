# Stripe Payments Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire up the existing Stripe scaffolding so archive subscriptions work on Amplify, and add a new /support page for one-time contributions and recurring patron tier.

**Architecture:** Fix two silent production bugs (missing env embeddings + missing DynamoDB credentials in sessions.ts), then build the Fund the Lab contribute route and support page. The archive gating and lock indicators are already fully implemented in briefs/[id]/page.tsx and briefs/page.tsx — do NOT modify them.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Stripe SDK v20, AWS DynamoDB SDK v3, Vitest v4

---

## Pre-requisites (outside code — do before starting)

These must be done in external tools before the code will work end-to-end:

1. **Enable TTL on `brief_sessions` DynamoDB table:**
   ```bash
   aws dynamodb update-time-to-live \
     --table-name brief_sessions \
     --time-to-live-specification "Enabled=true,AttributeName=ttl" \
     --region us-east-1 --profile seth-dev
   ```

2. **Extend `amplify-briefs-writer` IAM policy** to include `brief_sessions` table:
   - In AWS IAM console, find `amplify-briefs-writer` user policy
   - Add `brief_sessions` table ARN alongside `briefs` table with: GetItem, PutItem, UpdateItem, Query
   - Also add the GSI ARN: `arn:aws:dynamodb:us-east-1:843475473749:table/brief_sessions/index/stripe_customer_id-index`

3. **Create Stripe products** in Stripe dashboard (test mode first):
   - Archive Access – Monthly (e.g. $9/mo, recurring) → note the Price ID
   - Archive Access – Annual (e.g. $79/yr, recurring) → note the Price ID
   - Patron – Monthly (any price, recurring) → note the Price ID
   - No product needed for one-time — price is created dynamically

4. **Register Stripe webhook endpoint:**
   - URL: `https://recursiveintelligence.io/api/stripe/webhook`
   - Events: `customer.subscription.deleted`, `customer.subscription.updated`, `invoice.payment_failed`
   - Note the Webhook Signing Secret

5. **Add env vars to Amplify console** (app `d2dmx5f9lbvzyb`, region `us-east-2`):
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_MONTHLY_ID`
   - `STRIPE_PRICE_ANNUAL_ID`
   - `STRIPE_PRICE_PATRON_ID`
   - `BRIEF_SESSIONS_TABLE_NAME` = `brief_sessions`
   - `BRIEF_SESSIONS_AWS_ACCESS_KEY_ID` (same key as `BRIEFS_AWS_ACCESS_KEY_ID`)
   - `BRIEF_SESSIONS_AWS_SECRET_ACCESS_KEY` (same key as `BRIEFS_AWS_SECRET_ACCESS_KEY`)

---

## Task 1: Fix `sessions.ts` — DynamoDB credentials

**Why:** The `DynamoDBClient` in `sessions.ts` has no credentials. On Amplify SSR Lambda (which runs in a managed AWS account), credentialless SDK calls silently fail. Same bug was already fixed in `briefs.ts`. This breaks session creation and lookup in production.

**Files:**
- Modify: `src/lib/sessions.ts:1-11`

**Step 1: Open `src/lib/sessions.ts` and find lines 1-11**

Current code:
```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({ region: process.env.APP_REGION ?? 'us-east-1' })
const docClient = DynamoDBDocumentClient.from(client)
```

**Step 2: Replace lines 10-11 with credentials-aware client**

Replace only `const client = ...` and `const docClient = ...`:
```typescript
const client = new DynamoDBClient({
  region: process.env.APP_REGION ?? 'us-east-1',
  // Amplify SSR Lambda runs in a managed account with no access to this account's DynamoDB.
  // Credentials for `amplify-briefs-writer` IAM user are embedded at build time via next.config.ts.
  ...(process.env.BRIEF_SESSIONS_AWS_ACCESS_KEY_ID
    ? {
        credentials: {
          accessKeyId: process.env.BRIEF_SESSIONS_AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.BRIEF_SESSIONS_AWS_SECRET_ACCESS_KEY ?? '',
        },
      }
    : {}),
})
const docClient = DynamoDBDocumentClient.from(client)

const TABLE_NAME = process.env.BRIEF_SESSIONS_TABLE_NAME ?? 'brief_sessions'
```

Note: `TABLE_NAME` already exists on line 13 — update it in place to use `BRIEF_SESSIONS_TABLE_NAME` instead of `BRIEF_SESSIONS_TABLE`.

**Step 3: Run the build to verify no TypeScript errors**

```bash
cd /home/r3crsvint3llgnz/01_Projects/recursiveintelligence-website
npm run build 2>&1 | tail -20
```
Expected: Build succeeds (exit 0). Any TypeScript error means you introduced a mistake.

**Step 4: Run tests**

```bash
npm test 2>&1
```
Expected: All tests pass (sessions.ts has no unit tests — this is fine).

**Step 5: Commit**

```bash
git add src/lib/sessions.ts
git commit -m "fix: pass DynamoDB credentials in sessions.ts for Amplify SSR Lambda"
```

---

## Task 2: Add Stripe + sessions env vars to `next.config.ts`

**Why:** Amplify Hosting does NOT inject non-`NEXT_PUBLIC_` env vars into the SSR Lambda runtime at request time. They are only available during `npm run build`. `next.config.ts` `env` section tells Next.js to embed them as literals at compile time, making them available server-side. Without this, every Stripe API call and every session lookup returns errors in production.

**Files:**
- Modify: `next.config.ts`

**Step 1: Open `next.config.ts` and read the current `env` block**

Current state:
```typescript
env: {
  BRIEF_API_KEY: process.env.BRIEF_API_KEY ?? '',
  APP_REGION: process.env.APP_REGION ?? 'us-east-1',
  BRIEFS_TABLE_NAME: process.env.BRIEFS_TABLE_NAME ?? 'briefs',
  BRIEFS_AWS_ACCESS_KEY_ID: process.env.BRIEFS_AWS_ACCESS_KEY_ID ?? '',
  BRIEFS_AWS_SECRET_ACCESS_KEY: process.env.BRIEFS_AWS_SECRET_ACCESS_KEY ?? '',
  OWNER_ACCESS_TOKEN: process.env.OWNER_ACCESS_TOKEN ?? '',
},
```

**Step 2: Add the 8 new vars to the `env` block**

Append after `OWNER_ACCESS_TOKEN`:
```typescript
STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? '',
STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? '',
STRIPE_PRICE_MONTHLY_ID: process.env.STRIPE_PRICE_MONTHLY_ID ?? '',
STRIPE_PRICE_ANNUAL_ID: process.env.STRIPE_PRICE_ANNUAL_ID ?? '',
STRIPE_PRICE_PATRON_ID: process.env.STRIPE_PRICE_PATRON_ID ?? '',
BRIEF_SESSIONS_TABLE_NAME: process.env.BRIEF_SESSIONS_TABLE_NAME ?? 'brief_sessions',
BRIEF_SESSIONS_AWS_ACCESS_KEY_ID: process.env.BRIEF_SESSIONS_AWS_ACCESS_KEY_ID ?? '',
BRIEF_SESSIONS_AWS_SECRET_ACCESS_KEY: process.env.BRIEF_SESSIONS_AWS_SECRET_ACCESS_KEY ?? '',
```

**Step 3: Run the build**

```bash
npm run build 2>&1 | tail -20
```
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add next.config.ts
git commit -m "fix: embed Stripe and session env vars for Amplify SSR Lambda"
```

---

## Task 3: Write tests for `/api/stripe/contribute` route

**Why:** This is the only net-new business logic in the project. Write failing tests first.

**Files:**
- Create: `src/app/api/stripe/contribute/route.test.ts`

**Step 1: Create the test file**

```typescript
// src/app/api/stripe/contribute/route.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Stripe mock ──────────────────────────────────────────────────────────
// vi.hoisted ensures mockCreate is defined before vi.mock factory runs.
const mockCreate = vi.hoisted(() => vi.fn())

vi.mock('@/lib/stripeClient', () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        create: mockCreate,
      },
    },
  }),
}))

// Import the handler AFTER mocks are set up
import { POST } from './route'

// Helper: build a form-encoded NextRequest
function makeFormRequest(fields: Record<string, string>) {
  const formData = new FormData()
  for (const [k, v] of Object.entries(fields)) formData.set(k, v)
  return new Request('http://localhost/api/stripe/contribute', {
    method: 'POST',
    body: formData,
  }) as unknown as import('next/server').NextRequest
}

// Helper: build a JSON NextRequest
function makeJsonRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/stripe/contribute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('POST /api/stripe/contribute — validation', () => {
  beforeEach(() => {
    mockCreate.mockReset()
    vi.stubEnv('STRIPE_PRICE_PATRON_ID', 'price_patron_test')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://recursiveintelligence.io')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns 400 when type is missing', async () => {
    const res = await POST(makeFormRequest({ amount: '10' }))
    expect(res.status).toBe(400)
    const { error } = await res.json() as { error: string }
    expect(error).toMatch(/type/)
  })

  it('returns 400 when type is unknown', async () => {
    const res = await POST(makeFormRequest({ type: 'gift', amount: '10' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when one_time amount is missing', async () => {
    const res = await POST(makeFormRequest({ type: 'one_time' }))
    expect(res.status).toBe(400)
    const { error } = await res.json() as { error: string }
    expect(error).toMatch(/amount/)
  })

  it('returns 400 when one_time amount is not a number', async () => {
    const res = await POST(makeFormRequest({ type: 'one_time', amount: 'abc' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when one_time amount is below $1 (less than 100 cents)', async () => {
    const res = await POST(makeFormRequest({ type: 'one_time', amount: '0.50' }))
    expect(res.status).toBe(400)
    const { error } = await res.json() as { error: string }
    expect(error).toMatch(/minimum/)
  })

  it('returns 503 when patron price ID env var is not set', async () => {
    vi.stubEnv('STRIPE_PRICE_PATRON_ID', '')
    const res = await POST(makeFormRequest({ type: 'patron' }))
    expect(res.status).toBe(503)
  })
})

describe('POST /api/stripe/contribute — one_time checkout', () => {
  beforeEach(() => {
    mockCreate.mockReset()
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://recursiveintelligence.io')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('creates a payment mode checkout session and redirects (form body)', async () => {
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_onetime' })
    const res = await POST(makeFormRequest({ type: 'one_time', amount: '25' }))
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toBe('https://checkout.stripe.com/pay/cs_test_onetime')
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'payment',
    }))
    const call = mockCreate.mock.calls[0][0] as { line_items: Array<{ price_data: { unit_amount: number } }> }
    expect(call.line_items[0].price_data.unit_amount).toBe(2500) // $25 → 2500 cents
  })

  it('creates a payment mode checkout session from JSON body', async () => {
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_onetime_json' })
    const res = await POST(makeJsonRequest({ type: 'one_time', amount: 10 }))
    expect(res.status).toBe(303)
    const call = mockCreate.mock.calls[0][0] as { line_items: Array<{ price_data: { unit_amount: number } }> }
    expect(call.line_items[0].price_data.unit_amount).toBe(1000) // $10 → 1000 cents
  })

  it('sets success_url to /support?thanks=1', async () => {
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_x' })
    await POST(makeFormRequest({ type: 'one_time', amount: '5' }))
    const call = mockCreate.mock.calls[0][0] as { success_url: string }
    expect(call.success_url).toBe('https://recursiveintelligence.io/support?thanks=1')
  })

  it('sets cancel_url to /support', async () => {
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_x' })
    await POST(makeFormRequest({ type: 'one_time', amount: '5' }))
    const call = mockCreate.mock.calls[0][0] as { cancel_url: string }
    expect(call.cancel_url).toBe('https://recursiveintelligence.io/support')
  })

  it('returns 500 when Stripe returns no URL', async () => {
    mockCreate.mockResolvedValue({ url: null })
    const res = await POST(makeFormRequest({ type: 'one_time', amount: '5' }))
    expect(res.status).toBe(500)
  })

  it('returns 500 on Stripe API error', async () => {
    mockCreate.mockRejectedValue(new Error('Stripe error'))
    const res = await POST(makeFormRequest({ type: 'one_time', amount: '5' }))
    expect(res.status).toBe(500)
  })
})

describe('POST /api/stripe/contribute — patron checkout', () => {
  beforeEach(() => {
    mockCreate.mockReset()
    vi.stubEnv('STRIPE_PRICE_PATRON_ID', 'price_patron_live')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://recursiveintelligence.io')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('creates a subscription mode checkout session and redirects', async () => {
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_patron' })
    const res = await POST(makeFormRequest({ type: 'patron' }))
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toBe('https://checkout.stripe.com/pay/cs_test_patron')
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'subscription',
      line_items: [{ price: 'price_patron_live', quantity: 1 }],
    }))
  })

  it('sets success_url to /api/stripe/success (for session creation)', async () => {
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_p' })
    await POST(makeFormRequest({ type: 'patron' }))
    const call = mockCreate.mock.calls[0][0] as { success_url: string }
    expect(call.success_url).toContain('/api/stripe/success')
    expect(call.success_url).toContain('{CHECKOUT_SESSION_ID}')
  })

  it('sets cancel_url to /support', async () => {
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_p' })
    await POST(makeFormRequest({ type: 'patron' }))
    const call = mockCreate.mock.calls[0][0] as { cancel_url: string }
    expect(call.cancel_url).toBe('https://recursiveintelligence.io/support')
  })
})
```

**Step 2: Run the tests to confirm they FAIL (no route yet)**

```bash
npm test 2>&1 | tail -30
```
Expected: Errors like `Cannot find module './route'` or similar. The test file exists but the route doesn't — that's the correct TDD state.

---

## Task 4: Implement `/api/stripe/contribute` route

**Files:**
- Create: `src/app/api/stripe/contribute/route.ts`

**Step 1: Create the route**

```typescript
// src/app/api/stripe/contribute/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripeClient'

export async function POST(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  // Handle both JSON and form-encoded bodies
  const contentType = req.headers.get('content-type') ?? ''
  let type: string | undefined
  let amount: number | undefined // raw value from body (dollars for form, any for JSON)

  if (contentType.includes('application/json')) {
    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    type = typeof body.type === 'string' ? body.type : undefined
    amount = typeof body.amount === 'number' ? body.amount : undefined
  } else {
    const formData = await req.formData()
    type = formData.get('type')?.toString()
    const raw = formData.get('amount')?.toString()
    amount = raw != null ? parseFloat(raw) : undefined
  }

  if (!type || (type !== 'one_time' && type !== 'patron')) {
    return NextResponse.json({ error: 'type must be one_time or patron' }, { status: 400 })
  }

  // ── One-time contribution ─────────────────────────────────────────────
  if (type === 'one_time') {
    if (amount == null || isNaN(amount)) {
      return NextResponse.json({ error: 'amount is required for one_time contributions' }, { status: 400 })
    }
    const cents = Math.round(amount * 100)
    if (cents < 100) {
      return NextResponse.json({ error: 'minimum contribution is $1 (100 cents)' }, { status: 400 })
    }

    try {
      const session = await getStripe().checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: cents,
              product_data: { name: 'Fund the Lab — Recursive Intelligence' },
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/support?thanks=1`,
        cancel_url:  `${baseUrl}/support`,
      })
      if (!session.url) {
        return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 })
      }
      return NextResponse.redirect(session.url, 303)
    } catch (err) {
      console.error('Stripe one-time checkout error:', err)
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }
  }

  // ── Patron recurring subscription ────────────────────────────────────
  const patronPriceId = process.env.STRIPE_PRICE_PATRON_ID
  if (!patronPriceId) {
    return NextResponse.json({ error: 'Patron tier not yet available' }, { status: 503 })
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: patronPriceId, quantity: 1 }],
      success_url: `${baseUrl}/api/stripe/success?checkout_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/support`,
    })
    if (!session.url) {
      return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 })
    }
    return NextResponse.redirect(session.url, 303)
  } catch (err) {
    console.error('Stripe patron checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
```

**Step 2: Run the tests — expect them to pass**

```bash
npm test 2>&1 | grep -E 'PASS|FAIL|✓|✗|passed|failed'
```
Expected: All tests in `contribute/route.test.ts` pass. All prior tests still pass.

**Step 3: Run the build**

```bash
npm run build 2>&1 | tail -20
```
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/api/stripe/contribute/route.ts src/app/api/stripe/contribute/route.test.ts
git commit -m "feat: add /api/stripe/contribute route for one-time and patron checkout"
```

---

## Task 5: Create `/support` page

**Files:**
- Create: `src/app/support/page.tsx`

**Step 1: Create the page**

```typescript
// src/app/support/page.tsx
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import { genPageMetadata } from '../seo'
import { getStripe } from '@/lib/stripeClient'

export const dynamic = 'force-dynamic'

export const metadata = genPageMetadata({
  title: 'Support',
  description: 'Fund the research and support the lab.',
})

interface PriceInfo {
  id:       string
  amount:   number
  interval: string
  currency: string
}

const getPatronPrice = unstable_cache(
  async (): Promise<PriceInfo | null> => {
    const patronId = process.env.STRIPE_PRICE_PATRON_ID
    if (!patronId) return null
    const price = await getStripe().prices.retrieve(patronId)
    return {
      id:       price.id,
      amount:   (price.unit_amount ?? 0) / 100,
      interval: 'month',
      currency: price.currency,
    }
  },
  ['stripe-patron-price'],
  { revalidate: 3600 }
)

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency:              currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount)
}

interface SupportPageProps {
  searchParams: Promise<{ thanks?: string }>
}

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const { thanks } = await searchParams
  const patronPrice = await getPatronPrice().catch(() => null)

  return (
    <div className="py-12">
      <div className="mb-10 ri-fade-up">
        <h1 className="ri-heading font-space-grotesk text-4xl font-bold mb-4">Support</h1>
        <p className="text-[color:var(--ri-muted)] text-lg max-w-xl">
          This research is independent and self-funded. If it's useful to you, you can help keep it going.
        </p>
      </div>

      {thanks === '1' && (
        <div className="mb-10 glass border-l-[3px] border-[color:var(--ri-accent)] max-w-xl">
          <p className="font-semibold text-[color:var(--ri-fg)] mb-1">Thank you.</p>
          <p className="text-sm text-[color:var(--ri-muted)]">
            Your contribution helps keep the lab running. I appreciate it.
          </p>
        </div>
      )}

      {/* ── Fund the Lab (one-time) ────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="font-space-grotesk text-2xl font-bold text-[color:var(--ri-fg)] mb-2">
          Fund the Lab
        </h2>
        <p className="text-[color:var(--ri-muted)] text-sm mb-6 max-w-lg">
          A one-time contribution of any amount. No subscription, no commitment — just direct support for the work.
        </p>
        <form
          action="/api/stripe/contribute"
          method="POST"
          className="flex items-end gap-3 max-w-xs"
        >
          <input type="hidden" name="type" value="one_time" />
          <div className="flex-1">
            <label htmlFor="amount" className="block text-xs text-[color:var(--ri-muted)] mb-1">
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--ri-muted)] select-none">$</span>
              <input
                type="number"
                id="amount"
                name="amount"
                min="1"
                step="1"
                defaultValue="10"
                required
                className="w-full pl-7 pr-3 py-2 rounded border border-[color:var(--ri-border)] bg-[color:var(--ri-bg)] text-[color:var(--ri-fg)] focus:outline-none focus:border-[color:var(--ri-accent)] focus:ring-1 focus:ring-[color:var(--ri-accent)]"
              />
            </div>
          </div>
          <button
            type="submit"
            className="font-semibold py-2 px-4 rounded bg-[color:var(--ri-accent)] text-[color:var(--ri-bg)] hover:bg-[color:var(--ri-accent-700)] transition-colors ri-accent-ring whitespace-nowrap"
          >
            Give →
          </button>
        </form>
      </section>

      <hr className="ri-divider my-8" />

      {/* ── Become a Patron (recurring) ───────────────────────────── */}
      <section>
        <h2 className="font-space-grotesk text-2xl font-bold text-[color:var(--ri-fg)] mb-2">
          Become a Patron
        </h2>
        <p className="text-[color:var(--ri-muted)] text-sm mb-6 max-w-lg">
          Monthly support for the lab. Includes full access to the AI/ML briefs archive.
        </p>

        {!patronPrice ? (
          <div className="glass border-l-[3px] border-[color:var(--ri-accent)] max-w-md">
            <p className="text-[color:var(--ri-fg)] mb-1">Patron tier coming soon.</p>
            <p className="text-[color:var(--ri-muted)] text-sm">
              Recurring support is not yet active. Check back shortly.
            </p>
          </div>
        ) : (
          <div className="glass border-l-[3px] border-[color:var(--ri-accent)] max-w-xs">
            <p className="text-[color:var(--ri-muted)] text-sm mb-1">Monthly patron</p>
            <p className="font-space-grotesk text-3xl font-bold text-[color:var(--ri-fg)] mb-1">
              {formatAmount(patronPrice.amount, patronPrice.currency)}
            </p>
            <p className="text-[color:var(--ri-muted)] text-xs mb-1">per month · cancel anytime</p>
            <p className="text-[color:var(--ri-muted)] text-xs mb-6">includes full brief archive access</p>
            <form action="/api/stripe/contribute" method="POST">
              <input type="hidden" name="type" value="patron" />
              <button
                type="submit"
                className="w-full font-semibold py-2 px-4 rounded bg-[color:var(--ri-accent)] text-[color:var(--ri-bg)] hover:bg-[color:var(--ri-accent-700)] transition-colors ri-accent-ring"
              >
                Become a Patron →
              </button>
            </form>
          </div>
        )}
      </section>

      <div className="mt-12 text-sm text-[color:var(--ri-muted)]">
        Looking for archive access without patronage?{' '}
        <Link href="/subscribe" className="ri-link ri-accent-ring">
          Subscribe →
        </Link>
      </div>
    </div>
  )
}
```

**Step 2: Run the build**

```bash
npm run build 2>&1 | tail -20
```
Expected: Build succeeds.

**Step 3: Run tests**

```bash
npm test 2>&1 | grep -E 'PASS|FAIL|passed|failed'
```
Expected: All tests pass.

**Step 4: Commit**

```bash
git add src/app/support/page.tsx
git commit -m "feat: add /support page — Fund the Lab one-time and patron checkout"
```

---

## Task 6: Update `/subscribe` page — add Fund the Lab cross-link

**Files:**
- Modify: `src/app/subscribe/page.tsx`

**Step 1: Find the bottom of the page JSX** (after the `</div>` closing the pricing cards grid, around line 130)

**Step 2: Add the cross-link paragraph** after the `</div>` that closes the `grid` but inside the outer `<div className="py-12">`:

```tsx
<p className="mt-8 text-sm text-[color:var(--ri-muted)]">
  Looking to support the research without a subscription?{' '}
  <Link href="/support" className="ri-link ri-accent-ring">
    Fund the Lab →
  </Link>
</p>
```

Make sure `Link` is imported from `'next/link'` at the top. It should already be present — verify before adding.

**Step 3: Run build**

```bash
npm run build 2>&1 | tail -20
```
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/subscribe/page.tsx
git commit -m "feat: add Fund the Lab cross-link to subscribe page"
```

---

## Task 7: Update `NavTabs.tsx` — add Support tab

**Files:**
- Modify: `src/components/NavTabs.tsx:5-8`

**Step 1: Open `src/components/NavTabs.tsx` and find the `items` array**

Current:
```typescript
const items = [
  { href: "/about",    label: "About" },
  { href: "/briefs",   label: "Briefs" },
];
```

**Step 2: Add the Support entry**

```typescript
const items = [
  { href: "/about",    label: "About" },
  { href: "/briefs",   label: "Briefs" },
  { href: "/support",  label: "Support" },
];
```

**Step 3: Run build and tests**

```bash
npm run build 2>&1 | tail -20 && npm test 2>&1 | grep -E 'passed|failed'
```
Expected: Build succeeds, all tests pass.

**Step 4: Commit**

```bash
git add src/components/NavTabs.tsx
git commit -m "feat: add Support tab to primary nav"
```

---

## Task 8: Update `sitemap.xml` — add `/support`

**Files:**
- Modify: `src/app/sitemap.xml/route.ts`

**Step 1: Find `staticPaths` array on line 7**

Current:
```typescript
const staticPaths = ["/", "/about", "/blog", "/briefs", "/subscribe"];
```

**Step 2: Add `/support`**

```typescript
const staticPaths = ["/", "/about", "/blog", "/briefs", "/subscribe", "/support"];
```

**Step 3: Run build**

```bash
npm run build 2>&1 | tail -20
```
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/sitemap.xml/route.ts
git commit -m "feat: add /support to sitemap"
```

---

## Task 9: Final verification

**Step 1: Run full test suite**

```bash
npm test 2>&1
```
Expected: All tests pass with no failures.

**Step 2: Run production build**

```bash
npm run build 2>&1
```
Expected: Build succeeds. Note any warnings (acceptable) vs errors (must fix).

**Step 3: Run lint**

```bash
npm run lint 2>&1
```
Expected: No errors (warnings OK).

**Step 4: Manual smoke test in dev**

```bash
npm run dev
```

Check these pages load without errors:
- `http://localhost:3000/support` — shows Fund the Lab form + Patron coming soon (if no STRIPE_PRICE_PATRON_ID set)
- `http://localhost:3000/subscribe` — shows subscription cards + Fund the Lab cross-link
- `http://localhost:3000/briefs` — shows latest free + archived locked briefs (if any exist)
- `http://localhost:3000/briefs/<any-non-latest-id>` — should redirect to `/subscribe` without an active session

**Step 5: Push to main and verify Amplify build**

```bash
git push origin main
```

Monitor build:
```bash
aws amplify list-jobs --app-id d2dmx5f9lbvzyb --branch-name main --region us-east-2 --profile seth-dev --query 'jobSummaries[0:3]'
```

---

## Deployment Checklist

Before going live with real payments:

- [ ] Enable DynamoDB TTL on `brief_sessions` (pre-requisite step 1)
- [ ] Extend `amplify-briefs-writer` IAM policy to cover `brief_sessions` (pre-requisite step 2)
- [ ] Create Stripe products in TEST mode, verify checkout flows end-to-end
- [ ] Set all 8 env vars in Amplify console
- [ ] Register webhook endpoint in Stripe dashboard
- [ ] Trigger Amplify rebuild (push empty commit or code push)
- [ ] Test full subscription flow in test mode: subscribe → check archive access → cancel → verify lock
- [ ] Test one-time contribution: give → verify /support?thanks=1
- [ ] Test patron flow: subscribe as patron → verify archive access
- [ ] Switch Stripe to live mode, update env vars, rebuild

---

## What's Already Done (do NOT modify)

These were already fully implemented — do not touch them:

| Feature | File | Status |
|---------|------|--------|
| Archive gating | `src/app/briefs/[id]/page.tsx:57-63` | ✅ Complete |
| Lock indicators on listing | `src/app/briefs/page.tsx:83-107` | ✅ Complete |
| Subscription checkout | `src/app/api/stripe/checkout/route.ts` | ✅ Complete |
| Webhook handler | `src/app/api/stripe/webhook/route.ts` | ✅ Complete |
| Success / session creation | `src/app/api/stripe/success/route.ts` | ✅ Complete |
| Billing portal | `src/app/api/stripe/portal/route.ts` | ✅ Complete |
| Account page | `src/app/account/page.tsx` | ✅ Complete |
| Subscribe page (pricing cards) | `src/app/subscribe/page.tsx` | ✅ Complete (add cross-link only) |
