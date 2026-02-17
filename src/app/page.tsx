/*
  Homepage is intentionally static. Do not add data fetching here.
  Articles and briefs content sections will link to dedicated routes.
*/
import HomeHero from "../components/HomeHero";

export default function Page() {
  return (
    <main>
      <HomeHero />

      <section className="max-w-3xl mx-auto px-4 pb-12">
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">Articles</h3>
            <p className="text-gray-400 text-sm">
              Long-form writing on AI systems and philosophy of mind.
            </p>
            <a href="/blog" className="inline-block mt-4 text-orange-400 hover:underline">
              Read articles →
            </a>
          </div>
          <div className="border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">AI/ML Briefs</h3>
            <p className="text-gray-400 text-sm">
              Twice-daily research summaries synthesized from ~50 sources.
            </p>
            <a href="/briefs" className="inline-block mt-4 text-orange-400 hover:underline">
              View briefs →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
