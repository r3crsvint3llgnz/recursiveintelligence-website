import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { randomUUID } from 'crypto'
import { createSession, getSessionBySubscriptionId } from '@/lib/sessions'
import { getStripe } from '@/lib/stripeClient'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const checkoutSessionId = req.nextUrl.searchParams.get('checkout_session_id')

  if (!checkoutSessionId) {
    return NextResponse.redirect(`${baseUrl}/subscribe?error=payment_incomplete`)
  }

  let checkoutSession: Stripe.Checkout.Session
  try {
    checkoutSession = await getStripe().checkout.sessions.retrieve(checkoutSessionId, {
      expand: ['subscription'],
    })
  } catch {
    return NextResponse.redirect(`${baseUrl}/subscribe?error=payment_incomplete`)
  }

  if (checkoutSession.payment_status !== 'paid') {
    return NextResponse.redirect(`${baseUrl}/subscribe?error=payment_incomplete`)
  }

  const subscription = checkoutSession.subscription
  if (!subscription || typeof subscription === 'string') {
    return NextResponse.redirect(`${baseUrl}/subscribe?error=payment_incomplete`)
  }

  const customerId = checkoutSession.customer as string
  const subscriptionId = subscription.id

  // Check if a session already exists for this customer+subscription (idempotency)
  let riSessionId: string
  const existingSession = await getSessionBySubscriptionId(customerId, subscriptionId)
  
  if (existingSession) {
    // Reuse existing session (idempotent re-processing of same checkout)
    riSessionId = existingSession.session_id
  } else {
    // Create new session
    riSessionId = randomUUID()
    try {
      await createSession({
        session_id:             riSessionId,
        stripe_customer_id:     customerId,
        stripe_subscription_id: subscriptionId,
        email:                  checkoutSession.customer_details?.email ?? '',
        status:                 'active',
      })
    } catch (err) {
      console.error('Failed to create session record:', err)
      return NextResponse.redirect(`${baseUrl}/subscribe?error=payment_incomplete`)
    }
  }

  const response = NextResponse.redirect(`${baseUrl}/briefs`)
  response.cookies.set('ri_session', riSessionId, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   2592000, // 30 days — matches DynamoDB TTL
    path:     '/',
  })
  return response
}
