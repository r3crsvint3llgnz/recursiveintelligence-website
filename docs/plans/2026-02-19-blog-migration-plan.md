# Blog Content Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate 9 published articles (7 Substack, 2 LinkedIn) into the MDX blog system and wire up GIF-safe image rendering.

**Architecture:** Articles live as MDX files in `content/blog/<slug>.mdx`; images committed to `public/images/blog/<slug>/`; a custom MDX image component detects `.gif` extension and uses a plain `<img>` tag (preserving animation) while routing all other images through Next.js `<Image>` for optimization.

**Tech Stack:** contentlayer2 (MDX compilation), mdx-bundler (client rendering via `getMDXComponent`), Next.js `<Image>`, TypeScript

---

## Task 1: Commit the design doc

**Files:**
- Already created: `docs/plans/2026-02-19-blog-migration-design.md`

**Step 1: Commit**

```bash
cd /home/r3crsvint3llgnz/01_Projects/recursiveintelligence-website
git add docs/plans/2026-02-19-blog-migration-design.md
git commit -m "docs: add blog migration design doc"
```

---

## Task 2: GIF-aware image component in MDXContent

**Files:**
- Modify: `src/components/MDXContent.tsx`

**Background:** `getMDXComponent(code)` (from `mdx-bundler/client`) returns a React component.
Custom element overrides are passed as a `components` prop on the rendered `<Component />`.
The `img` key overrides all `![alt](src)` images in MDX. We detect `.gif` by extension.

Next.js `<Image>` requires either explicit `width`/`height` or `fill`. For inline MDX images
where dimensions aren't known ahead of time, use `width={800} height={600}` with
`style={{ height: 'auto', width: '100%' }}` — this preserves aspect ratio while enabling
format optimization (WebP conversion, responsive srcset).

**Step 1: Update MDXContent.tsx**

Replace the entire file with:

```tsx
"use client";

import Image from "next/image";
import { getMDXComponent } from "mdx-bundler/client";
import { useMemo } from "react";

interface MDXImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
}

function MDXImage({ src, alt, ...props }: MDXImageProps) {
  if (!src) return null;
  if (src.endsWith(".gif")) {
    // Plain <img> preserves animation — Next.js <Image> strips GIF frames
    return (
      <img
        src={src}
        alt={alt ?? ""}
        className="max-w-full h-auto"
        loading="lazy"
        {...props}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt ?? ""}
      width={800}
      height={600}
      style={{ height: "auto", width: "100%" }}
      className="max-w-full"
    />
  );
}

interface MDXContentProps {
  code: string;
}

export default function MDXContent({ code }: MDXContentProps) {
  const Component = useMemo(() => getMDXComponent(code), [code]);
  return <Component components={{ img: MDXImage }} />;
}
```

**Step 2: Build to verify**

```bash
cd /home/r3crsvint3llgnz/01_Projects/recursiveintelligence-website
npm run build
```

Expected: Build succeeds with no errors. (Lint warnings are acceptable.)

**Step 3: Commit**

```bash
git add src/components/MDXContent.tsx
git commit -m "feat: add GIF-aware MDX image component"
```

---

## Task 3: Create post template and image directory

**Files:**
- Create: `content/blog/_template.mdx`
- Create: `public/images/blog/.gitkeep`

**Step 1: Create `_template.mdx`**

Create `content/blog/_template.mdx` with exactly:

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

