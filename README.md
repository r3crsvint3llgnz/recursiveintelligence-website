# 🌐 Recursive Intelligence Platform

A high-performance consulting and research platform built with **Next.js 15**, **Turbopack**, and an **Industrial Systems** design language.

## 🎯 Architecture & Purpose

This repository houses the core brand presence for **Recursive Intelligence**. It is designed as a high-density information platform that translates complex AI/ML research into actionable industrial methodology.

### Key Pillars
- **Industrial Systems Aesthetic**: A custom-scoped design system (Deep Navy & Emerald) optimized for professional, technical environments.
- **Agentic Integration**: Built-in chat interface powered by **AWS Bedrock (Claude 3 Haiku)**, persona-mapped to an "Autistic Systems Thinker" logic.
- **Research-to-Practice Loop**: Fully automated pipeline integration for synthesizing daily AI briefs and maintained digital gardens.
- **Sovereign Content**: Single-source-of-truth identity management via `idenity.yaml`.

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4 (App Router & Turbopack)
- **Styling**: Tailwind CSS 4 + Scoped Industrial Theme
- **Intelligence**: AWS Bedrock SDK (Claude 3 Haiku)
- **Data**: ContentLayer2, YAML parsing, React-PDF
- **Infrastructure**: AWS Amplify + S3 Static Hosting

## 🚀 Development

### Prerequisites
- Node.js 20+
- AWS CLI (for Bedrock/S3 features)

### Local Setup
1. `npm install`
2. `cp .env.example .env.local` (Add your AWS credentials for chat/deployment)
3. `npm run dev`

### Available Commands
- `npm run build`: Production build and data synthesis
- `npm run lint`: Architecture consistency check
- `scripts/deploy-portfolio.sh`: Automated S3 bucket provisioning and sync

## 📖 Documentation Index

For deep-dives into the platform architecture and transformation roadmap, see the `/docs` directory:

- **[Executive Summary](./docs/EXECUTIVE_SUMMARY.md)**: High-level vision and snapshots.
- **[Website Assessment](./docs/WEBSITE_ASSESSMENT.md)**: Technical audit and current-state analysis.
- **[Upgrade Roadmap](./docs/UPGRADE_ROADMAP.md)**: Phased implementation and feature pipeline.
- **[Documentation Index](./docs/DOCUMENTATION_INDEX.md)**: Full map of all project research.

## 📄 License

MIT © 2026 Seth Robins / Recursive Intelligence
