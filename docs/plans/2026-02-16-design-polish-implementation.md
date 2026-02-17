# Design Polish: Refined Dark Editorial — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Activate the existing design system utilities and add one CSS animation to make the site feel intentional and polished before the Module 1 PR.

**Architecture:** Pure CSS + TSX changes across 6 files. No new dependencies. The design system already exists in `globals.css` — we are applying classes that were defined but never used, plus adding one `@keyframes` animation. Aesthetic direction: refined dark editorial — surgical orange accents, generous whitespace, one composed hero reveal, quiet everywhere else.

**Tech Stack:** Next.js 16, Tailwind v4, CSS custom properties, existing `.ri-*` utility classes

**No test framework** — verify each task with `npm run build` and `npm run lint` instead of unit tests.

---

## Codebase Reality (read before starting)

- `globals.css` defines `.ri-hero` (orange glow backdrop), `.ri-heading` (orange underline on `::after`), `.glass` (frosted panel), `.ri-divider` (gradient line), `.ri-list` (orange markers), `.ri-link` (orange text) — **none of these are applied to the main pages yet**
- `HomeHero.tsx` is 15 lines — plain section with no classes from the design system
- `page.tsx` cards use `border border-gray-800 rounded-lg` — plain gray, no glass, no accent
- `about/page.tsx` h2s have no `.ri-heading`, ul has no `.ri-list`
- `FooterCTA.tsx` buttons don't wrap on mobile; labels are verbose
- `not-found.tsx` mixes `bg-gray-800` (inline Tailwind) with `.ri-link` (design system) — inconsistent
- Brand colors live in CSS variables: `--ri-accent: #ff6600`, `--ri-bg: #000000`
- Path alias `@/*` maps to `src/*` (from tsconfig.json)
- All pages are static — no data fetching, no server components that need `"use client"`

---

## Task 1: Add `ri-fade-up` Animation to globals.css

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Read the file first**

Read `src/app/globals.css` to find the right insertion point (after the existing custom utilities, before `@theme inline`).

**Step 2: Add the animation block**

Insert this block immediately before the `@theme inline {` block at the bottom of `globals.css`:

```css
/* Hero entrance animation */
@keyframes ri-fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ri-fade-up {
  animation: ri-fade-up 0.5s ease-out both;
}
```

`animation-fill-mode: both` (shorthand: `both`) means the element starts invisible before the animation fires — no flash on load.

**Step 3: Verify build**

```bash
cd /home/r3crsvint3llgnz/01_Projects/recursiveintelligence-website
npm run build 2>&1 | tail -10
```

Expected: Clean build, no errors.

**Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "style: add ri-fade-up entrance animation utility"
```

---

## Task 2: Activate HomeHero Design

**Files:**
- Modify: `src/components/HomeHero.tsx`

**Step 1: Read the current file**

Read `src/components/HomeHero.tsx` — it's 15 lines. Understand the current structure before editing.

**Step 2: Replace the entire file**

```tsx
export default function HomeHero() {
  return (
    <section className="ri-hero min-h-[45vh] flex flex-col justify-center max-w-3xl mx-auto py-12 px-4">
      <h1
        className="ri-heading ri-fade-up text-5xl md:text-6xl font-extrabold tracking-tight leading-tight"
        style={{ animationDelay: "0ms" }}
      >
        Recursive Intelligence
      </h1>
      <p
        className="ri-fade-up mt-6 text-xl md:text-2xl text-gray-200"
        style={{ animationDelay: "120ms" }}
      >
        Exploring AI, systems thinking, and philosophy of mind.
      </p>
      <p
        className="ri-fade-up mt-2 text-lg text-gray-400"
        style={{ animationDelay: "240ms" }}
      >
        Learning in public through experiments, briefs, and research.
      </p>
    </section>
  );
}
```

**What each change does:**
- `ri-hero` — activates the existing orange glow SVG backdrop (defined in globals.css)
- `min-h-[45vh] flex flex-col justify-center` — hero occupies a proper vertical region
- `ri-heading` on h1 — fires the 96px orange gradient underline accent bar
- `ri-fade-up` + staggered `animationDelay` — composed reveal: headline → tagline → subline
- `mt-6` (was `mt-4`) — slightly more breathing room between h1 and tagline since h1 now has the underline padding

**Step 3: Build and lint**

```bash
npm run build 2>&1 | tail -10
npm run lint 2>&1 | tail -10
```

Expected: Clean build, no lint errors.

**Step 4: Commit**

```bash
git add src/components/HomeHero.tsx
git commit -m "style: activate hero glow, heading accent, and staggered fade-in"
```

---

## Task 3: Upgrade Homepage Content Cards

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Read the current file**

Read `src/app/page.tsx`. The cards section uses `border border-gray-800 rounded-lg p-6`.

**Step 2: Replace the entire file**

```tsx
/*
  Homepage is intentionally static. Do not add data fetching here.
  Articles and briefs content sections will link to dedicated routes.
*/
import Link from "next/link";
import HomeHero from "../components/HomeHero";

