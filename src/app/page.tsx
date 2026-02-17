/*
  Homepage is intentionally static. Do not add data fetching here.
  Articles and briefs content sections will link to dedicated routes.
*/
import Link from "next/link";
import HomeHero from "../components/HomeHero";

export default function Page() {
  return (
    <main>
      <HomeHero />

      <hr className="ri-divider my-8" />

      <section className="max-w-3xl mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass border-l-[3px] border-[color:var(--ri-accent)] hover:bg-white/[0.06] transition-colors p-6">
            <h3 className="text-xl font-bold mb-2">Articles</h3>
            <p className="text-gray-400 text-sm">
              Long-form writing on AI systems and philosophy of mind.
            </p>
            <Link href="/blog" className="ri-link inline-block mt-4 text-sm">
              Read articles →
            </Link>
          </div>
          <div className="glass border-l-[3px] border-[color:var(--ri-accent)] hover:bg-white/[0.06] transition-colors p-6">
            <h3 className="text-xl font-bold mb-2">AI/ML Briefs</h3>
            <p className="text-gray-400 text-sm">
              Twice-daily research summaries synthesized from ~50 sources.
            </p>
            <Link href="/briefs" className="ri-link inline-block mt-4 text-sm">
              View briefs →
            </Link>
          </div>
          <div className="glass border-l-[3px] border-[color:var(--ri-accent)] hover:bg-white/[0.06] transition-colors p-6">
            <h3 className="text-xl font-bold mb-2">Recursive Garden</h3>
            <p className="text-gray-400 text-sm">
              My digital garden — notes, experiments, and thinking in progress.
            </p>
            <a
              href="https://recursiveintelligence.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="ri-link inline-block mt-4 text-sm"
            >
              Explore the garden →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
