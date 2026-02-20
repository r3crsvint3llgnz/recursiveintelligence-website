import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { slugify, POST } from './route'

// ── AWS SDK mocks ────────────────────────────────────────────────────────
// vi.hoisted ensures mockSend is created before the vi.mock factories run.
// Command classes use 'class' syntax — arrow functions aren't constructable.

const mockSend = vi.hoisted(() => vi.fn())

vi.mock('@aws-sdk/client-dynamodb', () => ({
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  DynamoDBClient: class { constructor(_config?: unknown) {} },
}))

vi.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: (_client: unknown) => ({ send: mockSend }),
  },
  // Capture constructor args via the `input` property on each instance
  GetCommand: class { constructor(readonly input: unknown) {} },
  TransactWriteCommand: class { constructor(readonly input: unknown) {} },
}))

// ── ID generation (pure, no mocks needed) ────────────────────────────────

function generateId(date: string, category: string): string {
  return `${date.slice(0, 10)}-${slugify(category)}`
}

describe('ID generation', () => {
  it('generates deterministic ID from date and category', () => {
    expect(generateId('2026-02-18T06:00:00Z', 'AI/ML')).toBe('2026-02-18-ai-ml')
  })

  it('handles multi-word categories', () => {
    expect(generateId('2026-02-18T06:00:00Z', 'Large Language Models')).toBe(
      '2026-02-18-large-language-models'
    )
  })

  it('strips leading/trailing hyphens', () => {
    expect(generateId('2026-02-18T06:00:00Z', '  AI  ')).toBe('2026-02-18-ai')
  })
})

// ── Bootstrap path (first deploy — no __latest__ record) ─────────────────

describe('POST /api/briefs/ingest — bootstrap', () => {
  const API_KEY = 'test-api-key'
  const VALID_BODY = {
    title: 'AI Abstract — 2026-02-18',
    date: '2026-02-18T06:00:00Z',
    summary: 'Two to three sentence teaser.',
    category: 'AI/ML',
    body: '## Key Developments\n\nContent here.',
    items: [
      { title: 'Item 1', url: 'https://example.com/1', source: 'Source', snippet: 'Snippet.' },
    ],
  }

  function makeRequest(body = VALID_BODY) {
    return new Request('http://localhost/api/briefs/ingest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }) as unknown as import('next/server').NextRequest
  }

  beforeEach(() => {
    vi.stubEnv('BRIEF_API_KEY', API_KEY)
    mockSend.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses a 2-op transaction when no __latest__ record exists (first deploy)', async () => {
    mockSend
      .mockResolvedValueOnce({ Item: undefined })  // GetItem __latest__ → not found
      .mockResolvedValueOnce({})                   // TransactWriteCommand → success

    const res = await POST(makeRequest())

    expect(res.status).toBe(201)
    const { id } = await res.json() as { id: string }
    expect(id).toBe('2026-02-18-am-ai-ml')

    // Second send() call is the TransactWriteCommand.
    // Its instance carries the constructor arg in .input.
    // 2 ops = update __latest__ pointer + put new brief (no is_latest flip).
    const twc = mockSend.mock.calls[1][0] as { input: { TransactItems: unknown[] } }
    expect(twc.input.TransactItems).toHaveLength(2)
  })

  it('uses a 3-op transaction when a previous record exists', async () => {
    mockSend
      .mockResolvedValueOnce({ Item: { current_id: '2026-02-17-am-ai-ml' } })  // __latest__ → previous
      .mockResolvedValueOnce({})                                                 // TransactWriteCommand → success

    const res = await POST(makeRequest())

    expect(res.status).toBe(201)

    // 3 ops = update __latest__ + put new brief + flip previous is_latest to false
    const twc = mockSend.mock.calls[1][0] as { input: { TransactItems: unknown[] } }
    expect(twc.input.TransactItems).toHaveLength(3)
  })
})
