# Design Polish: Refined Dark Editorial

**Date:** 2026-02-16
**Aesthetic direction:** Refined dark editorial — surgical orange, generous whitespace, one composed hero moment, quiet everywhere else.
**Scope:** Activate the existing design system (`globals.css` utilities) that were defined but never applied, plus one targeted CSS animation addition.

---

## Approved Design Decisions

### Aesthetic Direction
Option A: Refined dark editorial. Precise and restrained. Orange does surgical work as a single accent. Large quiet type, generous whitespace. The orange underline on headings is the loudest thing on the page.

### Implementation Approach
Approach B: Activate existing system + one targeted CSS extension. One `@keyframes ri-fade-up` animation added to `globals.css`. Everything else is applying classes that already exist. No new libraries, no new dependencies.

---

## Section 1: Global Animation Utility (`globals.css`)

Add a single keyframe + utility class:

```css
@keyframes ri-fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ri-fade-up {
  animation: ri-fade-up 0.5s ease-out both;
}
```

`animation-fill-mode: both` prevents flash before animation fires. Applied via inline `animation-delay` for staggering. Only used on the hero.

---

## Section 2: HomeHero (`src/components/HomeHero.tsx`)

Four changes:

1. **`.ri-hero`** on `<section>` — activates orange glow SVG backdrop at 10% opacity
2. **`.ri-heading`** on `<h1>` — fires the 96px orange gradient underline accent bar
3. **Staggered `.ri-fade-up`** on all three text elements:
   - h1: `animationDelay: '0ms'`
   - tagline p: `animationDelay: '120ms'`
   - subline p: `animationDelay: '240ms'`
4. **`min-h-[45vh] flex flex-col justify-center`** on `<section>` — proper vertical region

---

## Section 3: Homepage Cards (`src/app/page.tsx`)

- Replace `border border-gray-800 rounded-lg` with `.glass` on both cards
- Add `border-l-[3px] border-[color:var(--ri-accent)]` (static left accent border)
- Add hover: `hover:bg-white/[0.06]` with `transition-colors`
- Convert `<a>` links to `<Link>` (Next.js) with `.ri-link` class
- Add `<hr className="ri-divider my-8" />` between hero and card grid

---

## Section 4: About Page (`src/app/about/page.tsx`)

- Add `.ri-heading` to all `<h2>` section headings
- Add `<hr className="ri-divider my-8" />` between major sections
- Add `ri-list` class to the Connect `<ul>` — activates orange `::marker` bullets
- No layout changes, no new components

---

## Section 5: FooterCTA (`src/components/FooterCTA.tsx`)

- Add `flex-wrap` and `justify-center` to the button container
- Shorten labels: "Email" / "Substack" / "Mastodon" / "GitHub"

---

## Section 6: 404 Page (`src/app/not-found.tsx`)

- Remove mixed `bg-gray-800 ri-link` styling
- Replace with `.glass` panel link consistent with card style elsewhere

---

## Files Modified

| File | Change |
|------|--------|
| `src/app/globals.css` | Add `@keyframes ri-fade-up` + `.ri-fade-up` utility |
| `src/components/HomeHero.tsx` | `.ri-hero`, `.ri-heading`, staggered fade, min-height |
| `src/app/page.tsx` | `.glass` cards, left accent border, divider, `<Link>` |
| `src/app/about/page.tsx` | `.ri-heading` on h2s, dividers, `ri-list` on Connect |
| `src/components/FooterCTA.tsx` | `flex-wrap`, shorter labels |
| `src/app/not-found.tsx` | `.glass` link, consistent styling |

## Out of Scope

- Motion library (deferred to Module 2)
- Scroll-triggered animations (Module 2)
- Light mode (never — orange on black is the brand)
- Any copy changes
- New components or routes
