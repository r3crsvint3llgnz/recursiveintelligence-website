# Recursive Intelligence Website - Upgrade Roadmap

**Version:** 1.0  
**Date:** February 16, 2026  
**Goal:** Transform from static consulting site to dynamic content platform + AWS app showcase

---

## Overview

This roadmap transforms the Recursive Intelligence website into a Substack-like content platform for AI thought leadership while adding infrastructure to showcase AWS applications. The approach is phased to deliver value incrementally.

---

## Architecture Vision

### Current State
```
Static Next.js Site
├── Hard-coded content
├── No CMS
├── Email via mailto
└── 3 static pages (/, /about, /services)
```

### Target State
```
Dynamic Content Platform
├── MDX-based blog with 20+ articles
├── Newsletter integration
├── Project showcase with live demos
├── Author platform with bio/media
├── RSS feed & social sharing
├── Comments & engagement
├── Analytics & SEO optimization
└── AWS application hosting
```

---

## Phase 1: Foundation & Security (Week 1)

### 1.1 Security & Dependencies ⚠️ CRITICAL
**Priority:** P0 - Do immediately  
**Estimated Time:** 2-4 hours

**Tasks:**
- [ ] Run `npm audit` to identify vulnerabilities
- [ ] Run `npm audit fix` to auto-fix where possible
- [ ] Manually review and fix remaining issues
- [ ] Update dependencies to latest stable versions
- [ ] Test build after updates

**Validation:**
```bash
npm audit
# Should show 0 vulnerabilities
npm run build
npm run lint
```

### 1.2 Codebase Cleanup
**Priority:** P1  
**Estimated Time:** 2-3 hours

**Tasks:**
- [ ] Remove `/src/notion-backup/` directory (archived code)
- [ ] Remove unused images:
  - `ChatGPT Image Aug 10, 2025, 08_09_01 PM.png` (if unused)
- [ ] Update `.gitignore` to exclude:
  - `/tmp/` directory
  - `.env.local`
  - IDE files (`.vscode/`, `.idea/`)
- [ ] Create `.env.example` with template variables
- [ ] Update `README.md` with accurate project description

**Example `.env.example`:**
```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://recursiveintelligence.io
NEXT_PUBLIC_GARDEN_URL=https://recursiveintelligence.xyz

# Newsletter (Optional - add when implementing)
# CONVERTKIT_API_KEY=your_key
# CONVERTKIT_FORM_ID=your_form_id

# Analytics (Optional)
# NEXT_PUBLIC_ANALYTICS_ID=your_id
```

### 1.3 Analytics Setup
**Priority:** P1  
**Estimated Time:** 1 hour

**Tasks:**
- [ ] Set up CloudWatch RUM (AWS native) OR
- [ ] Set up Plausible Analytics (privacy-focused alternative)
- [ ] Add analytics script to `layout.tsx`
- [ ] Configure goals/events
- [ ] Test in production

**CloudWatch RUM (Recommended for AWS Amplify):**
```tsx
// src/app/layout.tsx
// Add CloudWatch RUM script from AWS console
// Or use AWS SDK for server-side tracking
```

**Alternative - Plausible Analytics:**
```tsx
// src/app/layout.tsx
<Script
  defer
  data-domain="recursiveintelligence.io"
  src="https://plausible.io/js/script.js"
/>
```

### 1.4 Environment Setup
**Priority:** P2  
**Estimated Time:** 1 hour

**Tasks:**
- [ ] Document local development setup
- [ ] Create development workflow guide
- [ ] Set up environment variables in AWS Amplify console
- [ ] Test deployment pipeline via git push

**Deliverables:**
- ✅ Zero security vulnerabilities
- ✅ Clean codebase
- ✅ Analytics tracking
- ✅ Environment documentation

---

## Phase 2: Blog Infrastructure (Weeks 2-3)

### 2.1 Content Strategy & Planning
**Priority:** P0  
**Estimated Time:** 4-6 hours

