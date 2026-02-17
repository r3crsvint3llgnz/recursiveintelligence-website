# Module 1: Security & Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Secure the codebase, remove consulting-era code, update positioning to research/personal site, and set up clean dev workflow.

**Architecture:** Static Next.js 15 site; remove Notion integration entirely; update copy in-place; prepare env vars and analytics scaffold for future modules.

**Tech Stack:** Next.js 15.5.12+, React 19, Tailwind v4, TypeScript, CloudWatch RUM (scaffolded)

---

## Reference: tailwind-nextjs-starter-blog Analysis

Analyzed https://github.com/timlrx/tailwind-nextjs-starter-blog for proven patterns. Key adoptions for Module 1:

| Pattern | Source | Action |
|---------|--------|--------|
| `data/siteMetadata.js` | Reference | **Adopt** — centralize site config instead of scattered env vars |
| `app/seo.tsx` with `genPageMetadata()` | Reference | **Adopt** — reusable metadata helper for all pages |
| Layout title template `{ default, template }` | Reference | **Adopt** — already in our plan |
| `contentlayer2` (fork, not `contentlayer`) | Reference | **Module 2 note** — use `contentlayer2` + `next-contentlayer2`, NOT the original packages |
| `Brief` document type (parallel to `Blog`) | Reference | **Module 2 scope** — documented, not implemented here |
| RSS as postbuild script | Reference | **Module 3/4 scope** — not a Next.js route handler |
| `pliny` library | Reference | **Evaluate in Module 2** — provides search, analytics, newsletter, comments, UI |
| `coreContent()` for listings | Reference | **Module 3/4 scope** |

**What we keep from our own plan:** CloudWatch RUM scaffold, `.env.example` structure, copy updates, Notion cleanup, branch workflow.

---

## Codebase Reality (read before starting)

- Next.js is currently `15.4.6` — critical vuln, must force-update to `15.5.12`
- `src/lib/notion.tsx` exists but is **empty** (safe to delete)
- `src/notion-backup/` has two archived files — delete the whole dir
- `ChatGPT Image Aug 10, 2025, 08_09_01 PM.png` is in the **project root**, not `public/`
- `vercel.json` does **not** exist — skip that delete step
- `src/app/[slug]/page.tsx` is the old Notion-powered dynamic route — needs to be removed
- `src/middleware.ts` redirects `/contact` → `/` — remove this since we're dropping contact
- `.env.example` already exists — we'll overwrite it with proper content
- No test framework exists in this project — skip TDD steps, verify with build + lint + manual

---

## Task 1: Create Dev Branch

**Files:**
- Git operations only

**Step 1: Check git status**

```bash
cd /home/r3crsvint3llgnz/01_Projects/recursiveintelligence-website
git status
git branch -a
```

Expected: on `main` branch, clean working tree (or stash if dirty).

**Step 2: Create and push dev branch**

```bash
git checkout -b dev
git push -u origin dev
```

Expected: Branch `dev` created and tracking `origin/dev`.

**Step 3: Verify**

```bash
git branch -a
```

Expected: `* dev` listed, `remotes/origin/dev` listed.

**Step 4: Commit**

Nothing to commit yet — branch created, move on.

---

## Task 2: Update Next.js (Critical Security Fix)

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json` (auto-updated)

**Step 1: Update Next.js with force flag (required due to version range)**

```bash
cd /home/r3crsvint3llgnz/01_Projects/recursiveintelligence-website
npm install next@latest --legacy-peer-deps
```

If that fails, try:
```bash
npm install next@15.5.12 --force
```

**Step 2: Fix remaining audit issues**

```bash
npm audit fix
```

**Step 3: Verify audit clean**

```bash
npm audit
```

Expected: 0 vulnerabilities (or only warnings, no high/critical).

**Step 4: Verify build still works**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build completes without errors. It will likely warn about the `[slug]` dynamic route — that's fine for now, we'll fix it in Task 4.

**Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "security: update Next.js to fix critical vulnerabilities

- npm audit: 0 critical/high vulnerabilities
- Next.js bumped from 15.4.6 to latest"
```

---

## Task 3: Remove Deprecated Code & Unused Files

