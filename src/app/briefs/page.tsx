import Link from 'next/link'
import { cookies } from 'next/headers'
import { getBriefs, isTableNotProvisionedError } from '@/lib/briefs'
import { getActiveSession } from '@/lib/sessions'
import { genPageMetadata } from '../seo'
import type { Brief } from '@/types/brief'

export const dynamic = 'force-dynamic'

export const metadata = genPageMetadata({
  title: 'Briefs',
  description: 'Bi-daily AI/ML research summaries.',
})

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="shrink-0 self-start text-xs font-semibold px-2 py-0.5 rounded-full bg-[color:var(--ri-accent)] text-[color:var(--ri-bg)]">
      {category}
    </span>
  )
}

function LatestBriefCard({ brief }: { brief: Brief }) {
  return (
    <li>
      <article className="glass border-l-[3px] border-[color:var(--ri-accent)]">
        <div className="flex items-start justify-between gap-3 mb-2">
          <Link
            href={`/briefs/${brief.id}`}
            className="ri-link text-xl font-bold leading-snug hover:underline ri-accent-ring"
          >
            {brief.title}
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[color:var(--ri-fg)] text-[color:var(--ri-bg)]">
              Latest
            </span>
            {brief.category && <CategoryBadge category={brief.category} />}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-[color:var(--ri-muted)] mb-3">
          <time dateTime={brief.date}>{formatDate(brief.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{brief.items.length} {brief.items.length === 1 ? 'link' : 'links'}</span>
        </div>
        <p className="text-sm text-[color:var(--ri-fg)] leading-relaxed">{brief.summary}</p>
      </article>
    </li>
  )
}

function ArchiveBriefCard({ brief, isSubscriber }: { brief: Brief; isSubscriber: boolean }) {
  if (isSubscriber) {
    return (
      <li>
        <article className="glass border-l-[3px] border-[color:var(--ri-accent)] opacity-90">
          <div className="flex items-start justify-between gap-3 mb-2">
            <Link
              href={`/briefs/${brief.id}`}
              className="ri-link text-xl font-bold leading-snug hover:underline ri-accent-ring"
            >
              {brief.title}
            </Link>
            {brief.category && <CategoryBadge category={brief.category} />}
          </div>
          <div className="flex items-center gap-3 text-xs text-[color:var(--ri-muted)] mb-3">
            <time dateTime={brief.date}>{formatDate(brief.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{brief.items.length} {brief.items.length === 1 ? 'link' : 'links'}</span>
          </div>
          <p className="text-sm text-[color:var(--ri-fg)] leading-relaxed">{brief.summary}</p>
        </article>
      </li>
    )
  }

  return (
    <li>
      <article className="glass border-l-[3px] border-[color:var(--ri-muted)] opacity-70">
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="text-xl font-bold leading-snug text-[color:var(--ri-fg)]">
            {brief.title}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span aria-label="Subscriber only" title="Subscriber only">🔒</span>
            {brief.category && <CategoryBadge category={brief.category} />}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-[color:var(--ri-muted)] mb-3">
          <time dateTime={brief.date}>{formatDate(brief.date)}</time>
        </div>
        <p className="text-sm text-[color:var(--ri-muted)] leading-relaxed blur-sm select-none">
          {brief.summary}
        </p>
        <Link href="/subscribe" className="ri-link text-xs mt-3 inline-block ri-accent-ring">
          Subscribe to read →
        </Link>
      </article>
    </li>
  )
}

export default async function BriefsPage() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('ri_session')?.value

  let isSubscriber = false
  if (sessionId) {
    try {
      isSubscriber = await getActiveSession(sessionId)
    } catch {
      // Session check failure — treat as anonymous
    }
  }

  let briefs: Brief[] = []
  try {
    briefs = await getBriefs()
  } catch (err) {
    if (!isTableNotProvisionedError(err)) throw err
  }

  const [latestBrief, ...archiveBriefs] = briefs

  return (
    <div className="py-12">
      <div className="mb-10 ri-fade-up">
        <h1 className="ri-heading font-space-grotesk text-4xl font-bold mb-4">Briefs</h1>
        <p className="text-[color:var(--ri-muted)] text-lg max-w-xl">
          Bi-daily AI/ML research summaries. The latest edition is always free.
        </p>
      </div>

      {briefs.length === 0 ? (
        <p className="text-[color:var(--ri-muted)]">No briefs yet. Check back soon.</p>
      ) : (
        <ol className="space-y-6 list-none p-0">
          {latestBrief && <LatestBriefCard brief={latestBrief} />}
          {archiveBriefs.map((brief) => (
            <ArchiveBriefCard key={brief.id} brief={brief} isSubscriber={isSubscriber} />
          ))}
        </ol>
      )}

      {!isSubscriber && archiveBriefs.length > 0 && (
        <div className="mt-12 glass text-center">
          <p className="text-[color:var(--ri-fg)] mb-4">
            Access {archiveBriefs.length} archived {archiveBriefs.length === 1 ? 'brief' : 'briefs'} with a subscription.
          </p>
          <Link href="/subscribe" className="ri-link font-semibold ri-accent-ring">
            Subscribe →
          </Link>
        </div>
      )}
    </div>
  )
}