**Tasks:**
- [ ] Define content pillars (e.g., AI Strategy, Case Studies, Tutorials)
- [ ] Create content calendar (first 10 articles)
- [ ] Decide on MDX vs. Notion vs. other CMS
- [ ] Design blog post template/format
- [ ] Plan URL structure (`/blog/[slug]` vs `/articles/[slug]`)

**Recommended Decision: MDX with Contentlayer**
- Git-based workflow
- Type-safe content
- Fast build times
- No external dependencies
- Markdown familiarity

### 2.2 MDX Setup & Configuration
**Priority:** P0  
**Estimated Time:** 6-8 hours

**Tasks:**
- [ ] Install dependencies:
  ```bash
  npm install contentlayer next-contentlayer date-fns
  npm install -D @tailwindcss/typography
  ```
- [ ] Configure `contentlayer.config.ts`
- [ ] Create content schema for blog posts
- [ ] Set up MDX plugins (syntax highlighting, etc.)
- [ ] Create `/content/blog/` directory
- [ ] Update `next.config.ts` to include Contentlayer

**Example Schema:**
```typescript
// contentlayer.config.ts
import { defineDocumentType, makeSource } from 'contentlayer/source-files'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `blog/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    date: { type: 'date', required: true },
    author: { type: 'string', default: 'Seth Robins' },
    tags: { type: 'list', of: { type: 'string' } },
    featured: { type: 'boolean', default: false },
    coverImage: { type: 'string' },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (post) => post._raw.flattenedPath.replace('blog/', ''),
    },
    readingTime: {
      type: 'number',
      resolve: (post) => Math.ceil(post.body.raw.split(' ').length / 200),
    },
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post],
})
```

### 2.3 Blog Listing Page
**Priority:** P0  
**Estimated Time:** 4-6 hours

**Tasks:**
- [ ] Create `/src/app/blog/page.tsx`
- [ ] Design blog listing layout:
  - Article cards with title, description, date, tags
  - Featured article section
  - Pagination (client-side initially)
- [ ] Implement filtering by tag/category
- [ ] Add sorting options (newest, popular)
- [ ] Optimize for SEO (metadata, structured data)

**Example Structure:**
```tsx
// src/app/blog/page.tsx
import { allPosts } from 'contentlayer/generated'
import { compareDesc } from 'date-fns'

export default function BlogPage() {
  const posts = allPosts.sort((a, b) => 
    compareDesc(new Date(a.date), new Date(b.date))
  )
  
  return (
    <div>
      <h1>Articles</h1>
      <div className="grid gap-8">
        {posts.map((post) => (
          <ArticleCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  )
}
```

### 2.4 Blog Post Detail Page
**Priority:** P0  
**Estimated Time:** 6-8 hours

**Tasks:**
- [ ] Create `/src/app/blog/[slug]/page.tsx`
- [ ] Design article layout:
  - Hero section with title, date, reading time
  - Author bio section
  - Table of contents (auto-generated)
  - Reading progress bar
  - Social sharing buttons
  - Related articles section
- [ ] Add MDX components for rich content:
  - Code blocks with syntax highlighting
  - Callouts/notes
  - Images with captions
  - Embedded videos
- [ ] Implement structured data (JSON-LD)
- [ ] Add Open Graph images

**Example:**
```tsx
// src/app/blog/[slug]/page.tsx
import { allPosts } from 'contentlayer/generated'
import { getMDXComponent } from 'next-contentlayer/hooks'

export async function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }))
}

