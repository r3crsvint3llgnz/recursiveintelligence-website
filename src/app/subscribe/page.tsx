import { unstable_cache } from 'next/cache'
import { genPageMetadata } from '../seo'
import { getStripe } from '@/lib/stripeClient'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata = genPageMetadata({
  title: 'Subscribe',
  description: 'Access the full AI/ML briefings archive.',
})

interface PriceInfo {
  id:       string
  amount:   number
  interval: string
  currency: string
}

const getPrices = unstable_cache(
  async (): Promise<{ monthly: PriceInfo; annual: PriceInfo }> => {
    const monthlyId = process.env.STRIPE_PRICE_MONTHLY_ID
    const annualId = process.env.STRIPE_PRICE_ANNUAL_ID
    if (!monthlyId || !annualId) {
      throw new Error('STRIPE_PRICE_MONTHLY_ID and STRIPE_PRICE_ANNUAL_ID must be set')
    }
    const stripe = getStripe()
    const [monthly, annual] = await Promise.all([
      stripe.prices.retrieve(monthlyId),
      stripe.prices.retrieve(annualId),
    ])
    return {
      monthly: {
        id:       monthly.id,
        amount:   (monthly.unit_amount ?? 0) / 100,
        interval: 'month',
        currency: monthly.currency,
      },
      annual: {
        id:       annual.id,
        amount:   (annual.unit_amount ?? 0) / 100,
        interval: 'year',
        currency: annual.currency,
      },
    }
  },
  ['stripe-prices'],
  { revalidate: 3600 }
)

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount)
}

interface SubscribePageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function SubscribePage({ searchParams }: SubscribePageProps) {
  const { error } = await searchParams

  // Render a "coming soon" state when Stripe isn't configured yet.
  // This prevents a 500 at runtime — the page stays up, subscriptions just aren't active.
  const stripeReady =
    !!process.env.STRIPE_PRICE_MONTHLY_ID && !!process.env.STRIPE_PRICE_ANNUAL_ID

  const prices = stripeReady ? await getPrices() : null

  return (
    <div className="py-12">
      <div className="mb-10 ri-fade-up">
        <h1 className="ri-heading font-space-grotesk text-4xl font-bold mb-4">Subscribe</h1>
        <p className="text-[color:var(--ri-muted)] text-lg max-w-xl">
          The latest brief is always free. The archive is where the patterns become visible: dozens of research cycles showing how the same cognitive principles play out across AI developments.
        </p>
      </div>

      {error === 'payment_incomplete' && (
        <div className="mb-8 glass border-l-[3px] border-red-500">
          <p className="text-sm text-[color:var(--ri-fg)]">
            Your payment was not completed. Please try again.
          </p>
        </div>
      )}

      {!prices ? (
        <div className="glass border-l-[3px] border-[color:var(--ri-accent)] max-w-2xl">
          <p className="text-[color:var(--ri-fg)] mb-2">Subscriptions coming soon.</p>
          <p className="text-[color:var(--ri-muted)] text-sm">
            Paid archive access is not yet active. The latest brief is always free.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
          <div className="glass border-l-[3px] border-[color:var(--ri-accent)]">
            <p className="text-[color:var(--ri-muted)] text-sm mb-1">Monthly</p>
            <p className="font-space-grotesk text-3xl font-bold text-[color:var(--ri-fg)] mb-1">
              {formatAmount(prices.monthly.amount, prices.monthly.currency)}
            </p>
            <p className="text-[color:var(--ri-muted)] text-xs mb-6">per month · cancel anytime</p>
            <form action="/api/stripe/checkout" method="POST">
              <input type="hidden" name="priceId" value={prices.monthly.id} />
              <button
                type="submit"
                className="w-full font-semibold py-2 px-4 rounded bg-[color:var(--ri-accent)] text-[color:var(--ri-bg)] hover:bg-[color:var(--ri-accent-700)] transition-colors ri-accent-ring"
              >
                Subscribe Monthly
              </button>
            </form>
          </div>

          <div className="glass border-l-[3px] border-[color:var(--ri-accent)] relative">
            <p className="text-[color:var(--ri-accent)] text-xs font-semibold uppercase tracking-wide mb-1">Recommended</p>
            <p className="text-[color:var(--ri-muted)] text-sm mb-1">Annual</p>
            <p className="font-space-grotesk text-3xl font-bold text-[color:var(--ri-fg)] mb-1">
              {formatAmount(prices.annual.amount, prices.annual.currency)}
            </p>
            <p className="text-[color:var(--ri-muted)] text-xs mb-1">per year · best value</p>
            <p className="text-[color:var(--ri-accent)] text-xs font-medium mb-6">Save $20 vs monthly</p>
            <form action="/api/stripe/checkout" method="POST">
              <input type="hidden" name="priceId" value={prices.annual.id} />
              <button
                type="submit"
                className="w-full font-semibold py-2 px-4 rounded bg-[color:var(--ri-accent)] text-[color:var(--ri-bg)] hover:bg-[color:var(--ri-accent-700)] transition-colors ri-accent-ring"
              >
                Subscribe Annually
              </button>
            </form>
          </div>
        </div>
      )}

      <p className="mt-8 text-sm text-[color:var(--ri-muted)]">
        Looking to support the research without a subscription?{' '}
        <Link href="/support" className="ri-link ri-accent-ring">
          Fund the Lab →
        </Link>
      </p>
    </div>
  )
}
