import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('contentlayer/generated', () => ({
  allPosts: [{ slug: 'test-post', access: 'public' }],
}))

vi.mock('@/lib/briefs', () => ({
  getBriefs: vi.fn(),
}))

vi.mock('@/lib/baseUrl', () => ({
  getBaseUrl: () => 'https://recursiveintelligence.io',
}))

import { getBriefs } from '@/lib/briefs'
import { GET } from './route'

describe('sitemap GET', () => {
  beforeEach(() => {
    vi.mocked(getBriefs).mockResolvedValue([])
  })

  it('includes /resume', async () => {
    const res = await GET()
    expect(await res.text()).toContain('/resume')
  })

  it('includes /privacy', async () => {
    const res = await GET()
    expect(await res.text()).toContain('/privacy')
  })

  it('includes public blog posts', async () => {
    const res = await GET()
    expect(await res.text()).toContain('/blog/test-post')
  })

  it('includes the latest brief URL', async () => {
    vi.mocked(getBriefs).mockResolvedValue([
      { id: '2026-02-23-am-ai-ml', is_latest: true, category: 'AI/ML' } as never,
      { id: '2026-02-22-pm-ai-ml', is_latest: false, category: 'AI/ML' } as never,
    ])
    const text = await (await GET()).text()
    expect(text).toContain('/briefs/2026-02-23-am-ai-ml')
    expect(text).not.toContain('/briefs/2026-02-22-pm-ai-ml')
  })

  it('does not throw when getBriefs fails', async () => {
    vi.mocked(getBriefs).mockRejectedValue(new Error('DynamoDB offline'))
    await expect(GET()).resolves.toBeDefined()
  })

  it('excludes World category briefs from sitemap', async () => {
    vi.mocked(getBriefs).mockResolvedValue([
      { id: '2026-02-23-world', is_latest: true, category: 'world' } as never,
    ])
    const text = await (await GET()).text()
    expect(text).not.toContain('/briefs/2026-02-23-world')
  })
})
