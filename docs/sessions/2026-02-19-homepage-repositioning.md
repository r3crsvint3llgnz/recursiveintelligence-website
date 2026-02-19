# Session Log: Homepage Repositioning
**Date:** 2026-02-19
**Branch:** `feat/homepage-repositioning` → merged to `main` via PR #16

---

## What Was Done

### Goal
Reposition the homepage away from generic "exploring AI/philosophy" framing toward a specific "applied AI methodology meets cognitive science" identity. Improve SEO, add conversion CTAs, and add disambiguation for traffic from Ricursive (the AI chip startup).

### Plan Evaluation (Three Rounds)
Three versions of the implementation plan were evaluated before touching code. Key issues caught in review:

**Round 1 caught:**
- Proposed blue `#0066cc` accent (conflicts with orange-on-black theme)
- Nested `<main>` tags in proposed JSX
- Disambiguation banner placed inside `page.tsx` (constrained to max-w-3xl, not full-width)
- 1200px container no-op inside existing max-w-3xl layout
- CSS class names not following `ri-*` prefix convention
- Plan proposed inlining sections into `page.tsx` instead of using components
- `siteMetadata.js` not updated as source of truth

**Round 2 caught:**
- `import siteMetadata from '@/data/siteMetadata'` — should use `require()` (CommonJS)
- `socialBanner: null` would emit `null` into OG `images[]` — omit instead
- `text-ri-accent` / `bg-ri-accent` don't exist — use `[color:var(--ri-accent)]` bracket syntax
- Step 4 layout pseudocode showed fictitious components (`SectionContainer`, `SearchProvider`)
- `<ri-divider />` is invalid JSX — use `<hr className="ri-divider my-8" />`
- `async Page()` violates "homepage must stay static" constraint
- `ri-heading` on `<h2>` creates double underline — only use on `<h1>`
- `sameAs` in JSON-LD included placeholder `linkedin` → would emit `undefined`

**Round 3 (revised plan):** All architectural issues resolved. Minor code-correctness issues remained — fixed during implementation.

### Implementation

Executed in a git worktree (`.worktrees/feat-homepage-repositioning`) to isolate from main.

**Files changed:**

| File | Change |
|------|--------|
| `data/siteMetadata.js` | New title/description (applied methodology framing); canonical Substack URL |
| `src/app/layout.tsx` | Metadata consumes `siteMetadata` via `require()`; JSON-LD Organization structured data; `DisambiguationBanner` imported and placed inside `<main>` before max-w-3xl wrapper |
| `src/components/DisambiguationBanner.tsx` | **New** — full-width Ricursive redirect notice; uses `ri-link` for orange links |
| `src/components/HomeHero.tsx` | New headline "Practical AI Methodology Meets Cognitive Science"; updated tagline; Substack + GitHub CTA buttons using `[color:var(--ri-accent)]` |
| `src/components/ValueProp.tsx` | **New** — "What We Do" with three principles; uses existing `.glass` class |
| `src/components/ResearchApplied.tsx` | **New** — four research items with left accent border; uses `.glass` |
| `src/app/page.tsx` | Assembles new sections; fixed pre-existing nested `<main>` (→ fragment); final order: Hero → Cards → ValueProp → ResearchApplied |

**Key implementation decisions:**
- `DisambiguationBanner` placed inside `<main>` but outside the `max-w-3xl` wrapper → achieves full-width without restructuring the layout
- Existing `.glass` class used for card-style components (no new CSS classes needed)
- `page.tsx` kept as sync function; `<main>` wrapper removed (was creating invalid nested `<main>`)
- `sameAs` in JSON-LD uses `mastodon`, `github`, `substack` — no placeholder fields

### Post-Merge Fixes

After PR #16 merged, several issues required follow-up commits:

