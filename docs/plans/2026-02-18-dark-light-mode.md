# Dark/Light Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a user-toggleable dark/light mode with system-preference default, persisted in localStorage, using `next-themes`.

**Architecture:** `next-themes` manages theme state via a `data-theme` attribute on `<html>`. Tailwind v4's `@custom-variant dark` is configured to read that attribute (not `prefers-color-scheme`), so `dark:` utility classes work throughout. CSS custom properties define both themes; `.glass` and nav elements get explicit light overrides. A `ThemeToggle` client component in the header switches between modes.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Tailwind v4 (`@custom-variant`), `next-themes ^0.4`, inline SVG icons (no icon library)

---

## Codebase Reality (read before starting)

- `globals.css` already uses CSS custom properties (`--ri-bg`, `--ri-fg`, etc.) for all thematic colors — the foundation is solid
- `layout.tsx` has hardcoded `bg-black`, `text-gray-100`, `border-gray-800`, `text-gray-400` that bypass the design system — these must be replaced
- `NavTabs.tsx` uses `border-white/10`, `text-gray-400`, `hover:text-gray-200`, `bg-white/5` — dark-mode-only Tailwind utilities that need light mode variants
- Tailwind v4 does NOT use a `tailwind.config.js`. Dark mode variant is configured with `@custom-variant` in `globals.css`
- No test framework — verification is `npm run build` (TypeScript + Next.js compilation) + visual browser check
- Always run `npm run build` before committing. Lint warnings are fine; errors are not.

---

## Task 1: Install next-themes

**Files:**
- Modify: `package.json` (auto via npm)
- Modify: `package-lock.json` (auto)

**Step 1: Install**

```bash
npm install next-themes
```

Expected: `next-themes` appears in `dependencies` in `package.json`.

**Step 2: Verify build**

```bash
npm run build
```

Expected: clean build, no errors.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install next-themes"
```

---

## Task 2: Configure Tailwind v4 dark variant + CSS tokens

**Files:**
- Modify: `src/app/globals.css`

This task does three things in one file: (1) tells Tailwind what `dark:` means, (2) adds the new `--ri-border` token to dark theme, (3) defines the full light theme block, (4) adds `.glass` light override.

**Step 1: Add `@custom-variant` at the top of globals.css, immediately after the `@import` lines**

```css
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

This must come after `@import "tailwindcss"` but before any rule blocks. It tells Tailwind v4 that `dark:` classes activate when any ancestor element has `data-theme="dark"`.

**Step 2: Add `--ri-border` to the existing `:root` block**

Find the existing `:root` block (around line 33) and add the border token:

```css
:root{
  --ri-bg:#000000;
  --ri-fg:#e0e0e0;
  --ri-muted:#a5adbb;
  --ri-accent:#ff6600;
  --ri-accent-700:#ff8533;
  --ri-info:#36a7af;
  --ri-warning:#f5c42e;
  --ri-danger:#b43c3c;
  --ri-border: rgba(255,255,255,0.12);   /* ADD THIS LINE */
}
```

**Step 3: Add light theme block immediately after `:root { ... }` and the `body { ... }` line**

```css
[data-theme="light"]{
  --ri-bg:#ffffff;
  --ri-fg:#1a1a1a;
  --ri-muted:#6b7280;
  --ri-accent:#e55a00;
  --ri-accent-700:#ff6600;
  --ri-border: rgba(0,0,0,0.12);
}
```

**Step 4: Add `.glass` light override block after the existing `.glass:hover` rule**

```css
[data-theme="light"] .glass{
  background: rgba(0,0,0,0.03);
  border-color: rgba(0,0,0,0.10);
}
[data-theme="light"] .glass:hover{ background: rgba(0,0,0,0.06); }
```

**Step 5: Verify build**

```bash
npm run build
```

Expected: clean build.

