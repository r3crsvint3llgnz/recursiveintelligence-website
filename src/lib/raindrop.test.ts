import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchReadingList } from './raindrop'

beforeEach(() => {
  process.env.RAINDROP_TOKEN = 'test-token'
})

afterEach(() => {
  delete process.env.RAINDROP_TOKEN
  vi.unstubAllGlobals()
})

describe('fetchReadingList', () => {
  it('returns items from Raindrop API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            _id: 1,
            title: 'Test Article',
            link: 'https://example.com/article',
            note: 'A useful summary.',
            created: '2026-01-01T00:00:00.000Z',
            tags: ['llm'],
          },
        ],
      }),
    }))

    const items = await fetchReadingList()

    expect(items).toHaveLength(1)
    expect(items[0]).toEqual({
      _id: 1,
      title: 'Test Article',
      link: 'https://example.com/article',
      note: 'A useful summary.',
      created: '2026-01-01T00:00:00.000Z',
      tags: ['llm'],
    })
  })

  it('calls the correct Raindrop collection endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await fetchReadingList()

    const [url] = mockFetch.mock.calls[0] as [string, unknown]
    expect(url).toContain('67035667')
    expect(url).toContain('api.raindrop.io')
  })

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }))

    await expect(fetchReadingList()).rejects.toThrow('Raindrop API error: 401')
  })

  it('returns empty array when API omits items field', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: true, count: 0 }),
    }))

    const items = await fetchReadingList()

    expect(items).toEqual([])
  })

  it('throws when RAINDROP_TOKEN is not configured', async () => {
    const original = process.env.RAINDROP_TOKEN
    process.env.RAINDROP_TOKEN = ''
    try {
      await expect(fetchReadingList()).rejects.toThrow('RAINDROP_TOKEN is not configured')
    } finally {
      process.env.RAINDROP_TOKEN = original
    }
  })
})