export default function BlogPost({ params }) {
  const post = allPosts.find((p) => p.slug === params.slug)
  const MDXContent = getMDXComponent(post.body.code)
  
  return (
    <article>
      <header>
        <h1>{post.title}</h1>
        <time>{post.date}</time>
      </header>
      <MDXContent />
    </article>
  )
}
```

### 2.5 First Content Batch
**Priority:** P0  
**Estimated Time:** 20-30 hours (content creation)

**Tasks:**
- [ ] Write 5 starter articles:
  1. "Why I Started Recursive Intelligence"
  2. "The Human-First AI Framework"
  3. "5 Questions Before Adopting AI"
  4. "Building Your First AI Agent Workflow"
  5. "The Recursive Intelligence Methodology"
- [ ] Create cover images for each
- [ ] Optimize for SEO (keywords, meta descriptions)
- [ ] Proofread and edit

**Content Guidelines:**
- 1,500-3,000 words per article
- Include code examples where relevant
- Add images/diagrams for clarity
- Use clear headings and structure
- Include actionable takeaways

**Deliverables:**
- ✅ Fully functional blog system
- ✅ 5 published articles
- ✅ SEO-optimized pages
- ✅ Rich content formatting

---

## Phase 3: Reader Engagement (Week 4)

### 3.1 Newsletter Integration
**Priority:** P1  
**Estimated Time:** 4-6 hours

**Tasks:**
- [ ] Choose newsletter platform:
  - **ConvertKit** (recommended for creators)
  - **Buttondown** (minimal, affordable)
  - **Substack** (has audience but less control)
- [ ] Create account and get API keys
- [ ] Install SDK/client library
- [ ] Create newsletter signup component
- [ ] Add signup form to:
  - Homepage
  - Blog listing page
  - End of each article
  - Footer
- [ ] Create `/api/subscribe` route
- [ ] Test subscription flow
- [ ] Create welcome email sequence

**Example Component:**
```tsx
// src/components/NewsletterSignup.tsx
'use client'
import { useState } from 'react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
      />
      <button type="submit" disabled={status === 'loading'}>
        Subscribe
      </button>
      {status === 'success' && <p>Thanks for subscribing!</p>}
      {status === 'error' && <p>Something went wrong. Try again?</p>}
    </form>
  )
}
```

### 3.2 Comments System
**Priority:** P1  
**Estimated Time:** 2-3 hours

**Tasks:**
- [ ] Set up Giscus (GitHub Discussions-based):
  - Enable Discussions on GitHub repo
  - Configure Giscus on giscus.app
  - Get configuration snippet
- [ ] Create `<Comments>` component
- [ ] Add to blog post template
- [ ] Style to match site theme
- [ ] Test commenting flow

**Giscus Setup:**
```tsx
// src/components/Comments.tsx
'use client'

export default function Comments() {
  return (
    <div className="giscus-container mt-16">
      <script
        src="https://giscus.app/client.js"
        data-repo="r3crsvint3llgnz/recursiveintelligence-website"
        data-repo-id="YOUR_REPO_ID"
        data-category="General"
        data-category-id="YOUR_CATEGORY_ID"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="dark"
        data-lang="en"
        crossOrigin="anonymous"
        async
      />
    </div>
  )
}
```

### 3.3 Social Sharing
**Priority:** P2  
**Estimated Time:** 3-4 hours

**Tasks:**
- [ ] Create `<ShareButtons>` component
- [ ] Add share functionality for:
  - Twitter/X
  - LinkedIn
  - Mastodon
  - Email
  - Copy link
- [ ] Style buttons
- [ ] Add to article pages
- [ ] Test sharing (preview cards)

### 3.4 RSS Feed
**Priority:** P1  
**Estimated Time:** 2-3 hours

**Tasks:**
- [ ] Create `/src/app/feed.xml/route.ts`
- [ ] Generate RSS XML from blog posts
- [ ] Include full content or excerpts
- [ ] Add to `<head>` as alternate link
- [ ] Test feed in reader

**Example:**
```typescript
// src/app/feed.xml/route.ts
import { allPosts } from 'contentlayer/generated'
import RSS from 'rss'

