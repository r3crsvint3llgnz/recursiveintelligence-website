import { describe, it, expect } from 'vitest'

describe('Brief type contract', () => {
  it('BriefItem requires title, url, source, snippet', () => {
    const item = {
      title: 'Test',
      url: 'https://example.com',
      source: 'Test Source',
      snippet: 'A snippet.',
    } satisfies import('./brief').BriefItem
    expect(item.title).toBe('Test')
  })

  it('Brief requires body and is_latest fields', () => {
    const brief = {
      id: '2026-02-18-ai-ml',
      entity_type: 'brief',
      title: 'Test Brief',
      date: '2026-02-18T06:00:00Z',
      summary: 'Summary.',
      category: 'AI/ML',
      body: '## Body',
      items: [],
      is_latest: true,
    } satisfies import('./brief').Brief
    expect(brief.is_latest).toBe(true)
  })
})
