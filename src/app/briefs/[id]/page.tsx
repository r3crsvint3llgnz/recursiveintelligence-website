import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getBrief } from '@/lib/briefs'
import { getActiveSession } from '@/lib/sessions'
import { BriefBody } from '@/components/BriefBody'
import { genPageMetadata } from '../../seo'
import { isSafeUrl } from '@/lib/isSafeUrl'
import type { BriefItem } from '@/types/brief'

export const dynamic = 'force-dynamic'

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  try {
    const brief = await getBrief(id)
    if (!brief) return { title: 'Brief Not Found' }
    return genPageMetadata({ title: brief.title, description: brief.summary })
  } catch {
    return { title: 'Brief Not Found' }
  }
}

export default async function BriefDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id } = await params

  let brief
  try {
    brief = await getBrief(id)
  } catch {
    notFound()
  }
  if (!brief) notFound()

  if (brief.category.toLowerCase() === 'world') {
    // Private owner-only brief — requires owner token in query param
    const { t } = await searchParams
    const ownerToken = process.env.OWNER_ACCESS_TOKEN
    if (!ownerToken || t !== ownerToken) notFound()
  } else if (!brief.is_latest) {
    // Paywall: only the latest public brief is free. Older ones require a subscriber session.
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('ri_session')?.value
    const authorized = sessionId ? await getActiveSession(sessionId) : false
    if (!authorized) redirect('/subscribe')
  }

  return (
    <div className="py-12">
      <div className="mb-8">
        <Link href="/briefs" className="ri-link ri-accent-ring text-sm">
          ← Back to Briefs
        </Link>
      </div>

      <div className="mb-8 ri-fade-up">
        <h1 className="ri-heading font-space-grotesk text-4xl font-bold mb-4">
          {brief.title}
        </h1>
        <div className="flex items-center gap-3 mt-6 text-sm text-[color:var(--ri-muted)]">
          <time dateTime={brief.date}>{formatDate(brief.date)}</time>
          {brief.category && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[color:var(--ri-accent)] text-[color:var(--ri-bg)]">
                {brief.category}
              </span>
            </>
          )}
          {brief.is_latest && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[color:var(--ri-fg)] text-[color:var(--ri-bg)]">
                Latest
              </span>
            </>
          )}
        </div>
      </div>

      <p className="text-[color:var(--ri-fg)] text-base leading-relaxed mb-10 max-w-2xl">
        {brief.summary}
      </p>

      <div className="ri-divider mb-10" aria-hidden="true" />

      {brief.body && (
        <section className="mb-10">
          <BriefBody content={brief.body} />
        </section>
      )}

      <div className="ri-divider mb-10" aria-hidden="true" />

      <section>
        <h2 className="font-space-grotesk text-2xl font-bold text-[color:var(--ri-fg)] mb-6">
          Links
        </h2>
        <ol className="space-y-4 list-none p-0">
          {brief.items.map((item: BriefItem, index: number) => (
            <li key={index} className="glass">
              {isSafeUrl(item.url) ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ri-link ri-accent-ring font-semibold"
                >
                  {item.title}
                </a>
              ) : (
                <span className="font-semibold text-[color:var(--ri-fg)]">{item.title}</span>
              )}
              <p className="text-xs text-[color:var(--ri-muted)] mt-1">{item.source}</p>
              <p className="text-sm text-[color:var(--ri-fg)] mt-2 leading-relaxed">{item.snippet}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
