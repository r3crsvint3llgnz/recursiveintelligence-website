# AI/ML Briefings Feature — Design

**Date:** 2026-02-18
**Status:** Approved
**Scope:** DynamoDB-backed briefings with bi-daily ingestion API, Stripe subscription paywall, and public/archive split

---

## Overview

The briefings feature receives AI/ML research summaries from an automated research-agent twice daily via HTTP POST, displays the most recent brief publicly, and gates all historical briefs behind a Stripe subscription (monthly or annual). Sessions are tracked in DynamoDB; no third-party auth service is introduced.

---

## 1. Data Model

### 1.1 `briefs` DynamoDB Table (extended)

| Attribute | Type | Notes |
|---|---|---|
| `id` | String (PK) | Server-generated: `${YYYY-MM-DD}-${slugify(category)}` |
| `entity_type` | String | Always `"brief"` (hardcoded in ingest handler, never agent-supplied) |
| `title` | String | |
| `date` | String | ISO 8601 |
| `summary` | String | 2–3 sentence teaser |
| `category` | String | e.g. `"AI/ML"` |
| `body` | String | Full markdown body |
| `items` | List | `BriefItem[]` (see below) |
| `is_latest` | Boolean | `true` only on the most recent brief |

**Pointer record** (also in `briefs` table):
```
{ id: "__latest__", entity_type: "brief", current_id: "<most-recent-brief-id>" }
```

**GSI — `entity_type-date-index`:**
- Partition key: `entity_type`
- Sort key: `date`
- Enables reverse-chronological listing via `Query` with `ScanIndexForward: false`
- Listing query uses `FilterExpression: id <> :latest` to exclude the `__latest__` pointer record

### 1.2 `BriefItem` Interface (locked)

```ts
export interface BriefItem {
  title:   string
  url:     string   // must pass isSafeUrl validation
  source:  string
  snippet: string
}
```

### 1.3 `Brief` Interface (extended)

```ts
export interface Brief {
  id:          string
  entity_type: string        // always "brief"
  title:       string
  date:        string        // ISO 8601
  summary:     string
  category:    string
  body:        string        // full markdown body
  items:       BriefItem[]
  is_latest:   boolean
}
```

### 1.4 `brief_sessions` DynamoDB Table (new)

| Attribute | Type | Notes |
|---|---|---|
| `session_id` | String (PK) | UUID v4, server-generated |
| `stripe_customer_id` | String | |
| `stripe_subscription_id` | String | |
| `email` | String | |
| `status` | String | `'active'` \| `'cancelled'` \| `'past_due'` |
| `created_at` | String | ISO 8601 |
| `updated_at` | String | ISO 8601 |
| `ttl` | Number | Epoch seconds, `now + 2592000` (30 days) |

**GSI — `stripe_customer_id-index`:**
- Partition key: `stripe_customer_id`
- Used by webhook handler to look up session without a table scan

---

## 2. Ingestion API

**Route:** `POST /api/briefs/ingest`
**Auth:** `Authorization: Bearer ${BRIEF_API_KEY}` — compared with Node.js `crypto.timingSafeEqual` to prevent timing attacks

### 2.1 Request Body

```json
{
  "title":    "AI/ML Morning Brief — Feb 18",
  "date":     "2026-02-18T06:00:00Z",
  "summary":  "2–3 sentences.",
  "category": "AI/ML",
  "body":     "## Key Developments\n\n...",
  "items": [
    {
      "title":   "Gemini 2.5 Pro released",
      "url":     "https://...",
      "source":  "Google Blog",
      "snippet": "..."
    }
  ]
}
```

Any agent-supplied `id` field is ignored. The server generates `id = ${date.slice(0, 10)}-${slugify(category)}`.

### 2.2 `isSafeUrl` Specification

All of the following must pass before a `url` is accepted:

1. Parse via `new URL(raw)` — throws on malformed input
2. `protocol === 'https:'` exactly (rejects `http:`, `ftp:`, `javascript:`, etc.)
3. `hostname` is not `localhost`, `127.0.0.1`, `::1`, or `0.0.0.0`
4. `hostname` does not match bare IPv4 regex: `/^\d{1,3}(\.\d{1,3}){3}$/`
5. `hostname` does not fall in RFC-1918 or link-local ranges: `10.*`, `172.16–31.*`, `192.168.*`, `169.254.*`
6. `hostname` contains at least one dot (blocks single-label intranet names)

