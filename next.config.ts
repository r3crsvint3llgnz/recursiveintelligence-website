import { withContentlayer } from 'next-contentlayer2'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {},
}

export default withContentlayer(nextConfig)
