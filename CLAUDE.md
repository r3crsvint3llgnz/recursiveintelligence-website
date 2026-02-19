# CLAUDE.md — recursiveintelligence-website

Guidance for Claude Code when working in this repository.

## Project Overview

Personal research website for Seth Robins / Recursive Intelligence. Positioned as an
applied AI methodology platform — practical frameworks for human-AI collaboration grounded
in cognitive science research. NOT a consulting site — do not add consulting language.

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
| Hosting | AWS Amplify (us-east-2), app ID: `d2dmx5f9lbvzyb` |

---

## Commands

```bash
npm run dev      # Dev server with Turbopack (localhost:3000)
npm run build    # Production build — run this to verify before committing
npm run start    # Serve production build
npm run lint     # ESLint (runs eslint src/)
npm test         # Vitest unit tests
```

**Always run `npm run build` before committing code changes.** Lint warnings are
acceptable; lint errors and build errors must be fixed.

---

## Project Structure

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
    baseUrl.ts          # NEXT_PUBLIC_SITE_URL → localhost fallback (set in Amplify env vars)
    email.ts            # mailto: URI builder

data/
  siteMetadata.js       # SINGLE SOURCE OF TRUTH for site config, URLs, social handles
                        # Uses CommonJS (module.exports) for RSS script compatibility
docs/
  plans/                # Implementation plan markdown files
  sessions/             # Session logs and post-mortems
```

---

## Homepage Architecture

Current section order in `src/app/page.tsx`:

1. `<HomeHero />` — headline, tagline, Substack + GitHub CTA buttons
2. `<hr className="ri-divider my-8" />` — gradient divider
3. Cards grid — Articles / AI/ML Briefs / Recursive Garden (navigation)
4. `<hr className="ri-divider my-8" />`
5. `<ValueProp />` — "What We Do" + three principles
6. `<hr className="ri-divider my-8" />`
7. `<ResearchApplied />` — four research items with accent borders

**`page.tsx` must:**
- Be a sync function (no `async`) — no data fetching
- Use a React fragment `<>` as root (NOT `<main>`) — layout already provides `<main>`
- Stay static — content only, no API calls

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
- `.ri-heading` — heading with orange underline accent bar (h1 only — looks wrong on h2+)
- `.ri-section` — top-border section divider
- `.glass` — frosted glass panel (dark bg, blur, border) — use this for cards
- `.ri-page-bg` — subtle top glow effect
- `.ri-hero` — hero background glow variant
- `.ri-stripe` — diagonal stripe accent bar
- `.ri-divider` — horizontal gradient divider

Use these classes instead of inline Tailwind for anything thematic. Use Tailwind
utilities for layout, spacing, and typography.

**Tailwind v4 color utilities:** CSS variable colors require bracket syntax:
```
text-[color:var(--ri-accent)]      ✅
bg-[color:var(--ri-accent)]        ✅
border-[color:var(--ri-accent)]    ✅
text-ri-accent                     ❌ does not work in this setup
```

---

## Layout Constraints

`layout.tsx` wraps all page content in `<div className="max-w-3xl mx-auto px-4">`.
This means page components are constrained to 48rem by default.

**For full-width elements** (e.g., `DisambiguationBanner`): place them inside `<main>`
but *before* the `max-w-3xl` wrapper div. This is how `DisambiguationBanner` works.

Do NOT add new wrappers or restructure layout — it will break the max-w-3xl constraint
for all pages.

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

Note: In some files (e.g. `layout.tsx`) the ESLint rule doesn't trigger and the
`eslint-disable` comment will produce a lint warning. Remove it when that happens.

**Social URLs (verified correct as of 2026-02-19):**
- Substack: `https://substack.com/@r3crsvint3llgnz`
- Mastodon: `https://hachyderm.io/@r3crsvint3llgnz`
- GitHub: `https://github.com/r3crsvint3llgnz`

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
- **Homepage must stay static.** No data fetching in `src/app/page.tsx`. Keep it sync.
- **No `<main>` in `page.tsx`.** Layout already provides `<main>`. Use `<>` fragment.
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

## Deployment Notes

### Amplify build environment

- **App ID:** `d2dmx5f9lbvzyb`
- **Region:** `us-east-2`
- **Branch env var:** `NODE_VERSION=20` (npm 10.x)
- **Build spec:** `npm ci --cache .npm --prefer-offline` → `npm run build`
- **Artifacts:** `.next/` directory

Amplify runs `npm ci` which is strict — lock file must exactly match `package.json`.

### Regenerating package-lock.json (REQUIRED after any AI-assisted PR)

AI agents (Copilot, etc.) running on Node 22+/npm 11+ will silently regenerate
`package-lock.json` with format fields (e.g. `"peer": true`) that npm 10 rejects.
Always check `git diff package-lock.json` after AI-assisted PRs.

**Always run all commands in a single shell invocation from within the project directory:**

```bash
cd /path/to/recursiveintelligence-website
. ~/.nvm/nvm.sh && nvm use v20 && \
  rm -f package-lock.json && \
  npm install && \
  npm ci    # must pass before committing
git add package-lock.json && git commit -m "fix: regenerate package-lock.json under Node 20"
```

**Critical pitfalls:**
- Do NOT use `npm install --prefix /path` from a parent directory — produces incomplete
  lock file missing transitive deps like `@swc/helpers@0.5.18`
- Do NOT run `nvm use` in a separate shell call — it won't persist; chain everything

### Intermittent GitHub auth failures

Amplify occasionally loses its GitHub App connection and fails with:
```
fatal: repository not found / CustomerError: Unable to clone repository
```
This is not a code issue. Retry the job:
```bash
aws amplify start-job \
  --app-id d2dmx5f9lbvzyb \
  --branch-name main \
  --job-type RETRY \
  --job-id <N> \
  --region us-east-2 \
  --profile seth-dev
```
If retries keep failing, reconnect GitHub in the Amplify console → App settings → Repository.

### Benign build warnings

These appear in every build log and can be ignored:
- `Unable to write cache: ERR_BAD_REQUEST` — Amplify cache backend glitch, doesn't affect build
- `Failed to set up process.env.secrets` — SSM path `/amplify/d2dmx5f9lbvzyb/main/` has no secrets; expected

---

## Module Roadmap

| Module | Status | Scope |
|--------|--------|-------|
| 1 — Security & Foundation | ✅ Complete | Next.js upgrade, Notion removal, copy update, siteMetadata, seo helper |
| 1.5 — Homepage Repositioning | ✅ Complete | New positioning, DisambiguationBanner, ValueProp, ResearchApplied, JSON-LD, CTAs |
| 2 — MDX Content System | Planned | contentlayer2, Blog + Brief document types, reading time, TOC |
| 3 — Blog pages | Planned | Listing + detail pages, RSS feed |
| 4 — Briefs pages | Planned | Listing + detail pages, separate RSS feed |
| 5 — Brief ingestion API | Planned | API endpoint for automated brief delivery |
| 6 — AWS Amplify + Analytics | 🔄 Partial | Amplify configured and deploying; CloudWatch RUM activation pending |
| 7 — Content migration | Planned | Migrate Substack articles to MDX |
