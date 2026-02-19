import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripeClient'

export async function POST(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  // Handle both JSON and form-encoded bodies (subscribe page uses HTML forms)
  const contentType = req.headers.get('content-type') ?? ''
  let priceId: string | undefined
  if (contentType.includes('application/json')) {
    const body = await req.json().catch(() => ({}))
    priceId = body.priceId
  } else {
    const formData = await req.formData()
    priceId = formData.get('priceId')?.toString()
  }

  if (!priceId || typeof priceId !== 'string') {
    return NextResponse.json({ error: 'priceId required' }, { status: 400 })
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/api/stripe/success?checkout_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/subscribe`,
    })
    if (!session.url) {
      return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 })
    }
    return NextResponse.redirect(session.url, 303)
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
