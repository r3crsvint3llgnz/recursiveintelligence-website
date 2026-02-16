# Recursive Intelligence Website

AI-first consulting and thought leadership platform built with Next.js 15.

## 🎯 Project Overview

This is the official website for Recursive Intelligence, currently a static consulting site with plans to transform into a comprehensive content platform featuring:

- Substack-like blog for AI thought leadership
- Portfolio showcase for AWS applications
- Author platform for Seth Robins
- Newsletter integration for community building

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- npm or pnpm

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/r3crsvint3llgnz/recursiveintelligence-website.git
cd recursiveintelligence-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
recursiveintelligence-website/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   └── lib/              # Utility functions
├── public/               # Static assets
├── WEBSITE_ASSESSMENT.md # Comprehensive current state analysis
├── UPGRADE_ROADMAP.md    # Detailed upgrade implementation plan
└── QUICK_START.md        # Condensed action plan
```

## 🛠️ Tech Stack

- **Framework:** Next.js 15.4.6 with App Router
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS 4 with custom design system
- **Fonts:** Google Fonts (Inter, Space Grotesk)
- **Deployment:** Vercel

## 📖 Documentation

For detailed information about the current state and upgrade plans:

- **[WEBSITE_ASSESSMENT.md](./WEBSITE_ASSESSMENT.md)** - Complete analysis of current website state
- **[UPGRADE_ROADMAP.md](./UPGRADE_ROADMAP.md)** - Detailed 7-week transformation plan
- **[QUICK_START.md](./QUICK_START.md)** - Condensed action guide

## 🎨 Design System

The site features a custom design system with:
- **Primary accent:** `#ff6600` (orange)
- **Background:** `#000000` (black)
- **Text:** `#e0e0e0` (light gray)
- **Custom utilities:** `.ri-heading`, `.ri-section`, `.glass`, etc.

See `src/app/globals.css` for complete design tokens.

## 🏗️ Development

### Available Scripts

```bash
npm run dev        # Start development server with Turbopack
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Current Features

- ✅ Static homepage with hero section
- ✅ About page (mission, values, methodology)
- ✅ Services page (pricing, offerings)
- ✅ Responsive navigation
- ✅ SEO optimization (metadata, sitemap, robots.txt)
- ✅ Custom brand identity with R³ logo system

### Planned Features

See [UPGRADE_ROADMAP.md](./UPGRADE_ROADMAP.md) for the complete feature roadmap including:
- 📝 MDX-based blog system
- 📧 Newsletter integration
- 💬 Comments via Giscus
- 🎯 Project showcase
- 🔐 AWS application demos
- 🔍 Search functionality

## 🚨 Security

⚠️ **Before deploying:** Fix npm security vulnerabilities:

```bash
npm audit
npm install next@latest
npm audit fix
```

See [QUICK_START.md](./QUICK_START.md) for details on current vulnerabilities.

## 🚢 Deployment

The site is deployed on Vercel. To deploy:

1. Push to the `main` branch
2. Vercel will automatically build and deploy
3. Environment variables must be set in Vercel project settings

### Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SITE_URL` - Your production domain
- `NEXT_PUBLIC_GARDEN_URL` - Lab/experiments site URL
- `NODE_ENV` - Environment (production/development)

See [.env.example](./.env.example) for complete list.

## 📝 Content Management

Currently, all content is hard-coded in React components. The upgrade plan includes implementing MDX-based content management for:
- Blog articles
- Project documentation
- Case studies

## 🤝 Contributing

This is a personal project for Recursive Intelligence. For questions or collaboration:
- Email: seth.robins@recursiveintelligence.io
- Mastodon: [@r3crsvint3llgnz](https://hachyderm.io/@r3crsvint3llgnz)

## 📄 License

All rights reserved. © 2026 Recursive Intelligence

## 🔗 Links

- **Website:** [recursiveintelligence.io](https://recursiveintelligence.io)
- **Lab:** [Recursive Garden](https://recursiveintelligence.xyz/)
- **Mastodon:** [@r3crsvint3llgnz](https://hachyderm.io/@r3crsvint3llgnz)

---

Built with ❤️ using Next.js 15 and Tailwind CSS 4
