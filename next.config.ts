import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {},
  // Server-only env vars Amplify sets at build time; not auto-injected into SSR Lambda runtime.
  // Next.js replaces these with literal values at compile time so they are available server-side.
  env: {
    BRIEF_API_KEY: process.env.BRIEF_API_KEY ?? '',
    APP_REGION: process.env.APP_REGION ?? 'us-east-1',
    BRIEFS_TABLE_NAME: process.env.BRIEFS_TABLE_NAME ?? 'briefs',
    BRIEFS_AWS_ACCESS_KEY_ID: process.env.BRIEFS_AWS_ACCESS_KEY_ID ?? '',
    BRIEFS_AWS_SECRET_ACCESS_KEY: process.env.BRIEFS_AWS_SECRET_ACCESS_KEY ?? '',
    OWNER_ACCESS_TOKEN: process.env.OWNER_ACCESS_TOKEN ?? '',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? '',
    STRIPE_PRICE_MONTHLY_ID: process.env.STRIPE_PRICE_MONTHLY_ID ?? '',
    STRIPE_PRICE_ANNUAL_ID: process.env.STRIPE_PRICE_ANNUAL_ID ?? '',
    STRIPE_PRICE_PATRON_ID: process.env.STRIPE_PRICE_PATRON_ID ?? '',
    BRIEF_SESSIONS_TABLE_NAME: process.env.BRIEF_SESSIONS_TABLE_NAME ?? 'brief_sessions',
    BRIEF_SESSIONS_AWS_ACCESS_KEY_ID: process.env.BRIEF_SESSIONS_AWS_ACCESS_KEY_ID ?? '',
    BRIEF_SESSIONS_AWS_SECRET_ACCESS_KEY: process.env.BRIEF_SESSIONS_AWS_SECRET_ACCESS_KEY ?? '',
    RAINDROP_TOKEN: process.env.RAINDROP_TOKEN ?? '',
  },
}

export default nextConfig
