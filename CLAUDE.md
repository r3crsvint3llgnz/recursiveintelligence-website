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
| Hosting | AWS Amplify (us-east-2), app ID: `YOUR_AMPLIFY_APP_ID` |

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

See `.claude/rules/structure.md` for full file tree, homepage section order, module roadmap, and env var reference.

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

## Content Architecture

MDX content via `contentlayer2` (the maintained fork — do NOT use the original
`contentlayer` package which is unmaintained).

Two content types:
- `Blog` — long-form articles at `content/blog/**/*.mdx` → route `/blog/[slug]`
- `Brief` — twice-daily AI/ML research summaries (DynamoDB-backed) → route `/briefs/[slug]`

Both types use computed fields (slug, readingTime, toc) and layout selection via frontmatter.
RSS is served via a Next.js route handler at `src/app/feed.xml/`.

---

## Key Constraints

- **No consulting language.** This is a research/personal site. No "clients", "services",
  "advisory", or "deliverables" copy.
- **First-person only.** Copy must use "I/my", not "we/our". This is a personal research site,
  not a team or company.
- **Homepage must stay static.** No data fetching in `src/app/page.tsx`. Keep it sync.
- **No `<main>` in `page.tsx`.** Layout already provides `<main>`. Use `<>` fragment.
- **`_archived/` is not routed.** Next.js App Router excludes `_`-prefixed directories.
  Don't create routes inside `_archived/`.
- **Preserve the orange-on-black theme.** Do not introduce light mode or change the
  base color scheme without explicit instruction.
- **Use `<Link>` for internal navigation**, not `<a>` tags, so Next.js can prefetch.
- **Update `sitemap.xml/route.ts`** whenever new top-level routes are added.

---

## Deployment & Environment Variables

See `.claude/rules/deployment.md` — Amplify SSR env var embedding, DynamoDB cross-account
access, npm lock file fix, build retry commands, CloudWatch log commands.
See `.claude/rules/structure.md` — full env var table, module roadmap, brief ID format.