**Step 6: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add light theme CSS tokens and Tailwind dark variant"
```

---

## Task 3: ThemeToggle component

**Files:**
- Create: `src/components/ThemeToggle.tsx`

**Step 1: Create the file**

```tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
  );
}

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Render nothing on the server to avoid hydration mismatch.
  // The button slot is reserved by the header layout so there's no layout shift.
  if (!mounted) {
    return <div className="w-8 h-8" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="w-8 h-8 flex items-center justify-center rounded-full border border-[color:var(--ri-border)] text-[color:var(--ri-muted)] hover:text-[color:var(--ri-fg)] hover:border-[color:var(--ri-accent)] transition-colors ri-accent-ring"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
```

**Step 2: Verify build**

```bash
npm run build
```

Expected: clean build, `ThemeToggle` compiled without errors.

**Step 3: Commit**

```bash
git add src/components/ThemeToggle.tsx
git commit -m "feat: add ThemeToggle client component (sun/moon, next-themes)"
```

---

## Task 4: Wire ThemeProvider and ThemeToggle into layout.tsx

**Files:**
- Modify: `src/app/layout.tsx`

This task does four things: adds `ThemeProvider`, adds `suppressHydrationWarning` to `<html>`, adds `ThemeToggle` to the header, and replaces all hardcoded dark-only Tailwind color classes.

**Step 1: Add imports at the top of `layout.tsx`**

Add after the existing component imports:

```tsx
import { ThemeProvider } from "next-themes";
import ThemeToggle from "../components/ThemeToggle";
```

**Step 2: Add `suppressHydrationWarning` to `<html>` and wrap `<body>` content in `ThemeProvider`**

Find the `return` in `RootLayout`. Change from:

```tsx
return (
  <html lang="en">
    ...
    <body className={`...`}>
      <Header />
      ...
    </body>
  </html>
);
```

To:

```tsx
return (
  <html lang="en" suppressHydrationWarning>
    ...
    <body className={`${inter.variable} ${spaceGrotesk.variable} font-inter antialiased min-h-screen`}>
      <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
        <Header />
        <AccentBar />
        <main className="pt-16 min-h-screen">
          <div className="max-w-3xl mx-auto px-4">
            {children}
            <FooterCTA />
          </div>
        </main>
        <Footer />
      </ThemeProvider>
    </body>
  </html>
);
```

Changes to note:
- `suppressHydrationWarning` on `<html>` (required — next-themes modifies `<html>` attrs server→client)
- Removed `bg-black text-gray-100` from `<body>` className — these are now handled by `body { background-color: var(--ri-bg); color: var(--ri-fg); }` in globals.css
- `<ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>` wraps all layout children

**Step 3: Fix the `Header` function — replace hardcoded colors and add ThemeToggle**

Find the `Header` function and change:

```tsx
function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[color:var(--ri-bg)] z-50 px-4 py-3 border-b border-[color:var(--ri-border)]">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <R3IMarkFinal size={20} />
          <span className={`${spaceGrotesk.variable} font-space-grotesk tracking-tight text-lg text-[color:var(--ri-fg)] hover:text-[color:var(--ri-accent)] transition-colors`}>
            RecursiveIntelligence.io
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <NavTabs />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
```

Changes:
- `bg-black` → `bg-[color:var(--ri-bg)]`
- `border-gray-800` → `border-[color:var(--ri-border)]`
- `text-gray-100` → `text-[color:var(--ri-fg)]`
- Nav + toggle wrapped in `flex items-center gap-2` div
- `<ThemeToggle />` added

**Step 4: Fix the `Footer` function — replace hardcoded colors**

```tsx
function Footer() {
  const currentYear = new Date().getFullYear();
  const gardenUrl =
    process.env.NEXT_PUBLIC_GARDEN_URL ??
    "https://recursiveintelligence.xyz/";

  return (
    <footer className="mt-16 py-8 border-t border-[color:var(--ri-border)]">
      <div className="max-w-3xl mx-auto px-4 text-center text-sm text-[color:var(--ri-muted)]">
        ...rest unchanged...
      </div>
    </footer>
  );
}
```

Changes:
- `border-gray-800` → `border-[color:var(--ri-border)]`
- `text-gray-400` → `text-[color:var(--ri-muted)]`

**Step 5: Verify build**

```bash
npm run build
```

Expected: clean build.

**Step 6: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: wire ThemeProvider, ThemeToggle, and fix hardcoded layout colors"
```

---

## Task 5: Fix NavTabs hardcoded dark-only classes

**Files:**
- Modify: `src/components/NavTabs.tsx`

NavTabs uses `border-white/10`, `text-gray-400`, `hover:text-gray-200`, `bg-white/5` — all dark-mode-only. Replace with CSS-var-based equivalents or `dark:` prefixed pairs.

**Step 1: Replace the className in NavTabs**

Current:
```tsx
className={
  "rounded-full px-3 py-1.5 border transition-colors " +
  (active
    ? "text-white border-[color:var(--ri-accent)] bg-white/5"
    : "text-gray-400 border-white/10 hover:text-gray-200 hover:bg-white/5")
}
```

Replace with:
```tsx
className={
  "rounded-full px-3 py-1.5 border transition-colors " +
  (active
    ? "text-[color:var(--ri-fg)] border-[color:var(--ri-accent)] dark:bg-white/5 bg-black/5"
    : "text-[color:var(--ri-muted)] border-[color:var(--ri-border)] hover:text-[color:var(--ri-fg)] dark:hover:bg-white/5 hover:bg-black/5")
}
```

**Step 2: Verify build**

```bash
npm run build
```

Expected: clean build.

**Step 3: Commit**

```bash
git add src/components/NavTabs.tsx
git commit -m "fix: replace dark-only Tailwind classes in NavTabs with theme-aware equivalents"
```

---

## Task 6: Fix blog post prose styles

**Files:**
- Modify: `src/app/blog/[slug]/page.tsx`

**Step 1: Replace `prose-invert` with `dark:prose-invert`**

Find the post body `<div>`:

```tsx
// Before
className="prose prose-invert prose-orange max-w-none prose-headings:font-space-grotesk prose-a:text-[color:var(--ri-accent)] prose-a:no-underline hover:prose-a:underline prose-code:before:content-none prose-code:after:content-none"

// After
className="prose dark:prose-invert prose-orange max-w-none prose-headings:font-space-grotesk prose-a:text-[color:var(--ri-accent)] prose-a:no-underline hover:prose-a:underline prose-code:before:content-none prose-code:after:content-none"
```

**Step 2: Verify build**

```bash
npm run build
```

Expected: clean build, `/blog/hello-world` still in SSG output.

**Step 3: Commit**

```bash
git add 'src/app/blog/[slug]/page.tsx'
git commit -m "fix: prose-invert → dark:prose-invert for light mode blog posts"
```

---

## Task 7: Final verification and PR

**Step 1: Full build + lint**

```bash
npm run build && npm run lint
```

Expected: both clean.

**Step 2: Manual browser check**

```bash
npm run dev
```

Verify in browser (localhost:3000):
- [ ] Toggle button appears in header (sun/moon icon)
- [ ] Clicking toggle switches between dark and light
- [ ] Light mode: white background, dark text, orange accent visible
- [ ] Dark mode: black background, light text — unchanged from current
- [ ] `.glass` panels look correct in both modes (not invisible in light)
- [ ] Blog post prose text readable in both modes
- [ ] NavTabs active/inactive states correct in both modes
- [ ] Reload preserves the selected theme (localStorage persistence)
- [ ] System preference respected on first visit (try with OS set to light, clear localStorage)

**Step 3: Commit design doc and push**

```bash
git add docs/plans/2026-02-18-dark-light-mode-design.md docs/plans/2026-02-18-dark-light-mode.md
git commit -m "docs: add dark/light mode design and implementation plan"
git push origin dev
```

**Step 4: Open PR**

```bash
gh pr create \
  --title "feat: dark/light mode with next-themes" \
  --base main \
  --head dev \
  --body "$(cat <<'EOF'
## Summary

- Adds user-toggleable dark/light mode via \`next-themes\`
- Sun/moon toggle button in header; defaults to system preference
- Light theme: white bg, charcoal text, same orange accent
- Tailwind v4 \`@custom-variant dark\` configured for \`data-theme\` attribute
- Fixes hardcoded dark-only colors in \`layout.tsx\` and \`NavTabs.tsx\`

## Test plan

- [ ] Toggle switches modes; choice persists across reloads
- [ ] System preference respected on first visit
- [ ] \`npm run build\` clean
- [ ] \`npm run lint\` clean
- [ ] Visual check: both modes look intentional on all pages

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