**Substack URL wrong** (`80d8a4c`)
We used `https://recursiveintelligence.substack.com` — correct URL is `https://substack.com/@r3crsvint3llgnz`. Fixed in `siteMetadata.js`, `HomeHero.tsx`, `FooterCTA.tsx`, `about/page.tsx`.

**Card section order** (`76b750b`)
Cards (Articles / Briefs / Garden) were placed below ValueProp and ResearchApplied. Moved back up directly under the hero.

---

## Deployment Issues and Fixes

### Issue 1: Intermittent GitHub Auth Failure
**Jobs affected:** 21, 28
**Error:** `fatal: repository not found` / `CustomerError: Unable to clone repository`
**Cause:** Amplify's GitHub App connection drops intermittently. Not a code issue.
**Fix:** Retry the job — CLI: `aws amplify start-job --app-id d2dmx5f9lbvzyb --branch-name main --job-type RETRY --job-id <N> --region us-east-2 --profile seth-dev`

### Issue 2: npm lock file incompatibility (Copilot sub-PR)
**Jobs affected:** 22, 23
**Error:** `npm ci can only install packages when your package.json and package-lock.json are in sync`
**Cause:** GitHub Copilot's review agent ran `npm install` using npm 11 (Node 25), adding `"peer": true` annotations to lock file entries. Amplify uses `NODE_VERSION=20` (npm 10), which rejects these annotations as out-of-sync.
**Fix attempt 1** (`4cf5a76`): Used `nvm use v20` + `npm install --prefix /path` — FAILED because `--prefix` from workspace root produced an incomplete lock file missing `@swc/helpers@0.5.18`.
**Fix attempt 2** (`8b0c029`): Sourced nvm, switched to Node 20, and ran `npm install` from within the project directory in a single shell invocation. Verified `npm ci` passed before committing. This worked.

**Correct procedure** (must be one shell invocation from project root):
```bash
cd /path/to/recursiveintelligence-website
. ~/.nvm/nvm.sh && nvm use v20 && rm -f package-lock.json && npm install && npm ci
git add package-lock.json
```

---

## Lessons Learned

### Plan Evaluation Is Worth It
Three rounds of review before touching a file caught every real issue. The implementation went smoothly with zero rework once execution started, because all the architectural decisions were settled.

### AI Agents Silently Break Lock Files
Copilot (and any AI agent running on Node 22+) will regenerate `package-lock.json` with npm 11 format when it runs `npm install`. This is silent and passes local `npm ci` on newer Node but fails on Amplify's npm 10. **Check `git diff package-lock.json` after every AI-assisted PR.**

### `npm install --prefix` Is Not Equivalent to `cd && npm install`
Running `npm install --prefix /project/path` from a parent directory produces a different, incomplete lock file. Always `cd` into the project and run `npm install` directly.

### `nvm use` Does Not Persist Across Shell Calls
In Claude Code's Bash tool, `nvm use` in one tool call does not affect subsequent calls. All Node version setup, install, and verification must happen in a single chained shell command.

### Tailwind v4 Color Utilities
In this project's Tailwind v4 setup, CSS variable colors require bracket syntax:
- ✅ `text-[color:var(--ri-accent)]`
- ❌ `text-ri-accent` (does not work)

### Layout Structure Gotchas
- `layout.tsx` wraps all `page.tsx` output in `<div className="max-w-3xl mx-auto px-4">` — full-width elements must be placed outside this div (e.g., inside `<main>` but before the wrapper)
- `page.tsx` must not have its own `<main>` wrapper — renders inside layout's `<main>`, creating invalid nested `<main>` elements. Use a React fragment `<>` instead.
- `ri-heading` applies an orange underline accent bar via `::after` — only appropriate on `<h1>` level headings

### The eslint-disable for require() Is Sometimes Unnecessary
In `layout.tsx`, the `// eslint-disable-next-line @typescript-eslint/no-require-imports` comment produced a lint warning because the rule didn't trigger. Remove the disable comment when the linter doesn't flag the `require()`. Keep the comment where it is actually needed.
