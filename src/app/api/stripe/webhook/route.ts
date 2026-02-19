import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { updateSessionStatus } from '@/lib/sessions'
import { getStripe } from '@/lib/stripeClient'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const sig    = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !secret) {
    return NextResponse.json({ error: 'Missing stripe-signature or webhook secret' }, { status: 400 })
  }

  const rawBody = await req.arrayBuffer()
  const bodyBuffer = Buffer.from(rawBody)

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(bodyBuffer, sig, secret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await updateSessionStatus(sub.customer as string, 'cancelled')
        break
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const status =
          sub.status === 'active'   ? 'active'    :
          sub.status === 'past_due' ? 'past_due'  : 'cancelled'
        await updateSessionStatus(sub.customer as string, status)
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await updateSessionStatus(invoice.customer as string, 'past_due')
        break
      }
      default:
        break
    }
  } catch (err) {
    console.error('Webhook handler error for event', event.type, ':', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
