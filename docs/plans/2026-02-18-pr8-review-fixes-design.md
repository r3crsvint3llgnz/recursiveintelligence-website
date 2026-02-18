# PR #8 Review Fixes — Design

**Date:** 2026-02-18
**Branch:** dev
**PR:** #8 — feat: Module 2 — blog, briefs, RSS, newsletter scaffold
**Scope:** Option B — fix blockers + should-fix items; defer `Scan→Query` optimization to Module 5

---

## Summary

10 targeted changes across 6 files to address the Copilot review comments before merging PR #8 to main. No new features, no scope creep — each change maps directly to a review comment.

---

## Section 1: Security

### 1. `src/app/briefs/[id]/page.tsx` — URL protocol validation
Add `isSafeUrl(url: string): boolean` helper that checks for `http:`/`https:` prefix (case-insensitive). Replace bare `<a href={item.url}>` with: safe URL → `<a>`, anything else → `<span>`. Prevents `javascript:` / `data:` XSS from DynamoDB-sourced URLs.

### 2. `src/app/blog/page.tsx` — Filter non-public posts from listing
Add `.filter((p) => p.access === 'public')` before sort. Members/paid posts no longer appear in the listing.

### 3. `src/app/blog/[slug]/page.tsx` — Gate non-public posts
Two guards:
- `generateStaticParams()`: filter to `access === 'public'` so non-public slugs are never statically generated
- Render function: `if (post.access !== 'public') return notFound()` as defense-in-depth against direct URL hits via the dynamic fallback

---

## Section 2: RSS Feed

### 4–6. `src/app/feed.xml/route.ts` — Three fixes
- **Hard-coded URL**: Replace `SITE_URL = 'https://www.recursiveintelligence.com'` with `getBaseUrl()` from `@/lib/baseUrl`
- **XML attribute escaping**: Extend `escapeXml()` to also escape `"` → `&quot;` and `'` → `&apos;` (needed because `escapeXml()` is used in the `atom:link href` attribute context)
- **CDATA `]]>` risk**: Replace CDATA wrapper on `<description>` with `escapeXml(post.description)` — removes the risk entirely since we have a working XML escaper

---

## Section 3: DynamoDB Reliability

### 7. `src/lib/briefs.ts` — Runtime validation instead of unsafe cast
Add `normalizeBrief(raw: unknown): Brief | null` that:
- Checks required string fields: `id`, `title`, `summary`, `category`
- Validates `date` is a parseable date string (`new Date(raw.date)` must not be `Invalid Date`)
- Defaults `items` to `[]` if missing or non-array
- Returns `null` for any malformed record

Replace `(response.Items ?? []) as Brief[]` with `.map(normalizeBrief).filter(Boolean)`.

### 8. `src/app/briefs/page.tsx` — Selective error swallowing
Replace catch-all with `isTableNotProvisionedError(err)` check (tests for `ResourceNotFoundException` in error name/message). Swallows only the "table not yet provisioned" case → empty state; re-throws everything else so real failures (bad credentials, IAM denial, network) surface.

---

## Section 4: Dependencies & Tooling

### 9. `package.json` — Two fixes
- Add `mdx-bundler` to `dependencies` (currently a transitive dep, will break with pnpm/Yarn PnP)
- Install `concurrently` as devDependency; update `dev` script from `contentlayer2 dev & next dev --turbopack` to `concurrently --kill-others "contentlayer2 dev" "next dev --turbopack"` (cross-platform, kills both on exit)

### 10. `src/components/MDXContent.tsx` — Fix brittle import path
Change `from "mdx-bundler/client/index.js"` → `from "mdx-bundler/client"` (package entrypoint, stable typings).

---

## Verification

After all changes: `npm run build` must pass with no errors before pushing to `dev`.

## Deferred

- `getBriefs()` uses `Scan` instead of `Query` — deferred to Module 5 (brief ingestion API) when DynamoDB key schema will be designed properly
- JSON parse error message in newsletter route — low priority nit, deferred