**Files:**
- Delete: `src/notion-backup/` (entire directory)
- Delete: `src/lib/notion.tsx` (empty file)
- Delete: `ChatGPT Image Aug 10, 2025, 08_09_01 PM.png` (project root)
- Delete: `src/app/services/page.tsx` and directory
- Uninstall: `@notionhq/client` package

**Step 1: Delete archived Notion code**

```bash
cd /home/r3crsvint3llgnz/01_Projects/recursiveintelligence-website
rm -rf src/notion-backup/
rm src/lib/notion.tsx
```

**Step 2: Delete unused image from project root**

```bash
rm "ChatGPT Image Aug 10, 2025, 08_09_01 PM.png"
```

**Step 3: Archive (not delete) services page**

```bash
mkdir -p src/app/_archived
mv src/app/services src/app/_archived/services
```

**Step 4: Uninstall Notion client**

```bash
npm uninstall @notionhq/client
```

**Step 5: Verify package.json**

Open `package.json` — `@notionhq/client` should be gone from `dependencies`.

**Step 6: Commit**

```bash
git add -A
git commit -m "cleanup: remove Notion integration and unused files

- Deleted src/notion-backup/ (archived reference code)
- Deleted src/lib/notion.tsx (empty placeholder)
- Removed ChatGPT image from project root
- Moved src/app/services/ to _archived/
- Uninstalled @notionhq/client"
```

---

## Task 4: Remove Notion-Powered Dynamic Route

The `src/app/[slug]/page.tsx` was the Notion CMS-powered dynamic page. With Notion removed, this route is broken and must go.

**Files:**
- Delete: `src/app/[slug]/` (entire directory)
- Modify: `src/middleware.ts` (remove contact redirect)

**Step 1: Delete the dynamic slug route**

```bash
cd /home/r3crsvint3llgnz/01_Projects/recursiveintelligence-website
rm -rf src/app/\[slug\]/
```

**Step 2: Simplify middleware.ts**

Read the current middleware, then replace with a minimal passthrough (we keep the file for future use):

Replace the entire content of `src/middleware.ts` with:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
```

**Step 3: Build to verify no broken imports**

```bash
npm run build 2>&1 | tail -20
```

Expected: Clean build, no errors about missing Notion imports.

**Step 4: Commit**

```bash
git add -A
git commit -m "cleanup: remove Notion-powered dynamic route and contact redirect

- Deleted src/app/[slug]/ (was Notion CMS dynamic page)
- Simplified middleware.ts to passthrough (no more /contact redirect)"
```

---

## Task 5: Update .gitignore

**Files:**
- Modify: `.gitignore`

**Step 1: Read current .gitignore**

Open `.gitignore` to see what's already there before adding.

**Step 2: Append new entries**

Add the following block to the end of `.gitignore` (only entries not already present):

```gitignore

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
Thumbs.db

# Temporary
/tmp/
```

Note: `.DS_Store`, `.env.local`, `.env.*`, `.vercel` are already covered by the default Next.js gitignore.

**Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: add IDE and OS entries to .gitignore"
```

---

## Task 6: Create Environment Files

**Files:**
- Overwrite: `.env.example`
- Create: `.env.local` (not tracked)

**Step 1: Overwrite .env.example**

Replace the entire content of `.env.example` with:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://recursiveintelligence.io
NEXT_PUBLIC_GARDEN_URL=https://recursiveintelligence.xyz

# Brief Ingestion API (added in Module 5)
# BRIEF_API_KEY=your-secret-key-here

# Analytics (Optional - CloudWatch RUM)
# NEXT_PUBLIC_AWS_RUM_APPLICATION_ID=
# NEXT_PUBLIC_AWS_RUM_IDENTITY_POOL_ID=
# NEXT_PUBLIC_AWS_RUM_REGION=us-east-1

# Development
NODE_ENV=development
```

**Step 2: Create .env.local for local dev**

Create `.env.local` (this will NOT be committed — it's already in .gitignore):

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GARDEN_URL=https://recursiveintelligence.xyz
NODE_ENV=development
```

**Step 3: Verify .env.local is gitignored**

```bash
git status
```