export async function GET() {
  const feed = new RSS({
    title: 'Recursive Intelligence',
    description: 'AI-first consulting and thought leadership',
    feed_url: 'https://recursiveintelligence.io/feed.xml',
    site_url: 'https://recursiveintelligence.io',
  })
  
  allPosts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.description,
      url: `https://recursiveintelligence.io/blog/${post.slug}`,
      date: post.date,
    })
  })
  
  return new Response(feed.xml(), {
    headers: { 'Content-Type': 'application/xml' },
  })
}
```

### 3.5 Search Functionality
**Priority:** P2  
**Estimated Time:** 4-6 hours

**Tasks:**
- [ ] Choose search solution:
  - **Pagefind** (static, free, recommended)
  - **Algolia DocSearch** (free for docs/blogs)
  - **Fuse.js** (client-side)
- [ ] Implement search index
- [ ] Create search UI component
- [ ] Add keyboard shortcuts (Cmd+K)
- [ ] Test search accuracy

**Deliverables:**
- ✅ Newsletter integration
- ✅ Comments on articles
- ✅ Social sharing
- ✅ RSS feed
- ✅ Search functionality

---

## Phase 4: Project Showcase (Weeks 5-6)

### 4.1 Projects Infrastructure
**Priority:** P1  
**Estimated Time:** 6-8 hours

**Tasks:**
- [ ] Create content schema for projects
- [ ] Set up `/content/projects/` directory
- [ ] Create `/src/app/projects/page.tsx`
- [ ] Create `/src/app/projects/[slug]/page.tsx`
- [ ] Design project card component
- [ ] Design project detail layout

**Project Schema Example:**
```typescript
export const Project = defineDocumentType(() => ({
  name: 'Project',
  filePathPattern: `projects/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    date: { type: 'date', required: true },
    tags: { type: 'list', of: { type: 'string' } },
    techStack: { type: 'list', of: { type: 'string' } },
    liveUrl: { type: 'string' },
    githubUrl: { type: 'string' },
    featured: { type: 'boolean', default: false },
    status: { 
      type: 'enum', 
      options: ['active', 'archived', 'in-progress'],
      default: 'active'
    },
  },
}))
```

### 4.2 First Project Entries
**Priority:** P1  
**Estimated Time:** 8-10 hours

**Tasks:**
- [ ] Document 3-5 existing or planned AWS projects:
  1. Example: "AI Agent Dashboard"
  2. Example: "Serverless API Gateway"
  3. Example: "Real-time Analytics Platform"
- [ ] Create screenshots/demos
- [ ] Write technical documentation
- [ ] Add architecture diagrams
- [ ] Include code samples

### 4.3 Demo Hosting Setup
**Priority:** P2  
**Estimated Time:** 8-12 hours

**Tasks:**
- [ ] Set up subdomain strategy:
  - Option A: `demo.recursiveintelligence.io/*`
  - Option B: `*.recursiveintelligence.io` (wildcard)
- [ ] Configure DNS for subdomains
- [ ] Set up Next.js rewrites/redirects
- [ ] Implement authentication for protected demos:
  - Simple password protection initially
  - Or GitHub OAuth for logged-in demos
- [ ] Create demo landing pages
- [ ] Test demo routing

**Subdomain Routing Example:**
```typescript
// next.config.ts
export default {
  async rewrites() {
    return [
      {
        source: '/demos/:path*',
        destination: 'https://demo.recursiveintelligence.io/:path*',
      },
    ]
  },
}
```

### 4.4 AWS Integration Documentation
**Priority:** P2  
**Estimated Time:** 4-6 hours

**Tasks:**
- [ ] Create `/docs/aws-setup.md`
- [ ] Document deployment process
- [ ] Create infrastructure-as-code templates
- [ ] Add cost estimation guides
- [ ] Include monitoring setup

**Deliverables:**
- ✅ Project showcase pages
- ✅ 3-5 documented projects
- ✅ Demo hosting infrastructure
- ✅ AWS deployment guides

---

## Phase 5: Author Platform & Polish (Week 7)

### 5.1 Enhanced Author Profile
**Priority:** P1  
**Estimated Time:** 4-6 hours

**Tasks:**
- [ ] Update `/about` page with:
  - Professional bio (short & long versions)
  - Headshot/photo
  - Speaking topics
  - Publication history
  - Media appearances
  - Contact information
- [ ] Create `/media` or `/press` page
- [ ] Add downloadable media kit
- [ ] Include testimonials/quotes

### 5.2 SEO Optimization
**Priority:** P1  
**Estimated Time:** 4-6 hours

**Tasks:**
- [ ] Audit all pages with Lighthouse
- [ ] Optimize images (WebP, lazy loading)
- [ ] Add structured data (JSON-LD) to:
  - Blog articles
  - Projects
  - Author profile
- [ ] Update sitemap.xml generation
- [ ] Configure robots.txt
- [ ] Add canonical URLs
- [ ] Optimize meta tags
- [ ] Submit to Google Search Console

### 5.3 Performance Audit
**Priority:** P1  
**Estimated Time:** 3-4 hours

**Tasks:**
- [ ] Run Lighthouse CI
- [ ] Optimize bundle size
- [ ] Implement proper code splitting
- [ ] Add image optimization
- [ ] Configure caching headers
- [ ] Test Core Web Vitals
- [ ] Fix any performance issues

**Target Metrics:**
- Lighthouse Performance: 95+
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

### 5.4 Accessibility Audit
**Priority:** P1  
**Estimated Time:** 3-4 hours

**Tasks:**
- [ ] Run automated accessibility tests (axe, WAVE)
- [ ] Test keyboard navigation
- [ ] Verify screen reader compatibility
- [ ] Check color contrast ratios
- [ ] Add ARIA labels where needed
- [ ] Test with reduced motion preference
- [ ] Ensure form accessibility

### 5.5 Mobile Optimization
**Priority:** P1  
**Estimated Time:** 3-4 hours

**Tasks:**
- [ ] Test on real devices (iOS, Android)
- [ ] Optimize touch targets
- [ ] Test navigation on mobile
- [ ] Ensure readable font sizes
- [ ] Optimize images for mobile
- [ ] Test forms on mobile

### 5.6 Final Content Push
**Priority:** P0  
**Estimated Time:** 15-20 hours

**Tasks:**
- [ ] Write 5 more articles (total 10)
- [ ] Create 2-3 case studies
- [ ] Prepare launch announcement
- [ ] Schedule initial newsletter
- [ ] Prepare social media content

**Deliverables:**
- ✅ Enhanced author platform
- ✅ SEO-optimized site
- ✅ Performance score 95+
- ✅ Accessibility compliant
- ✅ 10+ published articles
- ✅ Ready for launch

---

## Phase 6: Launch & Growth (Ongoing)

### 6.1 Soft Launch
**Priority:** P0  
**Estimated Time:** Week 8

**Tasks:**
- [ ] Deploy to production
- [ ] Test all functionality
- [ ] Share with close network
- [ ] Gather initial feedback
- [ ] Fix any critical issues
- [ ] Monitor analytics

### 6.2 Public Launch
**Priority:** P0  
**Estimated Time:** Week 9

**Tasks:**
- [ ] Announce on social media
- [ ] Send newsletter to list
- [ ] Post on relevant communities:
  - Hacker News
  - Reddit (r/webdev, r/nextjs, r/AIDevs)
  - Dev.to
  - Mastodon
- [ ] Reach out to AI/tech influencers
- [ ] Submit to directories

### 6.3 Content Calendar
**Priority:** P0  
**Estimated Time:** Ongoing

**Publishing Schedule:**
- **Blog posts:** 1-2 per week
- **Newsletter:** Bi-weekly
- **Projects:** 1 per month
- **Case studies:** 1 per quarter

**Content Mix:**
- 40% - Technical tutorials/guides
- 30% - AI strategy and thought leadership
- 20% - Case studies and project showcases
- 10% - Industry commentary and news

### 6.4 Community Building
**Priority:** P1  
**Estimated Time:** Ongoing

**Tasks:**
- [ ] Respond to all comments within 24h
- [ ] Engage on social media daily
- [ ] Join relevant communities
- [ ] Network with other creators
- [ ] Consider starting a podcast/video series
- [ ] Host virtual events or AMAs

### 6.5 Monetization (Future)
**Priority:** P3  
**Estimated Time:** Months 6-12

**Options to explore:**
- **Consulting funnel:** Blog → Newsletter → Paid consulting
- **Premium content:** Gated in-depth guides or courses
- **Sponsorships:** Partner with relevant tools/services
- **Products:** Sell templates, boilerplates, or tools
- **Speaking:** Use platform to get speaking opportunities

---

## Success Metrics

### Traffic & Engagement (3 months post-launch)
- **Goal:** 1,000 monthly visitors
- **Goal:** 500 newsletter subscribers
- **Goal:** 20% newsletter open rate
- **Goal:** 50+ comments/discussions

### Content Production (3 months)
- **Goal:** 20+ published articles
- **Goal:** 5+ project showcases
- **Goal:** 2+ case studies

### Business Impact (6 months)
- **Goal:** 10+ consulting inquiries
- **Goal:** 3+ new clients from website
- **Goal:** 3+ speaking opportunities

### Technical Performance (Ongoing)
- **Goal:** Lighthouse score 95+
- **Goal:** Core Web Vitals all "Good"
- **Goal:** 99.9% uptime

---

## Resource Requirements

### Time Investment

**Setup Phase (Weeks 1-7):** 120-160 hours
- Phase 1: 6-8 hours
- Phase 2: 36-48 hours
- Phase 3: 15-22 hours
- Phase 4: 26-36 hours
- Phase 5: 32-40 hours

**Ongoing (Per Week):** 8-12 hours
- Content creation: 5-8 hours
- Community engagement: 2-3 hours
- Maintenance: 1 hour

### Budget

**Year 1 Costs:**
- Hosting (AWS Amplify): ~$15
- Newsletter (ConvertKit): $300
- Domain: Already owned
- Analytics (CloudWatch): $0-108
- AWS demos: $600-2,400
- **Total: $915-2,723**

**Optional:**
- Stock photos (Unsplash Pro): $0-120
- Design tools (Figma): $0-144
- Email (Google Workspace): $72

---

## Risk Mitigation

### Technical Risks
- **Backup strategy:** Weekly automated backups
- **Version control:** All content in Git
- **Monitoring:** Set up Sentry or similar for error tracking
- **Testing:** Add basic E2E tests before launch

### Content Risks
- **Editorial calendar:** Plan 4 weeks ahead
- **Content queue:** Always have 2-3 articles ready
- **Quality bar:** Establish review process
- **Plagiarism check:** Use tools to verify originality

### Business Risks
- **Time management:** Block dedicated content creation time
- **Scope creep:** Stick to roadmap, defer non-critical features
- **Budget overruns:** Monitor AWS costs weekly

---

## Decision Log

Track key decisions here:

**Date: [TBD]**
- [ ] CMS Choice: _________
- [ ] Newsletter Platform: _________
- [ ] Analytics: CloudWatch RUM / Plausible / Other: _________
- [ ] Comments System: _________
- [ ] Hosting: AWS Amplify (current)

---

## Next Actions

**Immediate (This Week):**
1. [ ] Review and approve this roadmap
2. [ ] Fix npm security vulnerabilities
3. [ ] Decide on CMS approach (MDX recommended)
4. [ ] Create content calendar
5. [ ] Start writing first article

**Week 1:**
1. [ ] Complete Phase 1 (Foundation)
2. [ ] Set up MDX and Contentlayer
3. [ ] Design blog layout
4. [ ] Write first 2 articles

**Week 2:**
1. [ ] Complete blog infrastructure
2. [ ] Publish first 3 articles
3. [ ] Set up newsletter
4. [ ] Add analytics

---

## Questions for Discussion

Before proceeding, clarify:

1. **Content Preference:** MDX (technical) vs. Notion (user-friendly)?
2. **Newsletter:** Integrated vs. external platform like Substack?
3. **Projects Priority:** Blog first or simultaneous with projects?
4. **Budget:** Comfortable with $1,200-3,000/year?
5. **Timeline:** Full-time sprint (7 weeks) or part-time (3-6 months)?

---

**Last Updated:** February 16, 2026  
**Owner:** Seth Robins  
**Status:** Awaiting approval to proceed
