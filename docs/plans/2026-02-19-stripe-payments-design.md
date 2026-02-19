# Stripe Payments Design — Archive Subscriptions & Fund the Lab

**Date:** 2026-02-19
**Status:** Approved

---

## Overview

Two payment products on recursiveintelligence.io:

1. **Archive subscription** — monthly or annual. Unlocks the full AI/ML briefs archive. Latest brief always free.
2. **Fund the Lab** — two modes:
   - One-time contribution (custom amount). Gratitude only; no content access.
   - Patron recurring (monthly). Unlocks archive access, same as a subscription.

---

## Existing Infrastructure (no rebuild needed)

| Component | File | Status |
|-----------|------|--------|
| Stripe SDK | `stripe` v20.3.1 | ✅ installed |
| Stripe client | `src/lib/stripeClient.ts` | ✅ singleton |
| Checkout route | `src/app/api/stripe/checkout/route.ts` | ✅ subscription mode |
| Webhook route | `src/app/api/stripe/webhook/route.ts` | ✅ handles sub events |
| Success route | `src/app/api/stripe/success/route.ts` | ✅ creates session + sets cookie |
| Portal route | `src/app/api/stripe/portal/route.ts` | ✅ billing portal |
| Session lib | `src/lib/sessions.ts` | ⚠️ credentials bug (see below) |
| DynamoDB table | `brief_sessions` (us-east-1) | ✅ exists, correct GSI |
| Subscribe page | `src/app/subscribe/page.tsx` | ✅ monthly + annual cards |
| Account page | `src/app/account/page.tsx` | ✅ portal link |

---

## Bugs to Fix First

### Bug 1: `sessions.ts` missing DynamoDB credentials

`sessions.ts` instantiates `DynamoDBClient` without credentials. In Amplify SSR Lambda (managed account), this silently fails — identical to the bug previously fixed in `briefs.ts`.

**Fix:** Pass `BRIEF_SESSIONS_AWS_ACCESS_KEY_ID` + `BRIEF_SESSIONS_AWS_SECRET_ACCESS_KEY` explicitly, same pattern as `briefs.ts`.

### Bug 2: Stripe env vars not embedded in `next.config.ts`

Amplify SSR Lambda does not inject non-`NEXT_PUBLIC_` env vars at runtime. They must be embedded as literals at build time via `next.config.ts` `env` section.

Currently missing:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_MONTHLY_ID`
- `STRIPE_PRICE_ANNUAL_ID`
- `STRIPE_PRICE_PATRON_ID` (new)
- `BRIEF_SESSIONS_TABLE_NAME`
- `BRIEF_SESSIONS_AWS_ACCESS_KEY_ID`
- `BRIEF_SESSIONS_AWS_SECRET_ACCESS_KEY`

---

## Infrastructure Tasks (outside code)

### 1. Enable TTL on `brief_sessions`

```bash
aws dynamodb update-time-to-live \
  --table-name brief_sessions \
  --time-to-live-specification "Enabled=true,AttributeName=ttl" \
  --region us-east-1 --profile seth-dev
```

The code already sets `ttl` (unix epoch + 30 days) on every item; DynamoDB just needs TTL enabled to act on it.

### 2. Extend `amplify-briefs-writer` IAM permissions

Add `brief_sessions` table to the IAM policy for `amplify-briefs-writer` (same access as `briefs` table: GetItem, PutItem, UpdateItem, Query).

### 3. Set Stripe env vars in Amplify console

Once Stripe products are created:
- `STRIPE_SECRET_KEY` — from Stripe dashboard (live or test)
- `STRIPE_WEBHOOK_SECRET` — from Stripe webhook endpoint settings
- `STRIPE_PRICE_MONTHLY_ID` — archive monthly price ID
- `STRIPE_PRICE_ANNUAL_ID` — archive annual price ID
- `STRIPE_PRICE_PATRON_ID` — patron recurring price ID
- `BRIEF_SESSIONS_TABLE_NAME` = `brief_sessions`
- `BRIEF_SESSIONS_AWS_ACCESS_KEY_ID` — same IAM user as briefs
- `BRIEF_SESSIONS_AWS_SECRET_ACCESS_KEY` — same IAM user as briefs

### 4. Create Stripe products

Three products in Stripe dashboard:
1. **Archive Access — Monthly** → `STRIPE_PRICE_MONTHLY_ID`
2. **Archive Access — Annual** → `STRIPE_PRICE_ANNUAL_ID`
3. **Patron — Monthly** (any price) → `STRIPE_PRICE_PATRON_ID`

No product needed for one-time contributions; price is created dynamically per checkout.

Configure the Stripe webhook endpoint: `https://recursiveintelligence.io/api/stripe/webhook`
Events: `customer.subscription.deleted`, `customer.subscription.updated`, `invoice.payment_failed`

---

## Code Changes

### 1. `next.config.ts` — embed Stripe + sessions vars

Add to the `env` block:
```ts
STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? '',
STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? '',
STRIPE_PRICE_MONTHLY_ID: process.env.STRIPE_PRICE_MONTHLY_ID ?? '',
STRIPE_PRICE_ANNUAL_ID: process.env.STRIPE_PRICE_ANNUAL_ID ?? '',
STRIPE_PRICE_PATRON_ID: process.env.STRIPE_PRICE_PATRON_ID ?? '',
BRIEF_SESSIONS_TABLE_NAME: process.env.BRIEF_SESSIONS_TABLE_NAME ?? 'brief_sessions',
BRIEF_SESSIONS_AWS_ACCESS_KEY_ID: process.env.BRIEF_SESSIONS_AWS_ACCESS_KEY_ID ?? '',
BRIEF_SESSIONS_AWS_SECRET_ACCESS_KEY: process.env.BRIEF_SESSIONS_AWS_SECRET_ACCESS_KEY ?? '',
```

