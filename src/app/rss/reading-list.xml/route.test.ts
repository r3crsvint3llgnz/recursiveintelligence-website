import { describe, it, expect } from 'vitest'
import { buildRssXml } from './route'
import type { RaindropItem } from '@/lib/raindrop'

const baseUrl = 'https://recursiveintelligence.io'

const sampleItems: RaindropItem[] = [
  {
    _id: 1,
    title: 'GPT-5 Released',
    link: 'https://openai.com/gpt5',
    note: 'Major capability jump with new reasoning modes.',
    created: '2026-01-15T10:00:00.000Z',
    tags: ['llm', 'openai'],
  },
  {
    _id: 2,
    title: 'Diffusion Model Survey',
    link: 'https://arxiv.org/abs/2601.00001',
    note: '',
    created: '2026-01-10T08:00:00.000Z',
    tags: [],
  },
]

describe('buildRssXml', () => {
  it('returns valid RSS 2.0 envelope', () => {
    const xml = buildRssXml([], baseUrl)
    expect(xml).toContain('<?xml version="1.0"')
    expect(xml).toContain('<rss version="2.0"')
    expect(xml).toContain('</rss>')
  })

  it('includes channel title and link', () => {
    const xml = buildRssXml([], baseUrl)
    expect(xml).toContain('AI/ML Reading List')
    expect(xml).toContain(`${baseUrl}/reading-list`)
  })

  it('renders item title in CDATA', () => {
    const xml = buildRssXml(sampleItems, baseUrl)
    expect(xml).toContain('<![CDATA[GPT-5 Released]]>')
  })

  it('renders item link', () => {
    const xml = buildRssXml(sampleItems, baseUrl)
    expect(xml).toContain('<link>https://openai.com/gpt5</link>')
  })

  it('renders note as description in CDATA', () => {
    const xml = buildRssXml(sampleItems, baseUrl)
    expect(xml).toContain('<![CDATA[Major capability jump with new reasoning modes.]]>')
  })

  it('includes pubDate', () => {
    const xml = buildRssXml(sampleItems, baseUrl)
    expect(xml).toContain('<pubDate>')
    expect(xml).toContain('2026')
  })

  it('handles empty note gracefully', () => {
    const xml = buildRssXml(sampleItems, baseUrl)
    expect(xml).toContain('<description><![CDATA[]]></description>')
  })

  it('escapes ampersands in item links', () => {
    const items: RaindropItem[] = [
      {
        _id: 3,
        title: 'Search Results',
        link: 'https://example.com/search?q=llm&lang=en',
        note: '',
        created: '2026-01-01T00:00:00.000Z',
        tags: [],
      },
    ]
    const xml = buildRssXml(items, baseUrl)
    expect(xml).toContain('&amp;')
    expect(xml).not.toContain('q=llm&lang')
    expect(xml).toContain('<link>')
  })
})
