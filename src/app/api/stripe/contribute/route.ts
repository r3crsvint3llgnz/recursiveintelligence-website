// src/app/api/stripe/contribute/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripeClient'

export async function POST(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  // Handle both JSON and form-encoded bodies
  const contentType = req.headers.get('content-type') ?? ''
  let type: string | undefined
  let amount: number | undefined // raw value from body (dollars for form, any for JSON)

  if (contentType.includes('application/json')) {
    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    type = typeof body.type === 'string' ? body.type : undefined
    amount = typeof body.amount === 'number' ? body.amount : undefined
  } else {
    const formData = await req.formData()
    type = formData.get('type')?.toString()
    const raw = formData.get('amount')?.toString()
    amount = raw != null ? parseFloat(raw) : undefined
  }

  if (!type || (type !== 'one_time' && type !== 'patron')) {
    return NextResponse.json({ error: 'type must be one_time or patron' }, { status: 400 })
  }

  // ── One-time contribution ─────────────────────────────────────────────
  if (type === 'one_time') {
    if (amount == null || isNaN(amount)) {
      return NextResponse.json({ error: 'amount is required for one_time contributions' }, { status: 400 })
    }
    const cents = Math.round(amount * 100)
    if (cents < 100) {
      return NextResponse.json({ error: 'minimum contribution is $1 (100 cents)' }, { status: 400 })
    }

    try {
      const session = await getStripe().checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: cents,
              product_data: { name: 'Fund the Lab — Recursive Intelligence' },
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/support?thanks=1`,
        cancel_url:  `${baseUrl}/support`,
      })
      if (!session.url) {
        return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 })
      }
      return NextResponse.redirect(session.url, 303)
    } catch (err) {
      console.error('Stripe one-time checkout error:', err)
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }
  }

  // ── Patron recurring subscription ────────────────────────────────────
  const patronPriceId = process.env.STRIPE_PRICE_PATRON_ID
  if (!patronPriceId) {
    return NextResponse.json({ error: 'Patron tier not yet available' }, { status: 503 })
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: patronPriceId, quantity: 1 }],
      success_url: `${baseUrl}/api/stripe/success?checkout_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/support`,
    })
    if (!session.url) {
      return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 })
    }
    return NextResponse.redirect(session.url, 303)
  } catch (err) {
    console.error('Stripe patron checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