Expected: `.env.local` does NOT appear in the output (it's ignored).

**Step 4: Commit**

```bash
git add .env.example
git commit -m "chore: update .env.example with full variable documentation"
```

---

## Task 7: Update HomeHero Component

**Files:**
- Modify: `src/components/HomeHero.tsx`

**Context:** Current hero says "Human first. AI with purpose." and positions as a consulting firm. Replace with research-focused positioning.

**Step 1: Replace HomeHero.tsx content**

```tsx
export default function HomeHero() {
  return (
    <section className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
        Recursive Intelligence
      </h1>
      <p className="mt-4 text-xl md:text-2xl text-gray-200">
        Exploring AI, systems thinking, and philosophy of mind.
      </p>
      <p className="mt-2 text-lg text-gray-400">
        Learning in public through experiments, briefs, and research.
      </p>
    </section>
  );
}
```

**Step 2: Verify build**

```bash
npm run build 2>&1 | tail -10
```

Expected: Clean build.

**Step 3: Commit**

```bash
git add src/components/HomeHero.tsx
git commit -m "content: update hero to research positioning"
```

---

## Task 8: Update Homepage (page.tsx)

**Files:**
- Modify: `src/app/page.tsx`

**Context:** Homepage is currently just `<HomeHero />`. Add a brief content preview section below it with links to Articles and Briefs (routes that will be built in Modules 3-4).

**Step 1: Replace src/app/page.tsx**

```tsx
/*
  Homepage is intentionally static. Do not add data fetching here.
  Articles and briefs content sections will link to dedicated routes.
*/
import HomeHero from "../components/HomeHero";

export default function Page() {
  return (
    <main>
      <HomeHero />

      <section className="max-w-3xl mx-auto px-4 pb-12">
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">Articles</h3>
            <p className="text-gray-400 text-sm">
              Long-form writing on AI systems and philosophy of mind.
            </p>
            <a href="/blog" className="inline-block mt-4 text-orange-400 hover:underline">
              Read articles →
            </a>
          </div>
          <div className="border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">AI/ML Briefs</h3>
            <p className="text-gray-400 text-sm">
              Twice-daily research summaries synthesized from ~50 sources.
            </p>
            <a href="/briefs" className="inline-block mt-4 text-orange-400 hover:underline">
              View briefs →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
```

**Note:** `/blog` and `/briefs` routes don't exist yet (Modules 2-4). The links are placeholders — that's fine.

**Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "content: add articles/briefs preview cards to homepage"
```

---

## Task 9: Rewrite About Page

**Files:**
- Modify: `src/app/about/page.tsx`

**Context:** Current about page is consulting-focused (vision, mission, services). Full rewrite to research/personal focus.

**Step 1: Replace src/app/about/page.tsx**

```tsx
export const dynamic = "force-static";
export const revalidate = false;

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">About</h1>

      <div className="space-y-10 text-gray-200">
        <p className="text-xl">
          I&apos;m Seth Robins. I explore how intelligence emerges from systems —
          in AI, in minds, in organizations.
        </p>

        <section>
          <h2 className="text-2xl font-bold mb-4">What You&apos;ll Find Here</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Original Research &amp; Writing</h3>
              <p className="text-gray-400 text-sm">
                Long-form articles exploring AI systems, philosophy of mind, and
                industrial intelligence. I publish as ideas develop.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">AI/ML Briefs</h3>
              <p className="text-gray-400 text-sm">
                Twice-daily curated research summaries. An automated system
                analyzes ~50 AI/ML articles every 12 hours and generates
                synthesized briefs.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">AWS Experiments</h3>
              <p className="text-gray-400 text-sm">
                Projects I&apos;m building to explore ideas — agent frameworks,
                industrial automation prototypes, and research tools.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">The Recursive Garden</h3>
              <p className="text-gray-400 text-sm">
                My{" "}
                <a
                  href="https://recursiveintelligence.xyz"
                  className="text-orange-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  digital garden
                </a>{" "}
                is where messy thinking happens — notes, experiments, and
                experimental fiction.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Why This Exists</h2>
          <p className="text-gray-400 mb-3">
            This is <strong className="text-gray-200">learning in public</strong>. I&apos;m an autistic systems
            thinker with a full-time job elsewhere, and this is my independent
            research platform.
          </p>
          <p className="text-gray-400">
            Revenue from small digital products and support helps fund AWS costs
            for experiments, new hardware for AI research, time to develop open
            tools, and the knowledge infrastructure I&apos;m building.
          </p>
          <p className="text-gray-500 text-sm mt-3">Think of it as a self-sustaining research lab.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Connect</h2>
          <ul className="space-y-2 text-gray-400">
            <li>
              <strong className="text-gray-200">Digital Garden:</strong>{" "}
              <a href="https://recursiveintelligence.xyz" className="text-orange-400 hover:underline">
                recursiveintelligence.xyz
              </a>
            </li>
            <li>
              <strong className="text-gray-200">Substack:</strong>{" "}
              <a href="https://substack.com/@r3crsvint3llgnz" className="text-orange-400 hover:underline">
                @r3crsvint3llgnz
              </a>
            </li>
            <li>
              <strong className="text-gray-200">Mastodon:</strong>{" "}
              <a
                href="https://hachyderm.io/@r3crsvint3llgnz"
                className="text-orange-400 hover:underline"
                rel="me"
              >
                @r3crsvint3llgnz
              </a>
            </li>
            <li>
              <strong className="text-gray-200">GitHub:</strong>{" "}
              <a href="https://github.com/r3crsvint3llgnz" className="text-orange-400 hover:underline">
                r3crsvint3llgnz
              </a>
            </li>
            <li>
              <strong className="text-gray-200">Support:</strong>{" "}
              <a href="https://buymeacoffee.com/sethrobinsw" className="text-orange-400 hover:underline">
                Buy Me a Coffee
              </a>
            </li>
          </ul>
        </section>

        <section className="border-l-4 border-orange-500 pl-4 py-2">
          <p className="text-xs text-gray-500">
            <strong className="text-gray-400">Disclaimer:</strong> This is a personal research project
            representing my independent views. I am employed full-time elsewhere;
            this site is not affiliated with my employer.
          </p>
        </section>
      </div>
    </main>
  );
}
```

**Step 2: Verify build and lint**

```bash
npm run build 2>&1 | tail -10
npm run lint
```

Expected: Clean build, no lint errors. Fix any ESLint warnings before committing.

**Step 3: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "content: rewrite about page with research/personal positioning"
```

