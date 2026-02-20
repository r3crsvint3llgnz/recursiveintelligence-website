# Design: AI/ML Reading List + RSS Feed

**Date:** 2026-02-19
**Status:** Approved

## Overview

Expose a curated Raindrop.io collection (ID: `67035667`) of AI/ML news as:
1. A browsable `/reading-list` page on the website showing article titles, links, and per-item summaries (stored as Raindrop notes)
2. A machine-readable RSS 2.0 feed at `/rss/reading-list.xml`
3. A third CTA button "AI/ML News" added to the HomeHero button row linking to `/reading-list`

## Data Source

- **API:** `GET https://api.raindrop.io/rest/v1/raindrops/67035667`
- **Auth:** `Authorization: Bearer {RAINDROP_TOKEN}`
- **Fields used:** `title`, `link`, `note` (user-written summaries), `created`, `tags`
- **Collection ID:** hardcoded `67035667` (the AI/ML curated collection)
- **Collection does not need to be public** — bearer token authenticates as owner

## Architecture

```
RAINDROP_TOKEN (env var, embedded at build time via next.config.ts)
  ↓
Raindrop REST API (api.raindrop.io)
  ↓ server-side fetch, ISR revalidate: 3600
  ├── /reading-list         → page (title + link + summary + date)
  └── /rss/reading-list.xml → RSS 2.0 XML route handler
```

## New Files

| File | Purpose |
|------|---------|
| `src/app/reading-list/page.tsx` | ISR page rendering bookmark list |
| `src/app/rss/reading-list.xml/route.ts` | RSS 2.0 route handler |

## Modified Files

| File | Change |
|------|--------|
| `src/components/HomeHero.tsx` | Add "AI/ML News" `<Link href="/reading-list">` as third CTA button |
| `next.config.ts` | Add `RAINDROP_TOKEN` to `env` block |
| `src/app/sitemap.xml/route.ts` | Add `/reading-list` to static paths |
| `.env.example` | Document `RAINDROP_TOKEN` |

## Env Var Setup (manual)

1. Copy token value from SSM `/prod/ResearchAgent/Raindrop_Token` (us-east-1, profile: seth-dev)
2. Add `RAINDROP_TOKEN` to Amplify console (app `d2dmx5f9lbvzyb`, region `us-east-2`)
3. Add to `.env.local` for local dev

## Caching Strategy

ISR with `revalidate: 3600` on the page — cached at edge, regenerated hourly. The RSS
route handler also uses `revalidate: 3600` via `fetch` cache options. Raindrop API
outages won't break the page after first load.

## RSS Feed Format

Standard RSS 2.0 with:
- Channel: "AI/ML Reading List — Recursive Intelligence"
- Items: `<title>`, `<link>`, `<description>` (summary/note), `<pubDate>`, `<guid>`
- No new npm packages — plain string template (same pattern as `sitemap.xml/route.ts`)

## Constraints

- No `<main>` in `page.tsx` — layout provides it
- Use `<Link>` for the HomeHero internal CTA (not `<a>`)
- Tailwind v4 color syntax: `text-[color:var(--ri-accent)]`
- Run `npm run build` before committing
