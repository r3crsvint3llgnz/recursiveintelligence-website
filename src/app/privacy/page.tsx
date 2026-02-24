import { genPageMetadata } from '../seo'

export const metadata = genPageMetadata({
  title: 'Privacy Policy',
  description: 'Privacy policy for Recursive Intelligence.',
})

export const dynamic = 'force-static'
export const revalidate = false

export default function PrivacyPage() {
  return (
    <div className="py-12 max-w-2xl">
      <h1 className="ri-heading text-4xl font-bold mb-8">Privacy Policy</h1>

      <div className="space-y-6 text-[color:var(--ri-fg)]">
        <p className="text-[color:var(--ri-muted)] text-sm">Last updated: February 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What I collect</h2>
          <p>
            This site collects minimal data. If you subscribe or support the research,
            Stripe processes your payment — I receive only your email address and
            subscription status. Newsletter signups store your email address only.
          </p>
          <p>
            AWS CloudWatch RUM may collect anonymous performance and error data
            (page load times, JS errors). No personally identifiable information
            is collected by RUM.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What I don&apos;t do</h2>
          <p>
            I don&apos;t sell your data. I don&apos;t run third-party ad trackers.
            I don&apos;t share your email with anyone.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Cookies</h2>
          <p>
            Subscriptions use a session cookie (<code className="text-sm">ri_session</code>)
            to keep you logged in. No tracking or advertising cookies are set.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p>
            Questions about your data? Email{' '}
            <a href="mailto:seth.robins@recursiveintelligence.io" className="ri-link">
              seth.robins@recursiveintelligence.io
            </a>.
          </p>
        </section>
      </div>
    </div>
  )
}
