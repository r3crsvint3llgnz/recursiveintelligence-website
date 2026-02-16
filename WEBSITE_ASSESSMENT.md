# Recursive Intelligence Website - Comprehensive Assessment

**Date:** February 16, 2026  
**Purpose:** Current state analysis to plan cleanup, upgrade, and transformation into a content-focused platform

---

## Executive Summary

The Recursive Intelligence website is a **Next.js 15-based consulting website** currently in MVP stage. It's intentionally kept simple with static content, strong brand identity, and minimal complexity. The site successfully serves as a professional consulting presence but lacks the infrastructure needed for a content-driven platform (blog/Substack-like) and AWS application showcases.

**Key Finding:** The architecture is sound and modern, but the content strategy needs to shift from static hard-coded pages to dynamic, blog-focused content management.

---

## 1. Current Technology Stack

### Core Framework
- **Next.js 15.4.6** (Latest) with App Router
- **React 19.1.0** (Latest)
- **TypeScript 5** (Strict mode enabled)
- **Turbopack** for development

### Styling & UI
- **Tailwind CSS 4** (Latest, using PostCSS 4)
- Custom design system with:
  - Orange accent (`#ff6600`) on black background (`#000000`)
  - Google Fonts: Inter (body), Space Grotesk (headings)
  - Custom CSS utilities (`.ri-heading`, `.glass`, `.ri-stripe`, etc.)

### External Integrations
- **Notion Client** (`@notionhq/client@^4.0.1`) - Currently archived, not in use
- **Email integration** via `mailto:` links (no backend)

### Build & Deployment
- **Target Platform:** AWS Amplify
- **Domain:** recursiveintelligence.io (already configured)
- **Build Tool:** Next.js standard build
- **CI/CD:** Automatic deployment on git push
- **SSL/TLS:** Managed via AWS Certificate Manager
- **DNS:** Route 53
- **Linting:** ESLint with Next.js config
- **No test infrastructure** currently

**AWS Amplify Advantages:**
- Native AWS integration (perfect for planned AWS demos)
- Free tier covers typical static site usage
- Automatic SSL certificate management
- Built-in CI/CD pipeline
- CloudWatch integration for monitoring
- Easy subdomain configuration for future demos
- No vendor lock-in concerns (already in AWS ecosystem)

---

## 2. Current Site Architecture

### Pages & Routes
```
/                    → Homepage (static hero)
/about               → Company info, mission, values
/services            → Service offerings, pricing
/[slug]              → Coming soon placeholder pages
/sitemap.xml         → SEO sitemap
/robots.txt          → Search engine directives
```

### Middleware
- Single redirect: `/contact` → `/` (HTTP 308)
- No authentication or protected routes

### Content Structure
- **100% hard-coded content** in React components
- Static site generation (`force-static` directive)
- No CMS integration (Notion was intentionally removed)
- No blog or article structure

---

## 3. Current Features

### ✅ What's Working Well

**Brand & Design:**
- Strong, cohesive visual identity with R³ logo system
- Professional dark theme with orange accents
- Responsive design with mobile support
- Accessible (ARIA labels, semantic HTML)

**Technical Foundation:**
- Modern, performant tech stack
- Type-safe with strict TypeScript
- SEO optimized (metadata, sitemap, robots.txt)
- Clean component architecture
- Fast static site (no dynamic data fetching)

**Business Presence:**
- Clear value proposition
- Service offerings well-defined
- Pricing transparency ($250/hour)
- Professional contact mechanism (email)

### ⚠️ Current Limitations

**Content Management:**
- No blog or article functionality
- No CMS integration
- Content updates require code changes
- No content versioning or scheduling

**User Engagement:**
- No comments or interaction
- No newsletter signup
- Email via mailto only (no server-side forms)
- No analytics integration visible

**Application Hosting:**
- No infrastructure for hosting/showcasing AWS applications
- No authentication for protected demos
- No API routes for backend functionality

**Developer Experience:**
- No test infrastructure
- No CI/CD visible in repo
- 3 npm vulnerabilities (1 critical, 1 high, 1 moderate)
- Archived Notion code still in codebase

---

## 4. Security & Code Quality

### Security Vulnerabilities (npm audit)
```
3 vulnerabilities (1 moderate, 1 high, 1 critical)
```
**Action needed:** Run `npm audit` for details and address issues

### Code Quality
- ✅ Strict TypeScript enabled
- ✅ ESLint configured
- ✅ No secrets in code
- ❌ No automated testing
- ❌ No security scanning in CI

