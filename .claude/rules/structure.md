# Project Structure Reference

```
src/
  app/
    layout.tsx          # Root layout: Header, Footer, AccentBar, DisambiguationBanner, fonts, metadata, JSON-LD
    page.tsx            # Homepage (static — do NOT add data fetching here, no <main> wrapper)
    about/page.tsx      # About page
    seo.tsx             # genPageMetadata() helper — use for all page metadata
    globals.css         # CSS variables + utility classes (ri-* prefix)
    _archived/          # Dead routes — Next.js excludes _ dirs from routing
    robots.txt/         # Route handler (static)
    sitemap.xml/        # Route handler (update when new routes are added)
  components/
    HomeHero.tsx        # Homepage hero: headline, tagline, Substack + GitHub CTAs
    ValueProp.tsx       # Homepage: "What We Do" section with three principles
    ResearchApplied.tsx # Homepage: "Recent Research Applied" section
    DisambiguationBanner.tsx  # Full-width Ricursive redirect notice (in layout)
    NavTabs.tsx         # Client component — primary nav
    AccentBar.tsx       # Orange stripe below header
    FooterCTA.tsx       # Footer call-to-action (injected in layout)
    EmailCTA.tsx        # Email CTA component
    brand/              # SVG brand mark components
  lib/
    baseUrl.ts          # NEXT_PUBLIC_SITE_URL → localhost fallback
    email.ts            # mailto: URI builder

data/
  siteMetadata.js       # SINGLE SOURCE OF TRUTH for site config, URLs, social handles
                        # Uses CommonJS (module.exports) for RSS script compatibility
docs/
  plans/                # Implementation plan markdown files
  sessions/             # Session logs and post-mortems
```

## Homepage section order (src/app/page.tsx)
1. `<HomeHero />` — headline, tagline, Substack + GitHub CTA buttons
2. `<hr className="ri-divider my-8" />`
3. Cards grid — Articles / AI/ML Briefs / Recursive Garden
4. `<hr className="ri-divider my-8" />`
5. `<ValueProp />` — "What We Do" + three principles
6. `<hr className="ri-divider my-8" />`
7. `<ResearchApplied />` — four research items with accent borders

## Module Roadmap
| Module | Status | Scope |
|--------|--------|-------|
| 1 — Security & Foundation | Complete | Next.js upgrade, Notion removal, copy update, siteMetadata, seo helper |
| 1.5 — Homepage Repositioning | Complete | New positioning, DisambiguationBanner, ValueProp, ResearchApplied, JSON-LD, CTAs |
| 2 — MDX Content System | Planned | contentlayer2, Blog + Brief document types, reading time, TOC |
| 3 — Blog pages | Planned | Listing + detail pages, RSS feed |
| 4 — Briefs pages (DynamoDB-backed) | In Progress | `/api/briefs/ingest` live; listing + detail pages pending |
| 5 — Brief ingestion API | Complete | `/api/briefs/ingest` endpoint, DynamoDB integration, IAM |
| 6 — AWS Amplify + Analytics | Partial | Amplify configured and deploying; CloudWatch RUM activation pending |
| 7 — Content migration | Planned | Migrate Substack articles to MDX |

## Brief ID format
`route.ts` produces IDs like `2026-02-19-am-ai-ml` / `2026-02-19-pm-ai-ml`.
Period (`am`/`pm`) derived from `new Date(data.date).getUTCHours() < 12`.
AM = 06:00 UTC, PM = 18:00 UTC as set by `_briefing_date_to_iso()` in the Lambda.

## Environment Variables
| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL | prod only |
| `NEXT_PUBLIC_GARDEN_URL` | Link to Recursive Garden | optional |
| `NEXT_PUBLIC_AWS_RUM_APPLICATION_ID` | CloudWatch RUM app ID | prod only |
| `BRIEF_API_KEY` | Shared secret for `/api/briefs/ingest` auth | prod only |
| `APP_REGION` | AWS region for DynamoDB (`us-east-1`) | prod only |
| `BRIEFS_TABLE_NAME` | DynamoDB table name (`briefs`) | prod only |
| `BRIEFS_AWS_ACCESS_KEY_ID` | IAM user `amplify-briefs-writer` access key | prod only |
| `BRIEFS_AWS_SECRET_ACCESS_KEY` | IAM user `amplify-briefs-writer` secret key | prod only |
| `OWNER_ACCESS_TOKEN` | Secret token gating World brief detail pages (`?t=`) | prod only |

See `.env.example` for docs. Create `.env.local` for local dev (gitignored).
All server-side vars must also be in `next.config.ts → env`. See `.claude/rules/deployment.md`.
