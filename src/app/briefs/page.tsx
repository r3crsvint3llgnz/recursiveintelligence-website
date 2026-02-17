import { genPageMetadata } from '../seo'

export const metadata = genPageMetadata({
  title: 'AI/ML Briefs',
  description: 'Twice-daily research summaries synthesized from ~50 sources.',
})

export default function BriefsPage() {
  return (
    <main className="py-12">
      <div className="ri-page-bg">
        <h1 className="ri-heading text-4xl font-bold mb-6">AI/ML Briefs</h1>
        <p className="text-gray-400 mb-8">
          Twice-daily research summaries synthesized from ~50 sources.
        </p>
        <div className="glass p-8 text-center">
          <p className="text-xl text-gray-300 mb-4">Coming soon</p>
          <p className="text-sm text-gray-500">
            The brief ingestion system will be added in Module 4.
          </p>
        </div>
      </div>
    </main>
  )
}
