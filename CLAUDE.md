# CLAUDE.md — recursiveintelligence-website

Guidance for Claude Code when working in this repository.

## Project Overview

Personal research website for Seth Robins / Recursive Intelligence. Positioned as a
learning-in-public research platform exploring AI, systems thinking, and philosophy of
mind. NOT a consulting site — do not add consulting language.

**Live domains:**
- `https://recursiveintelligence.io` — this website
- `https://recursiveintelligence.xyz` — the Recursive Garden (separate 11ty project)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind v4 + custom CSS variables |
| Fonts | Inter (body), Space Grotesk (headings) |
| Analytics | CloudWatch RUM (scaffolded, inactive until Module 6) |
| Hosting | TBD (AWS Amplify planned) |

---

## Commands

```bash
npm run dev      # Dev server with Turbopack (localhost:3000)
npm run build    # Production build — run this to verify before committing
npm run start    # Serve production build
npm run lint     # ESLint (runs eslint src/)
```

**Always run `npm run build` before committing code changes.** Lint warnings are
acceptable; lint errors and build errors must be fixed.

---

## Project Structure

```
src/
  app/
    layout.tsx          # Root layout: Header, Footer, AccentBar, fonts, metadata
    page.tsx            # Homepage (static — do NOT add data fetching here)
    about/page.tsx      # About page
    seo.tsx             # genPageMetadata() helper — use for all page metadata
    globals.css         # CSS variables + utility classes (ri-* prefix)
    _archived/          # Dead routes — Next.js excludes _ dirs from routing
    robots.txt/         # Route handler (static)
    sitemap.xml/        # Route handler (update when new routes are added)
  components/
    HomeHero.tsx        # Homepage hero section
    NavTabs.tsx         # Client component — primary nav
    AccentBar.tsx       # Orange stripe below header
    FooterCTA.tsx       # Footer call-to-action (injected in layout)
    EmailCTA.tsx        # Email CTA component
    brand/              # SVG brand mark components
  lib/
    baseUrl.ts          # NEXT_PUBLIC_SITE_URL → localhost fallback (set in Amplify env vars)
    email.ts            # mailto: URI builder

data/
  siteMetadata.js       # SINGLE SOURCE OF TRUTH for site config, URLs, social handles
                        # Uses CommonJS (module.exports) for RSS script compatibility
docs/
  plans/                # Implementation plan markdown files
```

---

## Design System

**Theme:** Orange on black. Do not change the base color scheme.

**CSS variables** (defined in `globals.css`):
```css
--ri-accent: #ff6600    /* primary orange */
--ri-accent-700: #ff8533 /* hover orange */
--ri-bg: #000000        /* page background */
--ri-fg: #e0e0e0        /* body text */
--ri-muted: #a5adbb     /* muted text */
```

**Utility classes:**
- `.ri-link` — orange link (hover + focus styles included)
- `.ri-heading` — heading with orange underline accent bar
- `.ri-section` — top-border section divider
- `.glass` — frosted glass panel (dark bg, blur, border)
- `.ri-page-bg` — subtle top glow effect
- `.ri-hero` — hero background glow variant
- `.ri-stripe` — diagonal stripe accent bar
- `.ri-divider` — horizontal gradient divider

Use these classes instead of inline Tailwind for anything thematic. Use Tailwind
utilities for layout, spacing, and typography.

---

## Metadata Pattern

All pages should export metadata using `genPageMetadata()` from `src/app/seo.tsx`:

```tsx
import { genPageMetadata } from '../seo'

export const metadata = genPageMetadata({
  title: 'Page Title',          // becomes "Page Title | Recursive Intelligence"
  description: 'Description.',  // overrides siteMetadata.description
})
```

The root layout (`layout.tsx`) sets the global metadata template and fallbacks. Page
metadata merges with it via Next.js's cascading Metadata API.

---

## Site Config

`data/siteMetadata.js` is the canonical source for:
- Site URL, Garden URL
- Social handles (Mastodon, GitHub, Substack, Buy Me a Coffee)
- Analytics config (CloudWatch RUM — currently commented out)
- Future: search config, comments config

Import it in server components as:
```ts
// eslint-disable-next-line @typescript-eslint/no-require-imports
const siteMetadata = require('../../data/siteMetadata')
```

The CommonJS format is intentional — RSS postbuild scripts (Module 3/4) will import
this same file from Node.js outside the Next.js compiler.

---

## Content Architecture (Planned)

Module 2 adds MDX content via `contentlayer2` + `next-contentlayer2` (the maintained
fork — do NOT use the original `contentlayer` package which is unmaintained).

Two content types are planned:
- `Blog` — long-form articles at `data/blog/**/*.mdx` → route `/blog/[slug]`
- `Brief` — twice-daily AI/ML research summaries at `data/briefs/**/*.mdx` → route `/briefs/[slug]`

Both types share computed fields (slug, readingTime, toc) and use layout selection
via frontmatter. RSS will be generated as postbuild scripts (not Next.js route handlers).

**Placeholder links** in `src/app/page.tsx` (`/blog`, `/briefs`) are intentional
stubs — convert `<a>` to `<Link>` when those routes are built.

---

## Key Constraints

- **No consulting language.** This is a research/personal site. No "clients", "services",
  "advisory", or "deliverables" copy.
- **Homepage must stay static.** No data fetching in `src/app/page.tsx`.
- **`_archived/` is not routed.** Next.js App Router excludes `_`-prefixed directories.
  Don't create routes inside `_archived/`.
- **Preserve the orange-on-black theme.** Do not introduce light mode or change the
  base color scheme without explicit instruction.
- **Use `<Link>` for internal navigation**, not `<a>` tags, so Next.js can prefetch.
- **Update `sitemap.xml/route.ts`** whenever new top-level routes are added.

---

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL | prod only |
| `NEXT_PUBLIC_GARDEN_URL` | Link to Recursive Garden | optional |
| `NEXT_PUBLIC_AWS_RUM_APPLICATION_ID` | CloudWatch RUM app ID | prod only |
| `NEXT_PUBLIC_AWS_RUM_IDENTITY_POOL_ID` | CloudWatch RUM identity pool | prod only |
| `NEXT_PUBLIC_AWS_RUM_REGION` | CloudWatch RUM region | prod only |

See `.env.example` for documentation. Create `.env.local` for local dev (gitignored).

---

## Module Roadmap

| Module | Status | Scope |
|--------|--------|-------|
| 1 — Security & Foundation | ✅ Complete | Next.js upgrade, Notion removal, copy update, siteMetadata, seo helper |
| 2 — MDX Content System | Planned | contentlayer2, Blog + Brief document types, reading time, TOC |
| 3 — Blog pages | Planned | Listing + detail pages, RSS feed |
| 4 — Briefs pages | Planned | Listing + detail pages, separate RSS feed |
| 5 — Brief ingestion API | Planned | API endpoint for automated brief delivery |
| 6 — AWS Amplify + Analytics | Planned | Hosting config, CloudWatch RUM activation |
| 7 — Content migration | Planned | Migrate Substack articles to MDX |
