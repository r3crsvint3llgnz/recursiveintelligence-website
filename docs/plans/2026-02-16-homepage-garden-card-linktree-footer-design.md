# Homepage Garden Card + Linktree Footer — Design

**Date:** 2026-02-16

## Changes

### 1. Homepage — Add Recursive Garden card (src/app/page.tsx)
- Change `grid md:grid-cols-2` → `grid md:grid-cols-3`
- Add third glass card: title "Recursive Garden", description "My digital garden — notes, experiments, and thinking in progress.", link "→ Explore the garden" → `https://recursiveintelligence.xyz`
- External link: `<a target="_blank" rel="noopener noreferrer">`
- Same style as existing cards: `.glass border-l-[3px] border-[color:var(--ri-accent)] hover:bg-white/[0.06] transition-colors p-6`

### 2. Footer — Add Linktree button (src/components/FooterCTA.tsx)
- Add fifth `LinkBtn` with inline SVG link icon
- Label: `"Linktree"`, URL: `https://linktr.ee/r3crsvint3llgnz`
- `rel="noopener noreferrer"`
