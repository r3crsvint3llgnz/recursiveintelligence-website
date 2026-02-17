import { genPageMetadata } from '../seo'

export const metadata = genPageMetadata({
  title: 'Articles',
  description: 'Long-form writing on AI systems and philosophy of mind.',
})

export default function BlogPage() {
  return (
    <main className="py-12">
      <div className="ri-page-bg">
        <h1 className="ri-heading text-4xl font-bold mb-6">Articles</h1>
        <p className="text-gray-400 mb-8">
          Long-form writing on AI systems, philosophy of mind, and systems thinking.
        </p>
        <div className="glass p-8 text-center">
          <p className="text-xl text-gray-300 mb-4">Coming soon</p>
          <p className="text-sm text-gray-500">
            The MDX content system will be added in Module 2.
          </p>
        </div>
      </div>
    </main>
  )
}
