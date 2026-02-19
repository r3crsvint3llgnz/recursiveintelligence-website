import { NextRequest, NextResponse } from 'next/server'
import { getSessionRecord } from '@/lib/sessions'
import { getStripe } from '@/lib/stripeClient'

export async function POST(req: NextRequest) {
  const baseUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const sessionId = req.cookies.get('ri_session')?.value

  const record = sessionId ? await getSessionRecord(sessionId) : null
  if (!record || record.status !== 'active') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const portalSession = await getStripe().billingPortal.sessions.create({
      customer:   record.stripe_customer_id,
      return_url: `${baseUrl}/account`,
    })
    return NextResponse.redirect(portalSession.url, 303)
  } catch (err) {
    console.error('Stripe portal error:', err)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}