### 2.3 Ingest Handler Sequence

1. Validate `Authorization` header with `timingSafeEqual`; return `401` on failure
2. Parse and validate body; return `400` with field-level errors on failure
3. `GetItem({ id: "__latest__" })` → `previousId` (may be `undefined` on first deploy)
4. Execute `TransactWriteItems`:
   - **Always:** `Update __latest__` → `current_id = newBrief.id`
   - **Always:** `Put newBrief` with `is_latest: true`, `entity_type: "brief"`
   - **If `previousId` exists:** `Update previousId` → `is_latest = false`
5. Return `201 Created` with `{ id: newBrief.id }`

**First-deploy bootstrap:** When `previousId === undefined`, the transaction has 2 ops (no flip of old record). This is the only time a 2-op transaction is used; thereafter it is always 3 ops.

**Collision handling:** If `id` already exists with different content, return `409 Conflict`.

---

## 3. Subscriber Flow (Stripe + Sessions)

### 3.1 Checkout

```
User on /subscribe
  → POST /api/stripe/checkout { priceId }
  → Server creates Stripe Checkout Session:
       mode: 'subscription'
       success_url: /api/stripe/success?checkout_session_id={CHECKOUT_SESSION_ID}
       cancel_url: /subscribe
  → 303 redirect to Stripe-hosted Checkout
```

### 3.2 Success Handler (`GET /api/stripe/success`)

Normal JSON parsing applies here (`constructEvent` is not called on this route).

