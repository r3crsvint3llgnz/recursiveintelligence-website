# Session Log: research-agent → website pipeline integration
**Date:** 2026-02-19 (00:30 – 07:30 UTC)
**Branch:** main (website), main (research-agent)

---

## Goal

Get the research-agent briefing pipeline posting AI/ML briefs to the website
`/api/briefs/ingest` endpoint before the 11:00 UTC production run.

---

## What Was Fixed (in order)

### 1. personas.py Decimal serialization
`DynamoDB` returns numeric fields as `Decimal`, which is not JSON-serializable.
Added `_dumps()` helper and replaced all 4 `json.dumps()` call sites in
`build_equalizer_prompt` and `build_zeitgeist_prompt`. 189/189 tests pass.

### 2. Bedrock model access — claude-sonnet-4-6
Lambda was getting `AccessDeniedException` for `us.anthropic.claude-sonnet-4-6`.
Root cause: Marketplace-gated models must be unlocked by a user with
`aws-marketplace:ViewSubscriptions` / `aws-marketplace:Subscribe`. Called
`bedrock.converse()` once via `seth-dev` boto3 session → enabled `invoke_model`
account-wide. Previously attempted rollback to Sonnet 4.5 was reverted.

### 3. Story volume + topic bleed

**Problem A — 40 stories to briefing Lambda:** Scoring threshold (7/15) was too
loose, passing ~38/40. Lambda timed out synthesizing a 40-story brief.
- Added `MAX_BRIEFING_AI_ML_STORIES = 10`, `MAX_BRIEFING_WORLD_STORIES = 8`
  in `config/scoring_weights.py`
- `summarizer_handler.py`: sort passed stories by score desc, cap to top-N
  before sending to SQS briefing queue

**Problem B — AI/ML stories in WORLD brief:** Two root causes:
- `SCORE_WORLD_TEMPLATE` had no EXCLUDE clause for AI/ML content — Haiku was
  passing research papers and model releases through
- `AI_ML_KEYWORDS` was missing company names; AMBIGUOUS feeds (HN, WIRED,
  Ars Technica) routed AI/ML stories to WORLD/tech
- Fix: added EXCLUDE clause to scorer template; added company keywords to
  `feed_rules.py`

**Problem C — No weather/local news in WORLD brief:** `triage_handler.py`
was calling `json.dumps(context_data)` (raw dict) instead of
`loader.format_context_block(context_data)`. The Zeitgeist persona's
`[SYSTEM_CONTEXT_BLOCK]` marker was never being injected.

