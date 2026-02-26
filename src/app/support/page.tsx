// src/app/support/page.tsx
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import { genPageMetadata } from '../seo'
import { getStripe } from '@/lib/stripeClient'

export const dynamic = 'force-dynamic'

export const metadata = genPageMetadata({
  title: 'Support',
  description: 'Fund the research pipeline — direct patronage supporting the autonomous Claude 4.6 agent and independent API costs.',
})

interface PriceInfo {
  id:       string
  amount:   number
  currency: string
}

const getPatronPrice = unstable_cache(
  async (): Promise<PriceInfo | null> => {
    const patronId = process.env.STRIPE_PRICE_PATRON_ID
    if (!patronId) return null
    const price = await getStripe().prices.retrieve(patronId)
    return {
      id:       price.id,
      amount:   (price.unit_amount ?? 0) / 100,
      currency: price.currency,
    }
  },
  ['stripe-patron-price'],
  { revalidate: 3600 }
)

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency:              currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount)
}

interface SupportPageProps {
  searchParams: Promise<{ thanks?: string }>
}

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const { thanks } = await searchParams
  const patronPrice = await getPatronPrice().catch(() => null)

  return (
    <div className="py-12">
      <div className="mb-10 ri-fade-up">
        <h1 className="ri-heading font-space-grotesk text-4xl font-bold mb-4">Fund the Research Pipeline</h1>
        <p className="text-[color:var(--ri-muted)] text-lg max-w-xl">
          Direct contributions to support the autonomous Claude 4.6 agent and independent API costs.
        </p>
      </div>

      {thanks === '1' && (
        <div className="mb-10 glass border-l-[3px] border-[color:var(--ri-accent)] max-w-xl">
          <p className="font-semibold text-[color:var(--ri-fg)] mb-1">Thank you.</p>
          <p className="text-sm text-[color:var(--ri-muted)]">
            Your contribution helps keep the lab running. I appreciate it.
          </p>
        </div>
      )}

      {/* ── Fund the Lab (one-time) ────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="font-space-grotesk text-2xl font-bold text-[color:var(--ri-fg)] mb-2">
          Fund the Lab
        </h2>
        <p className="text-[color:var(--ri-muted)] text-sm mb-6 max-w-lg">
          A one-time contribution of any amount. No subscription, no commitment — just direct support for the work.
        </p>
        <form
          action="/api/stripe/contribute"
          method="POST"
          className="flex items-end gap-3 max-w-xs"
        >
          <input type="hidden" name="type" value="one_time" />
          <div className="flex-1">
            <label htmlFor="amount" className="block text-xs text-[color:var(--ri-muted)] mb-1">
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--ri-muted)] select-none">$</span>
              <input
                type="number"
                id="amount"
                name="amount"
                min="1"
                step="1"
                defaultValue="10"
                required
                className="w-full pl-7 pr-3 py-2 rounded border border-[color:var(--ri-border)] bg-[color:var(--ri-bg)] text-[color:var(--ri-fg)] focus:outline-none focus:border-[color:var(--ri-accent)] focus:ring-1 focus:ring-[color:var(--ri-accent)]"
              />
            </div>
          </div>
          <button
            type="submit"
            className="font-semibold py-2 px-4 rounded bg-[color:var(--ri-accent)] text-[color:var(--ri-bg)] hover:bg-[color:var(--ri-accent-700)] transition-colors ri-accent-ring whitespace-nowrap"
          >
            Give →
          </button>
        </form>
      </section>

      <hr className="ri-divider my-8" />

      {/* ── Become a Patron (recurring) ───────────────────────────── */}
      <section>
        <h2 className="font-space-grotesk text-2xl font-bold text-[color:var(--ri-fg)] mb-2">
          Become a Patron
        </h2>
        <p className="text-[color:var(--ri-muted)] text-sm mb-6 max-w-lg">
          Monthly support for the lab. Includes full access to the AI/ML briefs archive.
        </p>

        {!patronPrice ? (
          <div className="glass border-l-[3px] border-[color:var(--ri-accent)] max-w-md">
            <p className="text-[color:var(--ri-fg)] mb-1">Patron tier coming soon.</p>
            <p className="text-[color:var(--ri-muted)] text-sm">
              Recurring support is not yet active. Check back shortly.
            </p>
          </div>
        ) : (
          <div className="glass border-l-[3px] border-[color:var(--ri-accent)] max-w-xs">
            <p className="text-[color:var(--ri-muted)] text-sm mb-1">Monthly patron</p>
            <p className="font-space-grotesk text-3xl font-bold text-[color:var(--ri-fg)] mb-1">
              {formatAmount(patronPrice.amount, patronPrice.currency)}
            </p>
            <p className="text-[color:var(--ri-muted)] text-xs mb-1">per month · cancel anytime</p>
            <p className="text-[color:var(--ri-muted)] text-xs mb-6">includes full brief archive access</p>
            <form action="/api/stripe/contribute" method="POST">
              <input type="hidden" name="type" value="patron" />
              <button
                type="submit"
                className="w-full font-semibold py-2 px-4 rounded bg-[color:var(--ri-accent)] text-[color:var(--ri-bg)] hover:bg-[color:var(--ri-accent-700)] transition-colors ri-accent-ring"
              >
                Become a Patron →
              </button>
            </form>
          </div>
        )}
      </section>

      <div className="mt-12 text-sm text-[color:var(--ri-muted)]">
        Looking for archive access without patronage?{' '}
        <Link href="/subscribe" className="ri-link ri-accent-ring">
          Subscribe →
        </Link>
      </div>
    </div>
  )
}
