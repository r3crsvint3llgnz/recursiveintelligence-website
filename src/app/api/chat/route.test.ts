import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Hoist mock before imports
const mockSend = vi.hoisted(() => vi.fn())

vi.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: class {
    constructor(_config?: unknown) {}
    send = mockSend
  },
  InvokeModelCommand: class {
    constructor(readonly input: unknown) {}
  },
}))

// Stub fs so loadIdentity() doesn't fail in test environment
vi.mock('fs', () => ({
  default: {
    readFileSync: () => 'basics:\n  name: Seth Robins\n',
  },
  readFileSync: () => 'basics:\n  name: Seth Robins\n',
}))

import { POST } from './route'

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/chat', () => {
  beforeEach(() => {
    mockSend.mockReset()
    process.env.RESUME_CHAT_AWS_ACCESS_KEY_ID = 'test-key-id'
    process.env.RESUME_CHAT_AWS_SECRET_ACCESS_KEY = 'test-secret'
    process.env.APP_REGION = 'us-east-1'
  })

  it('returns assistant content on success', async () => {
    mockSend.mockResolvedValue({
      body: new TextEncoder().encode(
        JSON.stringify({
          content: [{ type: 'text', text: 'Hello, I am Seth.' }],
        })
      ),
    })

    const res = await POST(makeRequest({
      messages: [{ role: 'user', content: 'Tell me about yourself.' }],
    }))

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.content).toBe('Hello, I am Seth.')
  })

  it('returns 400 when messages array is missing', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/messages/)
  })

  it('returns 400 when messages is empty array', async () => {
    const res = await POST(makeRequest({ messages: [] }))
    expect(res.status).toBe(400)
  })

  it('returns 500 on Bedrock error', async () => {
    mockSend.mockRejectedValue(new Error('throttling exception'))

    const res = await POST(makeRequest({
      messages: [{ role: 'user', content: 'Hello' }],
    }))

    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toMatch(/Chat service error/)
  })

  it('returns fallback text when content array is empty', async () => {
    mockSend.mockResolvedValue({
      body: new TextEncoder().encode(
        JSON.stringify({ content: [] })
      ),
    })

    const res = await POST(makeRequest({
      messages: [{ role: 'user', content: 'Hello' }],
    }))

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.content).toMatch(/wasn't able/)
  })
})
