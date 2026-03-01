import { fetchReadingList } from '@/lib/raindrop'
import { genPageMetadata } from '../seo'
import ContentWrapper from "../../components/ContentWrapper"

export const dynamic = 'force-dynamic'

export const metadata = genPageMetadata({
  title: 'AI/ML Reading List',
  description:
    'Curated AI/ML news and research with summaries — updated continuously.',
})

export default async function ReadingListPage() {
  const items = await fetchReadingList()

  return (
    <ContentWrapper>
      <div className="mb-8">
        <h1 className="ri-heading text-4xl font-extrabold tracking-tight mb-3">
          AI/ML Reading List
        </h1>
        <p className="text-[color:var(--ri-muted)]">
          Curated links with summaries.{' '}
          <a
            href="/rss/reading-list.xml"
            className="ri-link ri-accent-ring text-sm"
          >
            RSS feed ↗
          </a>
        </p>
      </div>

      {items.length === 0 && (
        <p className="text-[color:var(--ri-muted)]">No items yet.</p>
      )}

      <ul className="space-y-8">
        {items.map((item) => (
          <li key={item._id} className="glass p-5 rounded-lg">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="ri-link text-lg font-semibold leading-snug"
            >
              {item.title}
            </a>
            {item.note.trim() && (
              <p className="mt-2 text-[color:var(--ri-fg)] text-sm leading-relaxed">
                {item.note}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[color:var(--ri-muted)]">
              <time dateTime={item.created} suppressHydrationWarning>
                {new Date(item.created).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded border border-[color:var(--ri-border)] text-[color:var(--ri-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </ContentWrapper>
  )
}