1. Retrieve `checkout_session_id` from query params
2. Call `stripe.checkout.sessions.retrieve(id)`
3. If `payment_status !== 'paid'`: redirect to `/subscribe?error=payment_incomplete`
4. Generate UUID v4 `session_id`
5. `PutItem` into `brief_sessions`: `{ session_id, stripe_customer_id, stripe_subscription_id, email, status: 'active', created_at, ttl: now + 2592000 }`
6. Set cookie: `ri_session=<uuid>; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
7. Redirect to `/briefs`

> **Known tradeoff:** There is a narrow TOCTOU window between step 2 and step 5 where a Stripe webhook could arrive and attempt to update a session that doesn't yet exist. At bi-daily scale this is accepted. The webhook-as-source-of-truth pattern (polling `/briefs?pending=true`) is the correct mitigation if this becomes a problem at higher subscription volumes.

### 3.3 Webhook Handler (`POST /api/stripe/webhook`)

Raw body must be read as a `Buffer` (Next.js body parser disabled for this route) for `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)` to work.

| Event | Action |
|---|---|
| `customer.subscription.deleted` | GSI query by `stripe_customer_id` → `status = 'cancelled'` |
| `customer.subscription.updated` | GSI query → update `status` from `subscription.status` |
| `invoice.payment_failed` | GSI query → `status = 'past_due'` |

### 3.4 Session Verification

```ts
// src/lib/sessions.ts
export async function getActiveSession(sessionId: string): Promise<boolean> {
  const result = await docClient.send(new GetCommand({
    TableName: SESSIONS_TABLE,
    Key: { session_id: sessionId },
  }))
  return result.Item?.status === 'active'
}
```

Called from any server component or route handler that requires an active subscription.

### 3.5 Customer Portal (`POST /api/stripe/portal`)

1. Read `ri_session` cookie
2. Call `getActiveSession(sessionId)` — return `403` if missing or not `'active'`
3. Look up `stripe_customer_id` from `brief_sessions`
4. Create Stripe Billing Portal session → redirect

### 3.6 Sign-out (`POST /api/auth/signout`)

Sets `ri_session` with `Max-Age=0` (clears cookie). Redirects to `/`. No DynamoDB deletion — TTL handles cleanup.

---

## 4. Pages & Routing

| Route | Type | Access | Notes |
|---|---|---|---|
| `/briefs` | Page | Public | `force-dynamic`; branches on session state |
| `/briefs/[id]` | Page | Public if `is_latest`, else active session | Server-side auth check |
| `/subscribe` | Page | Public | Price cards; handles `?error=payment_incomplete` |
| `/account` | Page | Active session | `noindex`; excluded from sitemap |
| `/api/briefs/ingest` | Route handler | `BRIEF_API_KEY` | POST |
| `/api/stripe/checkout` | Route handler | Public | POST |
| `/api/stripe/success` | Route handler | Public | GET, Stripe redirect target |
| `/api/stripe/webhook` | Route handler | Stripe signature | POST, raw body |
| `/api/stripe/portal` | Route handler | Active session | POST |
| `/api/auth/signout` | Route handler | POST | Clears cookie, redirects `/` |

### 4.1 Auth Check Pattern (Server Components)

Auth lives in server components, not middleware — avoids Edge runtime / DynamoDB incompatibility.

```ts
// Example: /briefs/[id]/page.tsx
if (!brief.is_latest) {
  const sessionId = (await cookies()).get('ri_session')?.value
  const authorized = sessionId ? await getActiveSession(sessionId) : false
  if (!authorized) redirect('/subscribe')
}
```

### 4.2 `/briefs` Listing Page

- `export const dynamic = 'force-dynamic'` required (branches on session state)
- Checks `ri_session` cookie once → passes `isSubscriber: boolean` to card rendering
- **Latest brief card:** Full card, `"Latest"` badge, no lock, no CTA
- **Archive cards (anonymous):** Title + date visible; summary blurred/truncated; lock icon; "Subscribe to read" link
- **Archive cards (subscriber):** Full card, no lock

### 4.3 `/subscribe` Page

- Prices fetched via Stripe API with `next: { revalidate: 3600 }` — never hardcoded
- Monthly and annual price cards, each POSTing `{ priceId }` to `/api/stripe/checkout`
- Renders error banner if `?error=payment_incomplete` is present in URL

### 4.4 `/account` Page

- Server-side session check; redirects to `/subscribe` if not active
- Shows subscriber email and subscription status
- "Manage Subscription" form → `POST /api/stripe/portal`
- "Sign out" form → `POST /api/auth/signout`
- `<meta name="robots" content="noindex">` via Next.js metadata export

### 4.5 Sitemap

Add `/briefs` and `/subscribe`. Exclude `/account` and all `/briefs/[id]` URLs (dynamic DynamoDB content, not known at build time).

---

## 5. Markdown Renderer

**Library:** `react-markdown` + `remark-gfm` + `rehype-pretty-code`

- `react-markdown`: renders in server components, zero client JS
- `remark-gfm`: tables, strikethrough, task lists, footnotes (common in research briefs)
- `rehype-pretty-code`: Shiki-based syntax highlighting for code blocks in AI/ML content

Used in `src/components/BriefBody.tsx` (server component), called from `/briefs/[id]/page.tsx`.

---

## 6. New Files

### New
- `src/app/subscribe/page.tsx`
- `src/app/account/page.tsx`
- `src/app/api/briefs/ingest/route.ts`
- `src/app/api/stripe/checkout/route.ts`
- `src/app/api/stripe/success/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/app/api/stripe/portal/route.ts`
- `src/app/api/auth/signout/route.ts`
- `src/components/BriefBody.tsx`
- `src/lib/sessions.ts`

### Modified
- `src/types/brief.ts` — add `body`, `is_latest`, `entity_type`; lock `BriefItem`
- `src/lib/briefs.ts` — update `normalizeBrief`; add GSI query for listing; update ingest helpers
- `src/app/briefs/page.tsx` — `force-dynamic`; session check; lock/blur on archive cards
- `src/app/briefs/[id]/page.tsx` — paywall check for non-latest briefs
- `src/app/sitemap.xml/route.ts` — add `/briefs`, `/subscribe`; exclude `/account`
- `.env.example` — add Stripe and sessions env vars
- `contentlayer.config.ts` — no change (briefs remain DynamoDB, not MDX)

---

## 7. Environment Variables (additions)

```
# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_MONTHLY_ID=
STRIPE_PRICE_ANNUAL_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Sessions
BRIEF_SESSIONS_TABLE_NAME=brief_sessions

# Brief Ingestion (was already scaffolded)
BRIEF_API_KEY=
```

---

## 8. DynamoDB Infrastructure Changes

- `briefs` table: add `entity_type` attribute to all records; add GSI `entity_type-date-index`
- `brief_sessions` table: new table with GSI `stripe_customer_id-index`
- Both tables provisioned via AWS SAM (`template.yaml`) or Terraform, not CloudFormation inline