### Environment Variables
Currently using:
- `NEXT_PUBLIC_SITE_URL` - Production domain
- `NEXT_PUBLIC_GARDEN_URL` - External lab link
- `NODE_ENV` - Environment indicator

**Note:** No `.env.example` file for reference

---

## 5. Content Analysis

### Current Content Types

**Static Pages:**
1. **Homepage** - Hero with tagline "Human first. AI with purpose"
2. **About** - Mission, vision, values, target audience, methodology
3. **Services** - Three service categories (Advisory, Architecture, Education)

**Content Themes:**
- AI consulting and strategy
- Human-centered AI approach
- Education and professional development
- Small business and individual focus

### Missing Content Infrastructure

For transformation to content site, need:
- ❌ Blog/article pages and listing
- ❌ Author profile integration
- ❌ Content categories/tags
- ❌ Article metadata (date, reading time, etc.)
- ❌ RSS feed
- ❌ Newsletter integration
- ❌ Social sharing
- ❌ Search functionality
- ❌ Related articles/recommendations

---

## 6. Brand Assets

### Logo System (Complete)
- `R3_unboxed.svg` / `R3_unboxed_light.svg` - Header/large uses
- `R3_boxed.svg` / `R3_boxed_light.svg` - Favicon/small uses
- `R3Logo.png` - Raster version
- Brand guidelines documented in `README.txt`

### Images
- `r3_cover.png` - Cover image
- `ChatGPT Image Aug 10, 2025, 08_09_01 PM.png` - Possibly unused

### Design System
- Well-documented CSS custom properties
- Consistent component styling patterns
- Reusable utility classes (`.ri-*` prefix)

---

## 7. File Structure Analysis

```
recursiveintelligence-website/
├── public/                    # Static assets (SVGs, favicon placeholders)
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── [slug]/           # Dynamic placeholder routes
│   │   ├── about/            # About page
│   │   ├── services/         # Services page
│   │   ├── layout.tsx        # Root layout with header/footer
│   │   ├── page.tsx          # Homepage
│   │   └── globals.css       # Global styles + design system
│   ├── components/           # React components
│   │   ├── brand/           # Logo components
│   │   ├── AccentBar.tsx    # Decorative stripe
│   │   ├── EmailCTA.tsx     # Email contact button
│   │   ├── FooterCTA.tsx    # Footer call-to-action
│   │   ├── HomeHero.tsx     # Homepage hero section
│   │   └── NavTabs.tsx      # Navigation tabs
│   ├── lib/                  # Utilities
│   │   ├── baseUrl.ts       # URL helper
│   │   ├── email.ts         # mailto link builder
│   │   └── notion.tsx       # Notion integration (archived)
│   ├── notion-backup/       # Archived Notion code
│   └── middleware.ts        # Next.js middleware
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── next.config.ts           # Next.js config (minimal)
├── tailwind.config.*        # Tailwind setup (likely via globals.css)
└── README.md                # Standard Next.js readme
```

### Cleanup Opportunities
- Remove `/src/notion-backup/` if not planning to reuse
- Remove unused images
- Add `.env.example` for reference
- Add test directory structure

---

## 8. Gaps for Transformation Goals

### Goal 1: Substack-like Content Platform

**What's Needed:**
1. **Content Management System**
   - Blog post creation/editing workflow
   - Rich text/Markdown support
   - Featured images and media handling
   - Draft/publish states
   - Categories and tags

2. **Blog Infrastructure**
   - Article listing page with pagination
   - Individual article pages
   - Author bio integration
   - Reading time calculation
   - Publication date handling

3. **Content Distribution**
   - RSS feed generation
   - Newsletter integration (e.g., ConvertKit, Buttondown)
   - Email capture forms
   - Social sharing buttons

4. **Reader Engagement**
   - Comments (e.g., Giscus, Utterances)
   - Social proof (view counts, reactions)
   - Related articles
   - Search functionality

**Options for CMS:**
- **Notion** (already has client installed) - Pro: Familiar, free; Con: Previously removed
- **MDX** (file-based) - Pro: Git-based, type-safe; Con: No web UI
- **Contentful/Sanity** - Pro: Powerful; Con: Cost
- **Hashnode/Dev.to API** - Pro: Built-in community; Con: Less control

### Goal 2: AWS Application Showcase