### 4. Lambda timeout
- 40-story Sonnet 4.5 brief exceeded 300s Lambda timeout
- Fix: increased Lambda timeout to 600s in Terraform
- Fix: added `Config(read_timeout=580)` to Bedrock client in `briefing_handler.py`
  (botocore's default HTTP read_timeout fires at ~300s regardless of Lambda timeout)

### 5. POST /api/briefs/ingest — 401 Unauthorized (three sub-issues)

#### Sub-issue A: BRIEF_API_KEY not set at runtime
**Root cause:** Amplify Hosting SSR Lambda runs in Amplify's managed account, not
the customer's account. App-level env vars (set in Amplify console) are passed to
the `npm run build` container but are NOT automatically injected into the SSR
Lambda function environment at request-time runtime.

**Fix:** Use the `env` section in `next.config.ts`. Next.js replaces
`process.env.VAR` references with literal values at compile time, so they're
available in the server-side bundle regardless of what the Lambda's runtime
`process.env` contains.

```typescript
// next.config.ts
env: {
  BRIEF_API_KEY: process.env.BRIEF_API_KEY ?? '',
  APP_REGION: process.env.APP_REGION ?? 'us-east-1',
  BRIEFS_TABLE_NAME: process.env.BRIEFS_TABLE_NAME ?? 'briefs',
  BRIEFS_AWS_ACCESS_KEY_ID: process.env.BRIEFS_AWS_ACCESS_KEY_ID ?? '',
  BRIEFS_AWS_SECRET_ACCESS_KEY: process.env.BRIEFS_AWS_SECRET_ACCESS_KEY ?? '',
},
```

**Verification path:** CloudWatch log group `/aws/amplify/{appId}` in the
customer's `us-east-2` account contains Lambda request logs. Add `console.log`
to the handler, deploy, hit the endpoint, check logs.

**Amplify RELEASE job type:** Manual `aws amplify start-job --job-type RELEASE`
can fail with "repository not found" due to GitHub auth timing issues. Always
trigger builds by pushing to git (webhook) instead.

#### Sub-issue B: CredentialsProviderError (500)
**Root cause:** After auth passed, the DynamoDB client failed to get credentials.
The Amplify SSR Lambda's execution role is in Amplify's managed account and has
no access to DynamoDB in the customer's account.

The `AmplifySSRLoggingRole` in the customer's IAM is NOT the Lambda execution
role — it's an Amplify service role with trust to `amplify.amazonaws.com` for
writing CloudWatch logs. Adding DynamoDB policies to it does nothing for the Lambda.

**Fix:** Create a dedicated IAM user `amplify-briefs-writer` with a minimal
inline policy (`GetItem, PutItem, UpdateItem, TransactWriteItems` on
`arn:aws:dynamodb:us-east-1:843475473749:table/briefs` only). Store credentials
in Amplify app-level env vars. Embed via `next.config.ts env`. Pass explicitly
to the `DynamoDBClient` constructor.

```typescript
const client = new DynamoDBClient({
  region: process.env.APP_REGION ?? 'us-east-1',
  ...(process.env.BRIEFS_AWS_ACCESS_KEY_ID
    ? {
        credentials: {
          accessKeyId: process.env.BRIEFS_AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.BRIEFS_AWS_SECRET_ACCESS_KEY ?? '',
        },
      }
    : {}),
})
```

**Result:** `POST /api/briefs/ingest` returns 201. Record confirmed in DynamoDB.

---

## Known Issues to Fix Before or After Next Run

### Critical: Brief ID includes date only, not time-of-day

**File:** `src/app/api/briefs/ingest/route.ts:119`
```typescript
const id = `${data.date.slice(0, 10)}-${slugify(data.category)}`
```

`data.date.slice(0, 10)` drops the time component. AM brief (T06:00:00Z) and
PM brief (T18:00:00Z) both produce id `"2026-02-19-ai-ml"`.

The PM brief would conflict with AM → 409 response → Lambda logs it as
"duplicate" and silently drops the PM brief. **This is data loss.**

**Proposed fix:**
```typescript
const hour = new Date(data.date).getUTCHours()
const period = hour < 12 ? 'am' : 'pm'
const id = `${data.date.slice(0, 10)}-${period}-${slugify(data.category)}`
// → "2026-02-19-am-ai-ml", "2026-02-19-pm-ai-ml"
```

### Minor: HTTP 200 vs 409 mismatch for idempotent re-ingest

**Route behavior:**
- Same content, re-ingest → 200 (treated as "already done")
- Different content, same ID → 409

**Lambda behavior (`_post_to_site`):**
- Expects 201 or 409 as success
- 200 → raises `RuntimeError` (Lambda retries → DLQ)

**Proposed fix (in `briefing_handler.py`):**
```python
if status in (200, 201):
    log("INFO", "briefing.site_ingest_ok", ...)
elif status == 409:
    log("INFO", "briefing.site_ingest_duplicate", ...)
```

---

## Infrastructure Installed

| Resource | Details |
|----------|---------|
| IAM user | `amplify-briefs-writer` (us-east-1) |
| IAM inline policy | `BriefsTableAccess` — GetItem/PutItem/UpdateItem/TransactWriteItems on `briefs` table |
| Amplify env vars added | `BRIEFS_AWS_ACCESS_KEY_ID`, `BRIEFS_AWS_SECRET_ACCESS_KEY` |
| DynamoDB table | `briefs` (us-east-1) — 0 items, clean for production run |

---

## Enhancements for Future Sessions

### Short-term (Module 3)
1. **Fix brief ID scheme** (see Known Issues above — do this before the PM run)
2. **Fix HTTP 200 handling** in `briefing_handler.py` `_post_to_site`
3. **Build `/briefs` listing page** — reads `__latest__` pointer, renders brief
4. **Build `/briefs/[id]` detail page** — full brief with source items
5. **Add `/api/briefs/latest` GET endpoint** — returns latest brief for the listing page

### Medium-term
6. **Move IAM credentials to SSM** — store `BRIEFS_AWS_ACCESS_KEY_ID` and
   `BRIEFS_AWS_SECRET_ACCESS_KEY` in SSM, reference them in Amplify env vars.
   Enables key rotation without Amplify console access.
7. **Key rotation process** — document how to rotate `BRIEF_API_KEY` and
   DynamoDB credentials (update SSM → update Amplify env var → push empty commit)
8. **CloudWatch alarm** — alert on 4xx/5xx responses from `/api/briefs/ingest`
   so silent drops don't go unnoticed
9. **`__latest__` pointer per category** — use `__latest__ai-ml` and
   `__latest__world` as pointer IDs if WORLD briefs ever go to the site
10. **Remove AmplifySSRLoggingRole BriefsTableAccess inline policy** — was added
    to the wrong role during debugging and has no effect; clean up for hygiene

### Architectural notes
- The `env` section in `next.config.ts` is the canonical pattern for all
  server-side env vars in this Amplify deployment. Whenever a new server-side
  env var is added: (1) add to Amplify console, (2) add to `next.config.ts env`,
  (3) deploy.
- CloudWatch logs for the SSR Lambda are at
  `/aws/amplify/d2dmx5f9lbvzyb` in `us-east-2` with stream names
  `main/YYYY/MM/DD/{uuid}`. Multiple concurrent streams exist for the same day.
