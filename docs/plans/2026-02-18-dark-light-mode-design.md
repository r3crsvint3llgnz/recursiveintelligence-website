# Dark/Light Mode Design

**Date:** 2026-02-18
**Approach:** `next-themes` package (Option A)
**Scope:** User toggle with system preference default

---

## Summary

Add a user-toggleable dark/light mode using `next-themes`. Dark mode is the existing design. Light mode is clean white with the same orange accent. The toggle button lives in the header. System preference is the default on first visit; choice persists in `localStorage`.

---

## Section 1: CSS Tokens

Add light theme overrides to `globals.css`. Existing `:root` block stays as dark theme. Light theme applied via `[data-theme="light"]` (set by `next-themes` on `<html>`).

```css
[data-theme="light"] {
  --ri-bg: #ffffff;
  --ri-fg: #1a1a1a;
  --ri-muted: #6b7280;
  --ri-accent: #e55a00;       /* slightly deeper orange for contrast on white */
  --ri-accent-700: #ff6600;   /* hover */
  --ri-border: rgba(0, 0, 0, 0.12);
}
```

New token `--ri-border` added to both themes:
- Dark: `rgba(255, 255, 255, 0.12)`
- Light: `rgba(0, 0, 0, 0.12)`

`.glass` panel light-mode override — current dark bg (`rgba(255,255,255,0.03)`) is invisible on white:

```css
[data-theme="light"] .glass {
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.10);
}
[data-theme="light"] .glass:hover {
  background: rgba(0, 0, 0, 0.06);
}
```

---

## Section 2: Layout Cleanup

Replace hardcoded Tailwind color classes in `layout.tsx` with CSS-var equivalents:

| Current | Replacement |
|---------|-------------|
| `bg-black` on `<body>` | remove (handled by `body { background-color: var(--ri-bg) }` in globals.css) |
| `bg-black` on `<header>` | `bg-[color:var(--ri-bg)]` |
| `text-gray-100` on `<body>` | remove (handled by `body { color: var(--ri-fg) }`) |
| `text-gray-100` on header logo | `text-[color:var(--ri-fg)]` |
| `border-gray-800` | `border-[color:var(--ri-border)]` |
| `text-gray-400` in footer | `text-[color:var(--ri-muted)]` |

---

## Section 3: ThemeProvider + Toggle Component

**`layout.tsx`:**
- Wrap `<body>` contents in `<ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>`
- Add `suppressHydrationWarning` to `<html>` element (required by next-themes)
- Add `<ThemeToggle />` to the `Header` component, right of `<NavTabs />`

**New file: `src/components/ThemeToggle.tsx`:**
- `"use client"` directive
- `useTheme()` from `next-themes`
- Button renders sun icon in dark mode, moon icon in light mode
- Uses `mounted` guard (standard next-themes pattern) to avoid hydration mismatch
- Styled to match existing nav: small, accessible, `ri-accent-ring` focus style
- SVG icons inline (no icon library dependency)

---

## Section 4: Blog Prose Fix

`src/app/blog/[slug]/page.tsx` — replace `prose-invert` with `dark:prose-invert`:

```tsx
// before
className="prose prose-invert prose-orange ..."

// after
className="prose dark:prose-invert prose-orange ..."
```

Requires Tailwind dark mode to be configured to use `class` or `selector` strategy (Tailwind v4 uses `@variant dark` — needs `data-theme` selector alignment with next-themes).

---

## Files Changed

| File | Change |
|------|--------|
| `package.json` | add `next-themes` dependency |
| `src/app/globals.css` | light theme token block, `.glass` light override, `--ri-border` token |
| `src/app/layout.tsx` | `ThemeProvider` wrapper, `suppressHydrationWarning`, cleanup hardcoded colors, add `ThemeToggle` |
| `src/app/blog/[slug]/page.tsx` | `prose-invert` → `dark:prose-invert` |
| `src/components/ThemeToggle.tsx` | new toggle button component |

---

## Deferred

- Per-page theme overrides (all pages use the same token set — sufficient)
- Custom Tailwind dark variant config (Tailwind v4 handles this via `@variant dark` pointing at `[data-theme="dark"]`)
