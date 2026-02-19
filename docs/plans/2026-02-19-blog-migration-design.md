# Blog Content Migration Design

**Date:** 2026-02-19
**Status:** Approved

## Overview

Migrate 9 existing published articles (7 Substack long-form, 2 LinkedIn medium-form) into the website's MDX blog system. The website becomes the canonical home for all content. Substack becomes a distribution channel only. All migrated content is public. Ongoing new posts are written here first with Claude assist, then optionally cross-posted.

---

## File Structure

```
content/blog/
  <slug>.mdx              # one MDX file per article

public/images/blog/
  <slug>/                 # folder per article, keyed to MDX slug
    hero.jpg
    diagram.png
    animation.gif
    ...

content/blog/
  _template.mdx           # new-post starter (prefixed _ so contentlayer ignores it)
```

Images are committed to the repo alongside MDX files. Referenced in MDX as `/images/blog/<slug>/filename.ext`. No external CDN or image hosting required.

---

## GIF Rendering

Next.js `<Image>` strips GIF animation. The fix is a custom MDX component registered in `MDXContent.tsx`:

- `.gif` extension → plain `<img>` tag (preserves animation)
- All other images → Next.js `<Image>` (optimization, lazy loading)

No special syntax required in MDX files — the component handles detection automatically via file extension.

---

## Conversion Checklist

Applied to every article during migration:

1. **Strip platform chrome**
   - Substack: publication name header, "Share", "Leave a comment", "N Restacks", subscriber chat prompt, restack buttons
   - LinkedIn: author block, reaction counts, comment prompts

2. **Replace subscription CTAs**
   - Remove "Subscribe Now - $5/month" blocks, Founding Member sections, paywall prompts
   - Replace with a single tasteful sentence: *"Subscribe for deeper dives and the full archive."* linking to `/subscribe`

3. **Update internal cross-references**
   - "As I wrote on LinkedIn / Substack" → link to `/blog/<slug>` once all articles are migrated
   - External research citations stay as-is

4. **Write frontmatter**
   ```mdx
   ---
   title: ""
   description: ""       # 1-2 sentence summary for listing + SEO
   date: YYYY-MM-DD      # original publication date
   tags: []
   featured: false       # true for 2-3 strongest pieces
   access: public
   ---
   ```

5. **Update image paths**
   - Place originals in `public/images/blog/<slug>/`
   - Update all image references in MDX to `/images/blog/<slug>/filename`

6. **Light editorial pass**
   - Remove Substack-native formatting quirks (extra blank lines, Substack emoji conventions)
   - Ensure voice is consistent across pieces
   - Fix any outdated references or broken external links

---

## New Post Template

`content/blog/_template.mdx` — prefixed with `_` so contentlayer2 skips it:

```mdx
---
title: ""
description: ""
date: YYYY-MM-DD
tags: []
featured: false
access: public
---

<!-- Write here -->
```

---

## Ongoing Publishing Flow

1. Duplicate `_template.mdx`, rename to the article slug
2. Write draft and iterate with Claude
3. Drop images into `public/images/blog/<slug>/`
4. Commit and push → Amplify builds → live at `/blog/<slug>`
5. Cross-post to Substack manually: paste body, add canonical link back to the website at the top

---

## Migration Order

Suggested order — strongest/most representative pieces first so the blog has substance on launch:

1. Flag 2-3 pieces as `featured: true` for homepage surfacing
2. Migrate in batches of 2-3 per session
3. Update cross-references between articles in a final pass once all 9 are live

---

## Out of Scope (for now)

- Automated Substack cross-posting
- Substack subscriber redirects
- Members/paid gating (all articles start as `access: public`)
- Image CDN or optimization pipeline beyond the GIF component fix
