import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {},
  // Server-only env vars Amplify sets at build time; not auto-injected into SSR Lambda runtime.
  // Next.js replaces these with literal values at compile time so they're available server-side.
  env: {
    BRIEF_API_KEY: process.env.BRIEF_API_KEY ?? '',
    APP_REGION: process.env.APP_REGION ?? 'us-east-1',
    BRIEFS_TABLE_NAME: process.env.BRIEFS_TABLE_NAME ?? 'briefs',
  },
}

export default nextConfig