**What's Needed:**
1. **Project Portfolio Structure**
   - Project listing page
   - Individual project detail pages
   - Project metadata (tech stack, links, screenshots)
   - Live demo links
   - GitHub integration for code samples

2. **Application Hosting**
   - Subdomain routing (e.g., `app.recursiveintelligence.io`)
   - Authentication for protected demos
   - API proxy/gateway setup
   - Environment variable management
   - Analytics and monitoring

3. **Infrastructure Integration**
   - AWS deployment documentation
   - Architecture diagrams
   - Cost transparency
   - Performance metrics

**Technical Considerations:**
- Next.js API routes for backend
- Next.js middleware for auth
- Vercel + AWS integration patterns
- Subdomain management

### Goal 3: Thought Leadership Platform

**What's Needed:**
1. **Author Platform**
   - Detailed author profile/bio
   - Publication history
   - Speaking engagements
   - Media kit/press page

2. **Content Types**
   - Long-form articles
   - Quick notes/thoughts
   - Case studies
   - Tutorials/guides
   - Video embeds (YouTube/Vimeo)

3. **Social Integration**
   - Mastodon feed integration
   - Cross-posting to other platforms
   - Social proof (follower counts, etc.)
   - Webmentions

---

## 9. Recommended Upgrade Path

### Phase 1: Foundation & Cleanup (Week 1)
- [ ] Fix npm security vulnerabilities
- [ ] Remove archived Notion code
- [ ] Clean up unused assets
- [ ] Add `.env.example`
- [ ] Add basic test infrastructure
- [ ] Set up CI/CD with AWS Amplify build settings
- [ ] Add analytics (CloudWatch RUM or Plausible)

### Phase 2: Content Infrastructure (Weeks 2-3)
- [ ] Choose and implement CMS (recommendation: MDX or Notion)
- [ ] Create blog listing page (`/blog`)
- [ ] Create article detail page (`/blog/[slug]`)
- [ ] Add RSS feed
- [ ] Implement categories/tags
- [ ] Add search functionality
- [ ] Create author profile page

### Phase 3: Reader Engagement (Week 4)
- [ ] Newsletter signup integration
- [ ] Comments system (Giscus recommended)
- [ ] Social sharing buttons
- [ ] Related articles algorithm
- [ ] Reading progress indicator
- [ ] Table of contents for long articles

### Phase 4: Application Showcase (Weeks 5-6)
- [ ] Create projects listing page (`/projects`)
- [ ] Create project detail pages
- [ ] Set up subdomain routing for demos
- [ ] Implement basic auth for protected demos
- [ ] Add API routes for dynamic functionality
- [ ] AWS integration patterns

### Phase 5: Polish & Launch (Week 7)
- [ ] SEO optimization
- [ ] Performance audit
- [ ] Accessibility audit
- [ ] Mobile optimization
- [ ] Documentation updates
- [ ] Soft launch with initial content

---

## 10. Technology Stack Recommendations

### For Blog/Content (Choose One)

**Option A: MDX (File-based) ⭐ RECOMMENDED**
- Pros: Git-based, type-safe, no external dependencies, fast
- Cons: No web-based editor, requires code commits
- Best for: Technical audience, developer workflow
- Implementation: `next-mdx-remote` or `contentlayer`

**Option B: Notion (API-based)**
- Pros: Familiar, free, nice editor, already have client
- Cons: API rate limits, requires caching strategy
- Best for: Non-technical content editing
- Implementation: Re-enable archived Notion integration

**Option C: Sanity CMS**
- Pros: Powerful, real-time, flexible
- Cons: Cost at scale, learning curve
- Best for: Long-term content platform
- Implementation: `@sanity/client` + Sanity Studio

### For Newsletter
- **ConvertKit** - Pro creator focus
- **Buttondown** - Minimal, developer-friendly
- **Substack** - Built-in audience, but less control

### For Comments
- **Giscus** (GitHub Discussions) ⭐ RECOMMENDED - Free, privacy-friendly
- **Utterances** (GitHub Issues) - Simpler alternative
- **Disqus** - Full-featured but privacy concerns

### For Analytics
- **CloudWatch RUM** ⭐ RECOMMENDED - AWS native, integrates with Amplify
- **Plausible** - Privacy-first, $9/mo
- **Google Analytics 4** - Free but privacy concerns

### For Search
- **Algolia DocSearch** - Free for docs
- **Pagefind** - Static search, free
- **Fuse.js** - Client-side fuzzy search

---

## 11. Effort Estimation