---

## Task 10: Update Root Layout Metadata

**Files:**
- Modify: `src/app/layout.tsx`

**Context:** Current metadata says "AI-first consulting" in description. Update to research focus. Keep all existing imports, fonts, and layout structure — only change the `metadata` export.

**Step 1: Read layout.tsx first**

Read the full file to understand its current structure before editing.

**Step 2: Replace only the metadata export**

Find the `export const metadata: Metadata = { ... }` block and replace it with:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === "production"
      ? (process.env.NEXT_PUBLIC_SITE_URL ?? getBaseUrl())
      : getBaseUrl()
  ),
  title: {
    default: "Recursive Intelligence | AI, Systems Thinking, Philosophy of Mind",
    template: "%s | Recursive Intelligence",
  },
  description:
    "Exploring AI, systems thinking, and philosophy of mind. Research, experiments, and learning in public by Seth Robins.",
  keywords: [
    "AI research",
    "systems thinking",
    "philosophy of mind",
    "artificial intelligence",
    "consciousness",
    "machine learning",
    "AWS",
    "agent systems",
  ],
  authors: [{ name: "Seth Robins" }],
  creator: "Seth Robins",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    title: "Recursive Intelligence",
    description: "Exploring AI, systems thinking, and philosophy of mind.",
    siteName: "Recursive Intelligence",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recursive Intelligence",
    description: "Exploring AI, systems thinking, and philosophy of mind.",
    creator: "@r3crsvint3llgnz",
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

**Step 3: Verify build**

```bash
npm run build 2>&1 | tail -10
```

**Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "seo: update metadata from consulting to research positioning"
```

---

## Task 11: Add CloudWatch RUM Analytics Scaffold

**Files:**
- Modify: `src/app/layout.tsx`

**Context:** Add CloudWatch RUM script that only fires in production when env vars are set. This is inert until AWS is configured in Module 6.

**Step 1: Add Script import to layout.tsx**

Add `import Script from "next/script";` to the existing imports in `layout.tsx`.

**Step 2: Add RUM script inside the `<head>` tag**

Find the `<head>` tag in the layout's JSX return and add this block inside it, before the closing `</head>`:

```tsx
{process.env.NODE_ENV === "production" &&
  process.env.NEXT_PUBLIC_AWS_RUM_APPLICATION_ID && (
    <Script
      id="cloudwatch-rum"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(n,i,v,r,s,c,x,z){
            x=window.AwsRumClient={q:[],n:n,i:i,v:v,r:r,c:c};
            window[n]=function(c,p){x.q.push({c:c,p:p});};
            z=document.createElement('script');
            z.async=true;
            z.src=s;
            document.head.insertBefore(z,document.head.getElementsByTagName('script')[0]);
          })(
            'cwr',
            '${process.env.NEXT_PUBLIC_AWS_RUM_APPLICATION_ID}',
            '1.0.0',
            '${process.env.NEXT_PUBLIC_AWS_RUM_REGION || 'us-east-1'}',
            'https://client.rum.us-east-1.amazonaws.com/1.0.2/cwr.js',
            {
              sessionSampleRate: 1,
              identityPoolId: '${process.env.NEXT_PUBLIC_AWS_RUM_IDENTITY_POOL_ID}',
              endpoint: "https://dataplane.rum.${process.env.NEXT_PUBLIC_AWS_RUM_REGION || 'us-east-1'}.amazonaws.com",
              telemetries: ["performance","errors","http"],
              allowCookies: true,
              enableXRay: false
            }
          );
        `,
      }}
    />
  )}
```

**Step 3: Verify build**

```bash
npm run build 2>&1 | tail -10
npm run lint
```

Expected: Clean build. If lint complains about `dangerouslySetInnerHTML`, that's acceptable — it's intentional.

**Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add CloudWatch RUM analytics scaffold (inactive until configured)"
```

---

## Task 12: Add siteMetadata.js (Centralized Site Config)

**Files:**
- Create: `data/siteMetadata.js`

**Context:** Adopted from tailwind-nextjs-starter-blog. Centralizes all site config (URL, social handles, etc.) in one place rather than scattering across env vars and hardcoded strings. This becomes the single source of truth that layout.tsx, seo.tsx, RSS scripts, and sitemap all import.

**Step 1: Create `data/` directory and file**

```bash
mkdir -p /home/r3crsvint3llgnz/01_Projects/recursiveintelligence-website/data
```

**Step 2: Create `data/siteMetadata.js`**

```js
/** @type {import('./siteMetadata').SiteMetadata} */
const siteMetadata = {
  title: 'Recursive Intelligence',
  author: 'Seth Robins',
  headerTitle: 'Recursive Intelligence',
  description:
    'Exploring AI, systems thinking, and philosophy of mind. Research, experiments, and learning in public.',
  language: 'en-us',
  theme: 'dark',
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL || 'https://recursiveintelligence.io',
  gardenUrl: 'https://recursiveintelligence.xyz',
  siteLogo: '/static/images/logo.png',
  socialBanner: '/static/images/twitter-card.png',
  mastodon: 'https://hachyderm.io/@r3crsvint3llgnz',
  email: '',
  github: 'https://github.com/r3crsvint3llgnz',
  substack: 'https://substack.com/@r3crsvint3llgnz',
  buymeacoffee: 'https://buymeacoffee.com/sethrobinsw',
  locale: 'en-US',
  // Analytics - configure in Module 6
  analytics: {
    // cloudwatchRum: {
    //   applicationId: process.env.NEXT_PUBLIC_AWS_RUM_APPLICATION_ID,
    //   identityPoolId: process.env.NEXT_PUBLIC_AWS_RUM_IDENTITY_POOL_ID,
    //   region: process.env.NEXT_PUBLIC_AWS_RUM_REGION || 'us-east-1',
    // },
  },
  // Comments - configure when needed
  comments: null,
  // Search - configure in Module 2
  search: null,
}

module.exports = siteMetadata
```

**Step 3: Commit**

```bash
git add data/siteMetadata.js
git commit -m "feat: add siteMetadata.js as centralized site config

Adopted from tailwind-nextjs-starter-blog pattern.
Single source of truth for URLs, social handles, analytics config."
```

---

## Task 13: Add seo.tsx Helper

**Files:**
- Create: `src/app/seo.tsx`

**Context:** Adopted from tailwind-nextjs-starter-blog. A `genPageMetadata()` helper that all non-post pages (about, blog listing, briefs listing) will use for consistent OG/Twitter metadata generation. Avoids repeating the same metadata object structure everywhere.

**Step 1: Create `src/app/seo.tsx`**

```tsx
import type { Metadata } from 'next'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const siteMetadata = require('../../data/siteMetadata')

interface PageSEOProps {
  title: string
  description?: string
  image?: string
  // Allow any additional metadata fields
  [key: string]: unknown
}

export function genPageMetadata({
  title,
  description,
  image,
  ...rest
}: PageSEOProps): Metadata {
  return {
    title,
    openGraph: {
      title: `${title} | ${siteMetadata.title}`,
      description: description || siteMetadata.description,
      url: './',
      siteName: siteMetadata.title,
      images: image ? [image] : [siteMetadata.socialBanner],
      locale: siteMetadata.locale,
      type: 'website',
    },
    twitter: {
      title: `${title} | ${siteMetadata.title}`,
      card: 'summary_large_image',
      images: image ? [image] : [siteMetadata.socialBanner],
    },
    ...rest,
  }
}
```

**Step 2: Update `src/app/about/page.tsx` to use genPageMetadata**

Add at the top of `src/app/about/page.tsx` (before the default export):

```tsx
import { genPageMetadata } from '../seo'

export const metadata = genPageMetadata({
  title: 'About',
  description:
    'Seth Robins — exploring AI, systems thinking, and philosophy of mind.',
})
```

**Step 3: Lint and build**

```bash
npm run lint
npm run build 2>&1 | tail -10
```

**Step 4: Commit**

```bash
git add src/app/seo.tsx src/app/about/page.tsx
git commit -m "feat: add genPageMetadata() SEO helper

Adopted from tailwind-nextjs-starter-blog. Consistent OG/Twitter
metadata generation for all non-post pages."
```

---

## Task 15: Final Validation & Push

**Step 1: Full clean build**

```bash
cd /home/r3crsvint3llgnz/01_Projects/recursiveintelligence-website
rm -rf .next
npm run build
```

Expected: Build completes successfully.

**Step 2: Lint**

```bash
npm run lint
```

Expected: No errors. Fix any warnings that are errors.

**Step 3: Audit**

```bash
npm audit
```

Expected: 0 high/critical vulnerabilities.

**Step 4: Manual spot-check in dev server**

```bash
npm run dev
```

Open http://localhost:3000 and verify:
- [ ] Homepage loads with new hero ("Recursive Intelligence / Exploring AI...")
- [ ] Articles and Briefs cards are visible
- [ ] About page shows research content (not consulting)
- [ ] `/services` returns 404
- [ ] No console errors
- [ ] Theme/styling intact (orange accents, dark background)
- [ ] Navigation works (NavTabs links)

**Step 5: Final commit summary and push**

```bash
git log --oneline -15
git push origin dev
```

---

## Deliverables Summary

| Area | Status after plan |
|------|------------------|
| Next.js security | Updated to 15.5.12+, 0 vulnerabilities |
| Notion code | Fully removed (`notion-backup/`, `lib/notion.tsx`, `@notionhq/client`, `[slug]` route) |
| Consulting copy | Removed from hero, homepage, about, metadata |
| Services page | Archived to `_archived/` |
| Middleware | Simplified to passthrough |
| Environment | `.env.example` documented, `.env.local` created |
| Analytics | CloudWatch RUM scaffolded (inert until Module 6) |
| SEO | Title, description, OG, Twitter updated |
| Branch | All changes on `dev`, pushed to remote |

---

## Next Steps (Future Modules)

- **Module 2:** Set up MDX content system (Contentlayer or next-mdx-remote)
- **Module 3:** Blog listing + detail pages
- **Module 4:** Briefs listing + detail pages
- **Module 5:** Brief ingestion API endpoint
- **Module 6:** AWS Amplify + CloudWatch RUM configuration
- **Module 7:** Migrate Substack content
