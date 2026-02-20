import { fetchReadingList } from '@/lib/raindrop'
import { genPageMetadata } from '../seo'

export const revalidate = 3600

export const metadata = genPageMetadata({
  title: 'AI/ML Reading List',
  description:
    'Curated AI/ML news and research with summaries — updated continuously.',
})

export default async function ReadingListPage() {
  const items = await fetchReadingList()

  return (
    <>
      <div className="mb-8">
        <h1 className="ri-heading text-4xl font-extrabold tracking-tight mb-3">
          AI/ML Reading List
        </h1>
        <p className="text-gray-400">
          Curated links with summaries.{' '}
          <a
            href="/rss/reading-list.xml"
            className="ri-link text-sm"
          >
            RSS feed ↗
          </a>
        </p>
      </div>

      {items.length === 0 && (
        <p className="text-gray-500">No items yet.</p>
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
            {item.note && (
              <p className="mt-2 text-gray-300 text-sm leading-relaxed">
                {item.note}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <time dateTime={item.created}>
                {new Date(item.created).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded border border-gray-700 text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