### 2. `src/lib/sessions.ts` — fix credentials

```ts
const client = new DynamoDBClient({
  region: process.env.APP_REGION ?? 'us-east-1',
  ...(process.env.BRIEF_SESSIONS_AWS_ACCESS_KEY_ID
    ? {
        credentials: {
          accessKeyId: process.env.BRIEF_SESSIONS_AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.BRIEF_SESSIONS_AWS_SECRET_ACCESS_KEY ?? '',
        },
      }
    : {}),
})
```

### 3. `src/app/briefs/[id]/page.tsx` — archive gating

```
Server component logic:
1. Fetch brief by ID
2. If brief.is_latest === true → render normally
3. Else:
   a. Read ri_session cookie
   b. getSessionRecord(sessionId)
   c. If record.status === 'active' → render
   d. Else → redirect('/subscribe?locked=1')
```

### 4. `src/app/briefs/page.tsx` — lock indicators

Public listing page. Add a lock icon (e.g. `🔒` or an SVG) next to briefs where `is_latest === false`. No redirect; clicking a locked brief navigates to the detail page which handles gating.

### 5. `/api/stripe/contribute/route.ts` — new route

Handles both patron recurring and one-time checkout:

```
POST { type: 'patron' }
  → checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: STRIPE_PRICE_PATRON_ID, quantity: 1 }],
      success_url: /api/stripe/success?checkout_session_id={CHECKOUT_SESSION_ID},
      cancel_url: /support,
    })
  → 303 redirect to Stripe Checkout

POST { type: 'one_time', amount: <cents> }
  → checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: amount,
          product_data: { name: 'Fund the Lab — Recursive Intelligence' },
        },
        quantity: 1,
      }],
      success_url: /support?thanks=1,
      cancel_url: /support,
    })
  → 303 redirect to Stripe Checkout
```

Validation: `amount` must be ≥ 100 (cents, i.e. $1 minimum).

### 6. `src/app/support/page.tsx` — new page

Two sections, styled with existing `glass` + `ri-*` classes:

**Section: Fund the Lab (one-time)**
- Heading + 1-2 sentence description
- Amount input (number, min $1, default $5, prefix `$`)
- "Give →" button → POST to `/api/stripe/contribute`
- On `?thanks=1`: show brief thank-you message (no archive access)

**Section: Become a Patron (recurring)**
- Fetches patron price from Stripe at render time (same `unstable_cache` pattern as subscribe page)
- Single card: price/interval, benefit ("includes archive access")
- "Become a Patron →" → POST to `/api/stripe/contribute`
- Falls back to "Patron tier coming soon" if `STRIPE_PRICE_PATRON_ID` unset

### 7. `src/app/subscribe/page.tsx` — add cross-link

Below the pricing cards, add:
> Looking to support the research without a subscription? [Fund the Lab →](/support)

### 8. `src/components/NavTabs.tsx` — add Support link

Add a "Support" tab linking to `/support` in the primary nav.

### 9. `src/app/sitemap.xml/route.ts` — add `/support`

---

## Data Flow Diagrams

### Archive Subscription
```
/subscribe → POST /api/stripe/checkout → Stripe Checkout
                                           ↓ (payment success)
                                  /api/stripe/success
                                           ↓
                                  creates brief_sessions record
                                           ↓
                                  sets ri_session cookie → /briefs
```

### Patron Recurring
```
/support → POST /api/stripe/contribute (type=patron) → Stripe Checkout
                                                          ↓ (payment success)
                                               /api/stripe/success
                                                          ↓
                                               creates brief_sessions record
                                                          ↓
                                               sets ri_session cookie → /briefs
```

### One-Time Contribution
```
/support → POST /api/stripe/contribute (type=one_time, amount) → Stripe Checkout
                                                                   ↓ (payment success)
                                                        /support?thanks=1
                                                        (no session created)
```

### Archive Access Check
```
/briefs/[id]
  → is brief.is_latest? → YES → render
                        → NO  → check ri_session cookie
                                  → valid active session? → YES → render
                                                          → NO  → redirect /subscribe?locked=1
```

### Subscription Lifecycle (webhook)
```
customer.subscription.updated/deleted → updateSessionStatus(customerId, status)
invoice.payment_failed → updateSessionStatus(customerId, 'past_due')
```
Works for both archive subscribers and patrons (no price-ID discrimination needed).

---

## File Change Summary

| File | Change |
|------|--------|
| `next.config.ts` | Add 8 env vars to `env` section |
| `src/lib/sessions.ts` | Fix DynamoDB credentials |
| `src/app/api/stripe/contribute/route.ts` | **New** — one-time + patron checkout |
| `src/app/support/page.tsx` | **New** — Fund the Lab page |
| `src/app/briefs/[id]/page.tsx` | Add session gate |
| `src/app/briefs/page.tsx` | Add lock indicators |
| `src/app/subscribe/page.tsx` | Add cross-link to /support |
| `src/components/NavTabs.tsx` | Add Support nav tab |
| `src/app/sitemap.xml/route.ts` | Add /support |

---

## Out of Scope

- Email notifications on subscription / contribution events
- Subscriber-exclusive content beyond the brief archive
- Free trial periods
- Coupon codes / discounts
- Blog post gating (only briefs archive for now)
