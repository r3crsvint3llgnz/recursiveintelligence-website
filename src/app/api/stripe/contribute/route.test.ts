// src/app/api/stripe/contribute/route.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Stripe mock ──────────────────────────────────────────────────────────
// vi.hoisted ensures mockCreate is defined before vi.mock factory runs.
const mockCreate = vi.hoisted(() => vi.fn())

vi.mock('@/lib/stripeClient', () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        create: mockCreate,
      },
    },
  }),
}))

// Import the handler AFTER mocks are set up
import { POST } from './route'

// Helper: build a form-encoded NextRequest
function makeFormRequest(fields: Record<string, string>) {
  const formData = new FormData()
  for (const [k, v] of Object.entries(fields)) formData.set(k, v)
  return new Request('http://localhost/api/stripe/contribute', {
    method: 'POST',
    body: formData,
  }) as unknown as import('next/server').NextRequest
}

// Helper: build a JSON NextRequest
function makeJsonRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/stripe/contribute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('POST /api/stripe/contribute — validation', () => {
  beforeEach(() => {
    mockCreate.mockReset()
    vi.stubEnv('STRIPE_PRICE_PATRON_ID', 'price_patron_test')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://recursiveintelligence.io')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns 400 when type is missing', async () => {
    const res = await POST(makeFormRequest({ amount: '10' }))
    expect(res.status).toBe(400)
    const { error } = await res.json() as { error: string }
    expect(error).toMatch(/type/)
  })

  it('returns 400 when type is unknown', async () => {
    const res = await POST(makeFormRequest({ type: 'gift', amount: '10' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when one_time amount is missing', async () => {
    const res = await POST(makeFormRequest({ type: 'one_time' }))
    expect(res.status).toBe(400)
    const { error } = await res.json() as { error: string }
    expect(error).toMatch(/amount/)
  })

  it('returns 400 when one_time amount is not a number', async () => {
    const res = await POST(makeFormRequest({ type: 'one_time', amount: 'abc' }))
    expect(res.status).toBe(400)
    const { error } = await res.json() as { error: string }
    expect(error).toMatch(/amount/)
  })

  it('returns 400 when one_time amount is below $1 (less than 100 cents)', async () => {
    const res = await POST(makeFormRequest({ type: 'one_time', amount: '0.50' }))
    expect(res.status).toBe(400)
    const { error } = await res.json() as { error: string }
    expect(error).toMatch(/minimum/)
  })

  it('returns 503 when patron price ID env var is not set', async () => {
    vi.stubEnv('STRIPE_PRICE_PATRON_ID', '')
    const res = await POST(makeFormRequest({ type: 'patron' }))
    expect(res.status).toBe(503)
  })
})

describe('POST /api/stripe/contribute — one_time checkout', () => {
  beforeEach(() => {
    mockCreate.mockReset()
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://recursiveintelligence.io')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('creates a payment mode checkout session and redirects (form body)', async () => {
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_onetime' })
    const res = await POST(makeFormRequest({ type: 'one_time', amount: '25' }))
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toBe('https://checkout.stripe.com/pay/cs_test_onetime')
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'payment',
    }))
    const call = mockCreate.mock.calls[0][0] as { line_items: Array<{ price_data: { unit_amount: number } }> }
    expect(call.line_items[0].price_data.unit_amount).toBe(2500) // $25 → 2500 cents
  })

  it('creates a payment mode checkout session from JSON body', async () => {
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_onetime_json' })
    const res = await POST(makeJsonRequest({ type: 'one_time', amount: 10 }))
    expect(res.status).toBe(303)
    const call = mockCreate.mock.calls[0][0] as { line_items: Array<{ price_data: { unit_amount: number } }> }
    expect(call.line_items[0].price_data.unit_amount).toBe(1000) // $10 → 1000 cents
  })

  it('sets success_url to /support?thanks=1', async () => {
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_x' })
    await POST(makeFormRequest({ type: 'one_time', amount: '5' }))
    const call = mockCreate.mock.calls[0][0] as { success_url: string }
    expect(call.success_url).toBe('https://recursiveintelligence.io/support?thanks=1')
  })

  it('sets cancel_url to /support', async () => {
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_x' })
    await POST(makeFormRequest({ type: 'one_time', amount: '5' }))
    const call = mockCreate.mock.calls[0][0] as { cancel_url: string }
    expect(call.cancel_url).toBe('https://recursiveintelligence.io/support')
  })

  it('returns 500 when Stripe returns no URL', async () => {
    mockCreate.mockResolvedValue({ url: null })
    const res = await POST(makeFormRequest({ type: 'one_time', amount: '5' }))
    expect(res.status).toBe(500)
  })

  it('returns 500 on Stripe API error', async () => {
    mockCreate.mockRejectedValue(new Error('Stripe error'))
    const res = await POST(makeFormRequest({ type: 'one_time', amount: '5' }))
    expect(res.status).toBe(500)
  })
})

describe('POST /api/stripe/contribute — patron checkout', () => {
  beforeEach(() => {
    mockCreate.mockReset()
    vi.stubEnv('STRIPE_PRICE_PATRON_ID', 'price_patron_live')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://recursiveintelligence.io')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('creates a subscription mode checkout session and redirects', async () => {
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_patron' })
    const res = await POST(makeFormRequest({ type: 'patron' }))
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toBe('https://checkout.stripe.com/pay/cs_test_patron')
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'subscription',
      line_items: [{ price: 'price_patron_live', quantity: 1 }],
    }))
  })

  it('sets success_url to /api/stripe/success (for session creation)', async () => {
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_p' })
    await POST(makeFormRequest({ type: 'patron' }))
    const call = mockCreate.mock.calls[0][0] as { success_url: string }
    expect(call.success_url).toContain('/api/stripe/success')
    expect(call.success_url).toContain('{CHECKOUT_SESSION_ID}')
  })

  it('sets cancel_url to /support', async () => {
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_p' })
    await POST(makeFormRequest({ type: 'patron' }))
    const call = mockCreate.mock.calls[0][0] as { cancel_url: string }
    expect(call.cancel_url).toBe('https://recursiveintelligence.io/support')
  })

  it('returns 500 when Stripe returns no URL', async () => {
    mockCreate.mockResolvedValue({ url: null })
    const res = await POST(makeFormRequest({ type: 'patron' }))
    expect(res.status).toBe(500)
  })
})
