import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { randomUUID } from 'crypto'
import { createSession } from '@/lib/sessions'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const checkoutSessionId = req.nextUrl.searchParams.get('checkout_session_id')

  if (!checkoutSessionId) {
    return NextResponse.redirect(`${baseUrl}/subscribe?error=payment_incomplete`)
  }

  let checkoutSession: Stripe.Checkout.Session
  try {
    checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
      expand: ['subscription'],
    })
  } catch {
    return NextResponse.redirect(`${baseUrl}/subscribe?error=payment_incomplete`)
  }

  if (checkoutSession.payment_status !== 'paid') {
    return NextResponse.redirect(`${baseUrl}/subscribe?error=payment_incomplete`)
  }

  const subscription = checkoutSession.subscription as Stripe.Subscription
  const riSessionId = randomUUID()

  try {
    await createSession({
      session_id:             riSessionId,
      stripe_customer_id:     checkoutSession.customer as string,
      stripe_subscription_id: subscription.id,
      email:                  checkoutSession.customer_details?.email ?? '',
      status:                 'active',
    })
  } catch (err) {
    console.error('Failed to create session record:', err)
    return NextResponse.redirect(`${baseUrl}/subscribe?error=payment_incomplete`)
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
