import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSessionRecord } from '@/lib/sessions'
import { genPageMetadata } from '../seo'
import ContentWrapper from "../../components/ContentWrapper"

export const metadata = {
  ...genPageMetadata({ title: 'Account', description: 'Manage your subscription.' }),
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('ri_session')?.value

  const record = sessionId ? await getSessionRecord(sessionId) : null
  if (!record || record.status !== 'active') {
    redirect('/subscribe')
  }

  const statusLabel: Record<string, string> = {
    active:    'Active',
    past_due:  'Past Due',
    cancelled: 'Cancelled',
  }

  return (
    <ContentWrapper>
    <div className="py-12">
      <div className="mb-10 ri-fade-up">
        <h1 className="ri-heading font-space-grotesk text-4xl font-bold mb-4">Account</h1>
      </div>

      <div className="glass mb-4 max-w-md">
        <p className="text-xs text-[color:var(--ri-muted)] mb-1 uppercase tracking-wide">Email</p>
        <p className="text-[color:var(--ri-fg)]">{record.email || '—'}</p>
      </div>

      <div className="glass mb-10 max-w-md">
        <p className="text-xs text-[color:var(--ri-muted)] mb-1 uppercase tracking-wide">Subscription</p>
        <p className="text-[color:var(--ri-fg)]">{statusLabel[record.status] ?? record.status}</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form action="/api/stripe/portal" method="POST">
          <button
            type="submit"
            className="ri-link font-semibold ri-accent-ring"
          >
            Manage Subscription →
          </button>
        </form>
        <span className="hidden sm:inline text-[color:var(--ri-muted)]" aria-hidden="true">·</span>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="text-sm text-[color:var(--ri-muted)] hover:text-[color:var(--ri-fg)] transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-8">
        <Link href="/briefs" className="ri-link text-sm ri-accent-ring">
          ← Back to Briefs
        </Link>
      </div>
    </div>
    </ContentWrapper>
  )
}