Note: The `_` prefix causes contentlayer2 to skip this file (it only processes `blog/**/*.mdx`
that don't start with `_`). Verify this is the case by checking the build doesn't produce
a post for this file.

**Step 2: Create `public/images/blog/` directory**

```bash
mkdir -p /home/r3crsvint3llgnz/01_Projects/recursiveintelligence-website/public/images/blog
touch /home/r3crsvint3llgnz/01_Projects/recursiveintelligence-website/public/images/blog/.gitkeep
```

**Step 3: Build to verify template is ignored**

```bash
npm run build
```

Expected: Build succeeds. No new route generated for `_template`. The existing
`hello-world` post is still the only entry on `/blog`.

**Step 4: Commit**

```bash
git add content/blog/_template.mdx public/images/blog/.gitkeep
git commit -m "feat: add blog post template and image directory"
```

---

## Task 4–12: Migrate each article (repeatable workflow)

Run this workflow once per article. Nine total: 7 Substack long-form, 2 LinkedIn medium-form.
Articles are provided by the user one at a time. Mark 2-3 strongest as `featured: true`.

### Per-article workflow

**Inputs needed from user:**
- The article's full text (paste from Substack/LinkedIn)
- Any images for the article (dropped into `public/images/blog/<slug>/`)

**Step A: Determine the slug**

Slugs should be lowercase, hyphen-separated, and match the article's topic. Examples:
- "Thinking in Systems with AI" → `thinking-in-systems-with-ai`
- "The Recursive Prompt" → `the-recursive-prompt`

**Step B: Create image directory**

```bash
mkdir -p public/images/blog/<slug>
```

Copy user-provided images into that directory. Rename files to be lowercase with hyphens
if they have spaces or special characters.

**Step C: Convert and write the MDX file**

Create `content/blog/<slug>.mdx`. Apply the full conversion checklist:

1. **Strip platform chrome**
   - Substack: remove publication name header, "Share", "Leave a comment", "N Restacks",
     subscriber chat prompt, restack buttons, Substack-native emoji conventions
   - LinkedIn: remove author block, reaction counts, comment prompts

2. **Replace subscription CTAs**
   - Remove: "Subscribe Now — $5/month", "Founding Member" sections, paywall prompts
   - Replace with: `*Subscribe for deeper dives and the full archive.*` linking to `/subscribe`
     Format: `[Subscribe for deeper dives and the full archive.](/subscribe)`

3. **Write frontmatter**
   ```mdx
   ---
   title: "Exact article title"
   description: "1-2 sentence summary for listing + SEO"
   date: YYYY-MM-DD        # original publication date
   tags: ["tag1", "tag2"]  # 2-4 topic tags
   featured: false         # true for 2-3 strongest pieces
   access: public
   ---
   ```

4. **Update image paths**
   - All image references → `/images/blog/<slug>/filename.ext`
   - Example: `![diagram](diagram.png)` → `![diagram](/images/blog/my-slug/diagram.png)`

5. **Cross-references**
   - "As I wrote on LinkedIn / Substack" → link to `/blog/<slug>` if that article is
     already migrated; otherwise leave a `<!-- TODO: update xref -->` comment
   - External research citations: leave as-is

6. **Light editorial pass**
   - Fix any Substack-native markdown quirks (extra blank lines, odd em-dash usage)
   - Ensure "I/my" first person throughout (not "we/our")
   - Fix outdated references or broken external links

**Step D: Build to verify**

```bash
npm run build
```

Expected: Build succeeds. The new article appears as a route in static params output.

**Step E: Commit**

```bash
git add content/blog/<slug>.mdx public/images/blog/<slug>/
git commit -m "feat(blog): migrate '<Article Title>'"
```

---

## Task 13: Update cross-references and push

After all 9 articles are migrated:

**Step 1: Search for TODO cross-reference comments**

```bash
grep -r "TODO: update xref" content/blog/
```

**Step 2: Update each `<!-- TODO: update xref -->` comment**

For each, replace the "As I wrote on LinkedIn/Substack" text with a proper internal link
`[article title](/blog/<slug>)`.

**Step 3: Final build**

```bash
npm run build
```

**Step 4: Push and deploy**

```bash
git add content/blog/
git commit -m "chore(blog): update cross-references between migrated articles"
git push
```

Amplify will pick up the push automatically (webhook). Build takes ~2-3 minutes.
Monitor: `aws amplify list-jobs --app-id d2dmx5f9lbvzyb --branch-name main --region us-east-2 --profile seth-dev`

---

## Verification Checklist

After all articles are live:

- [ ] `/blog` lists all 9 migrated articles (newest first)
- [ ] 2-3 articles show `featured: true` (not validated visually on listing yet — future module)
- [ ] Each article detail page renders at `/blog/<slug>`
- [ ] GIFs animate in browser (not static frames)
- [ ] No Substack platform chrome visible in any article
- [ ] All CTAs link to `/subscribe` (which redirects to Substack for now)
- [ ] `npm run build` exits 0 with no errors
- [ ] `npm run lint` exits 0 with no errors (warnings OK)
