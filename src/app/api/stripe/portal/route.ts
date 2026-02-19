import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getActiveSession, getSessionRecord } from '@/lib/sessions'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const baseUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const sessionId = req.cookies.get('ri_session')?.value

  if (!sessionId || !(await getActiveSession(sessionId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const record = await getSessionRecord(sessionId)
  if (!record) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer:   record.stripe_customer_id,
      return_url: `${baseUrl}/account`,
    })
    return NextResponse.redirect(portalSession.url, 303)
  } catch (err) {
    console.error('Stripe portal error:', err)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}