### Minimal Viable Content Platform (MVP)
**Timeline:** 2-3 weeks (assuming part-time work)
- MDX-based blog with 5-10 starter articles
- RSS feed
- Newsletter signup
- Basic SEO
- **Estimated Hours:** 40-60 hours

### Full Featured Content Platform
**Timeline:** 6-8 weeks
- Complete blog infrastructure
- Comments, search, social sharing
- Project showcase
- Newsletter automation
- AWS demo hosting
- **Estimated Hours:** 120-160 hours

### Maintenance & Content Creation
**Ongoing:** 5-10 hours/week
- Writing new articles
- Updating projects
- Responding to comments
- Newsletter creation

---

## 12. Budget Considerations

### Platform Costs (Annual)

**Current Hosting:**
- AWS Amplify: ~$0-15/year (free tier covers typical usage)
- Domain: Already owned (recursiveintelligence.io)
- **Current: ~$0-15/year**

**Minimal Setup (Current + Newsletter + Analytics):**
- AWS Amplify: ~$15/year (beyond free tier)
- Newsletter (Buttondown): $90/year
- Analytics (Plausible): $108/year (optional, can use CloudWatch)
- **Total: $105-213/year**

**Full Content Platform:**
- AWS Amplify: ~$15/year
- Newsletter (ConvertKit): $300/year (1,000 subscribers)
- CMS (Sanity): $0 (free tier) or $180 (Growth) - optional
- Analytics: $0 (CloudWatch) or $108 (Plausible)
- **Total: $315-603/year**

**With AWS Demos:**
- Add $50-200/month for additional AWS resources (Lambda, DynamoDB, API Gateway, etc.)
- **Total: $915-2,803/year** (including above)

---

## 13. Key Decisions Needed

Before starting the upgrade, decide:

1. **Content Management Approach:**
   - [ ] MDX files in Git (technical, fast)
   - [ ] Notion API (familiar, non-technical editing)
   - [ ] Headless CMS (powerful, costly)

2. **Newsletter Strategy:**
   - [ ] Integrated (own platform)
   - [ ] External (Substack, Buttondown)
   - [ ] Both (own + syndicate)

3. **Application Hosting:**
   - [ ] Subdomains on same domain
   - [ ] Separate domains
   - [ ] Embedded iframes

4. **Monetization (Future):**
   - [ ] Free content only
   - [ ] Premium content/subscriptions
   - [ ] Sponsorships/ads
   - [ ] Courses/products

5. **Scope:**
   - [ ] Just blog first, apps later
   - [ ] Both simultaneously
   - [ ] Apps first, blog second

---

## 14. Immediate Next Steps

### Critical (Do First)
1. **Security:** Fix npm vulnerabilities (`npm audit fix`)
2. **Cleanup:** Remove `/src/notion-backup/` if not using
3. **Decide:** Choose content management approach
4. **Plan:** Create detailed implementation roadmap

### High Priority (Week 1)
1. Add `.env.example` file
2. Set up basic analytics
3. Create blog route structure
4. Write first 2-3 articles in chosen format
5. Set up development workflow

### Medium Priority (Weeks 2-4)
1. Implement full blog features
2. Add newsletter signup
3. Create project showcase structure
4. Begin AWS demo integration

---

## 15. Risk Assessment

### Technical Risks
- **Complexity creep:** Start simple, add features incrementally
- **Over-engineering:** Use existing solutions, avoid custom builds
- **Performance:** Test with realistic content volumes

### Content Risks
- **Content creation bandwidth:** Start with 1-2 articles/week goal
- **Quality vs. quantity:** Focus on quality, establish publishing cadence
- **Topic scope:** Define clear content pillars

### Business Risks
- **Maintenance overhead:** Automate where possible
- **Cost escalation:** Monitor AWS usage closely
- **Time investment:** Set realistic timelines

---

## Conclusion

The Recursive Intelligence website has a **solid foundation** with modern technologies and strong brand identity. The transformation to a content-focused platform is achievable but requires:

1. **Choosing a content management strategy** that balances ease-of-use and technical capabilities
2. **Building blog infrastructure** systematically in phases
3. **Starting content creation early** to validate the platform
4. **Integrating AWS demos thoughtfully** without overcomplicating the core site

**Recommended Approach:** Start with MDX-based blog (simplest, fastest) with 5 starter articles, then expand based on feedback and needs. This allows for quick wins while building toward the full vision.

---

**Next Document:** `UPGRADE_ROADMAP.md` with detailed implementation steps and timeline.