export default function Page() {
  return (
    <main>
      <HomeHero />

      <hr className="ri-divider my-8" />

      <section className="max-w-3xl mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass border-l-[3px] border-[color:var(--ri-accent)] hover:bg-white/[0.06] transition-colors p-6">
            <h3 className="text-xl font-bold mb-2">Articles</h3>
            <p className="text-gray-400 text-sm">
              Long-form writing on AI systems and philosophy of mind.
            </p>
            <Link href="/blog" className="ri-link inline-block mt-4 text-sm">
              Read articles →
            </Link>
          </div>
          <div className="glass border-l-[3px] border-[color:var(--ri-accent)] hover:bg-white/[0.06] transition-colors p-6">
            <h3 className="text-xl font-bold mb-2">AI/ML Briefs</h3>
            <p className="text-gray-400 text-sm">
              Twice-daily research summaries synthesized from ~50 sources.
            </p>
            <Link href="/briefs" className="ri-link inline-block mt-4 text-sm">
              View briefs →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
```

**What each change does:**
- `<hr className="ri-divider my-8" />` — gradient divider line between hero and cards
- `glass` — frosted panel (existing class: `rgba(255,255,255,0.03)` bg, blur, border)
- `border-l-[3px] border-[color:var(--ri-accent)]` — permanent orange left accent border
- `hover:bg-white/[0.06] transition-colors` — subtle hover lift
- `<Link>` instead of `<a>` — enables Next.js client-side navigation + prefetching
- `ri-link` on the links — consistent orange style from design system

Note: `/blog` and `/briefs` don't exist yet — these remain intentional placeholder links.

**Step 3: Build and lint**

```bash
npm run build 2>&1 | tail -10
npm run lint 2>&1 | tail -10
```

Expected: Clean build. Lint may warn about the `<Link>` usage for non-existent routes — this is acceptable; Next.js doesn't error on links to future routes.

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "style: upgrade homepage cards to glass panels with orange accent"
```

---

## Task 4: Polish About Page Headings and Structure

**Files:**
- Modify: `src/app/about/page.tsx`

**Step 1: Read the current file**

Read `src/app/about/page.tsx` — it's ~80 lines. Note the h2 headings and the Connect ul.

**Step 2: Apply targeted edits**

Make three targeted edits (do NOT rewrite the whole file — just these specific changes):

**Edit A — h2 in "What You'll Find Here" section:**
Find: `<h2 className="text-2xl font-bold mb-4">What You&apos;ll Find Here</h2>`
Replace with: `<h2 className="ri-heading text-2xl font-bold mb-6">What You&apos;ll Find Here</h2>`

**Edit B — h2 in "Why This Exists" section:**
Find: `<h2 className="text-2xl font-bold mb-4">Why This Exists</h2>`
Replace with: `<h2 className="ri-heading text-2xl font-bold mb-6">Why This Exists</h2>`

**Edit C — h2 in "Connect" section:**
Find: `<h2 className="text-2xl font-bold mb-4">Connect</h2>`
Replace with: `<h2 className="ri-heading text-2xl font-bold mb-6">Connect</h2>`

**Edit D — Connect ul:**
Find: `<ul className="space-y-2 text-gray-400">`
Replace with: `<ul className="ri-list space-y-2 text-gray-400">`

**Edit E — Add dividers between sections.** After each closing `</section>` tag (except the last disclaimer section), add:
```tsx
<hr className="ri-divider" />
```

There are three `</section>` closing tags before the disclaimer section — add a divider after each of the first three.

**Step 3: Build and lint**

```bash
npm run build 2>&1 | tail -10
npm run lint 2>&1 | tail -10
```

Expected: Clean build, no errors.

**Step 4: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "style: add ri-heading accent and dividers to about page"
```

---

## Task 5: Fix FooterCTA Mobile Wrapping and Labels

**Files:**
- Modify: `src/components/FooterCTA.tsx`

**Step 1: Read the current file**

Read `src/components/FooterCTA.tsx`. The container is `div className="mt-16 flex justify-center gap-4"`.

**Step 2: Make two targeted edits**

**Edit A — Container: add `flex-wrap`**
Find: `<div className="mt-16 flex justify-center gap-4">`
Replace with: `<div className="mt-16 flex flex-wrap justify-center gap-3">`

**Edit B — Shorten all four labels:**
- `label="Let's talk"` → `label="Email"`
- `label="Ideas in progress"` → `label="Substack"`
- `label="Join the conversation"` → `label="Mastodon"`
- `label="Recursive Prompting"` → `label="GitHub"`

**Step 3: Build and lint**

```bash
npm run build 2>&1 | tail -10
npm run lint 2>&1 | tail -10
```

**Step 4: Commit**

```bash
git add src/components/FooterCTA.tsx
git commit -m "style: flex-wrap footer buttons and shorten labels"
```

---

## Task 6: Clean Up 404 Page Styling

**Files:**
- Modify: `src/app/not-found.tsx`

**Step 1: Read the current file**

Read `src/app/not-found.tsx`. The "Return Home" link currently uses `bg-gray-800 ri-link hover:underline` — a mix of inline Tailwind and design system that conflicts visually.

**Step 2: Replace the entire file**

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="max-w-3xl mx-auto py-24 px-4 text-center">
      <h1 className="ri-heading inline-block text-4xl font-bold mb-6">
        404
      </h1>
      <p className="text-gray-400 mb-8">
        This page doesn&apos;t exist — yet.
      </p>
      <Link
        href="/"
        className="glass inline-block px-6 py-3 ri-link font-semibold hover:bg-white/[0.06] transition-colors"
      >
        ← Return Home
      </Link>
    </main>
  );
}
```

**What changed:**
- h1 is now `ri-heading` with `inline-block` (required for the `::after` underline to render correctly on centered text)
- Copy change: "404 - Page Not Found" → "404" headline + "This page doesn't exist — yet." as body (more on-brand, less generic)
- Button uses `.glass` + `.ri-link` consistently — matches the card style on the homepage

**Step 3: Build and lint**

```bash
npm run build 2>&1 | tail -10
npm run lint 2>&1 | tail -10
```

**Step 4: Commit**

```bash
git add src/app/not-found.tsx
git commit -m "style: clean up 404 page with consistent design system classes"
```

---

## Task 7: Final Validation

**Step 1: Clean build**

```bash
cd /home/r3crsvint3llgnz/01_Projects/recursiveintelligence-website
rm -rf .next
npm run build
```

Expected: All 5 routes listed, clean.

**Step 2: Lint**

```bash
npm run lint
```

Expected: 0 errors.

**Step 3: Audit**

```bash
npm audit
```

Expected: 0 high/critical.

**Step 4: Start dev server and verify manually**

```bash
npm run dev
```

Check at http://localhost:3000:
- [ ] Hero: orange glow backdrop visible (subtle), h1 has orange underline accent bar, text fades in sequentially
- [ ] Homepage: gradient divider line between hero and cards, cards have glass effect + orange left border, hover brightens slightly
- [ ] About `/about`: h2s have orange underline, Connect list has orange bullet markers, dividers between sections
- [ ] Footer: buttons wrap on narrow window, short labels (Email / Substack / Mastodon / GitHub)
- [ ] 404: visit `/services` → clean 404 with glass button
- [ ] Theme intact: black background, orange accents, no regressions

**Step 5: Push**

```bash
git log --oneline -8
git push origin dev
```

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `src/app/globals.css` | `@keyframes ri-fade-up` + `.ri-fade-up` class |
| `src/components/HomeHero.tsx` | `.ri-hero`, `.ri-heading`, staggered `ri-fade-up`, `min-h-[45vh]` |
| `src/app/page.tsx` | `.glass` cards, left accent border, `ri-divider`, `<Link>` |
| `src/app/about/page.tsx` | `.ri-heading` on h2s, `ri-list` on ul, `ri-divider` between sections |
| `src/components/FooterCTA.tsx` | `flex-wrap`, shorter labels |
| `src/app/not-found.tsx` | `.glass` button, `ri-heading` on h1, cleaner copy |
