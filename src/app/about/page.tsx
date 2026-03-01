import Link from 'next/link'
import { genPageMetadata } from '../seo'
import ContentWrapper from "../../components/ContentWrapper"

export const metadata = genPageMetadata({
  title: 'About',
  description:
    'Seth Robins — translating cognitive science and AI research into practical frameworks for human-AI collaboration.',
  canonical: '/about',
})

export const dynamic = "force-static";
export const revalidate = false;

export default function AboutPage() {
  return (
    <ContentWrapper>
    <div className="py-12">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">About</h1>

      <div className="space-y-10 text-gray-900 dark:text-gray-200">
        <p className="text-xl">
          I&apos;m{" "}
          <a
            href="https://www.linkedin.com/in/sethrobins1010/"
            className="text-orange-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Seth Robins
          </a>
          . I translate cognitive science and AI research
          into practical frameworks — the kind you can actually apply to how you
          think and collaborate with AI systems.
        </p>

        <hr className="ri-divider" />

        <section>
          <h2 className="ri-heading text-2xl font-bold mb-6">What You&apos;ll Find Here</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Original Research &amp; Writing</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Long-form articles turning peer-reviewed cognitive science and AI
                research into actionable methodology. No theory without practice.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">AI/ML Briefs</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Twice-daily curated research summaries. An automated system
                analyzes ~50 AI/ML articles every 12 hours and generates
                synthesized briefs.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">AWS Experiments</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Infrastructure I build to support the research — agent frameworks,
                brief ingestion pipelines, and open tooling.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">The Recursive Garden</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                My{" "}
                <a
                  href="https://recursiveintelligence.xyz"
                  className="text-orange-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  digital garden
                </a>{" "}
                is where messy thinking happens — notes, experiments, and
                experimental fiction.
              </p>
            </div>
          </div>
        </section>

        <hr className="ri-divider" />

        <section>
          <h2 className="ri-heading text-2xl font-bold mb-6">Why This Exists</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            Most AI coverage either oversimplifies the research or gets lost in
            hype. I&apos;m an autistic systems thinker with a full-time job elsewhere —
            this is my independent applied research platform, built to close that gap.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            I read the studies, distill what actually holds up, and build frameworks
            grounded in evidence. Support from readers funds AWS infrastructure, research
            time, and open tooling.
          </p>
          <p className="text-gray-500 text-sm mt-3">Think of it as a self-sustaining applied research lab.</p>
        </section>

        <hr className="ri-divider" />

        <section>
          <h2 className="ri-heading text-2xl font-bold mb-4">Industrial AI Portfolio</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-5">
            My full work history, architecture case studies, and quantified impact are at
            my interactive portfolio. It includes a chatbot — ask me directly about my
            experience, methodologies, or anything on the resume. Built for recruiters
            and hiring managers.
          </p>
          <Link
            href="/resume"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold text-white transition-colors bg-orange-500 hover:bg-orange-600"
          >
            View Portfolio &amp; Ask Me Directly →
          </Link>
        </section>

        <hr className="ri-divider" />

        <section>
          <h2 className="ri-heading text-2xl font-bold mb-6">Connect</h2>
          <ul className="ri-list space-y-2 text-gray-600 dark:text-gray-400">
            <li>
              <strong className="text-gray-900 dark:text-gray-200">Digital Garden:</strong>{" "}
              <a href="https://recursiveintelligence.xyz" className="text-orange-400 hover:underline" target="_blank" rel="noopener noreferrer">
                recursiveintelligence.xyz
              </a>
            </li>
            <li>
              <strong className="text-gray-900 dark:text-gray-200">Resume:</strong>{" "}
              <a href="/resume" className="text-orange-400 hover:underline">
                sethrobins.recursiveintelligence.io
              </a>
            </li>
            <li>
              <strong className="text-gray-900 dark:text-gray-200">Substack:</strong>{" "}
              <a href="https://substack.recursiveintelligence.io" className="text-orange-400 hover:underline" target="_blank" rel="noopener noreferrer">
                substack.recursiveintelligence.io
              </a>
            </li>
            <li>
              <strong className="text-gray-900 dark:text-gray-200">Bluesky:</strong>{" "}
              <a
                href="https://bsky.app/profile/r3crsvint3llgnz.bsky.social"
                className="text-orange-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                @r3crsvint3llgnz
              </a>
            </li>
            <li>
              <strong className="text-gray-900 dark:text-gray-200">GitHub:</strong>{" "}
              <a href="https://github.com/r3crsvint3llgnz" className="text-orange-400 hover:underline" target="_blank" rel="noopener noreferrer">
                r3crsvint3llgnz
              </a>
            </li>
            <li>
              <strong className="text-gray-900 dark:text-gray-200">Support:</strong>{" "}
              <a href="https://buymeacoffee.com/sethrobinsw" className="text-orange-400 hover:underline" target="_blank" rel="noopener noreferrer">
                Buy Me a Coffee
              </a>
            </li>
          </ul>
        </section>

        <section className="border-l-4 border-orange-500 pl-4 py-2">
          <p className="text-xs text-gray-500">
            <strong className="text-gray-700 dark:text-gray-400">Disclaimer:</strong> This is a personal research project
            representing my independent views. I am employed full-time elsewhere;
            this site is not affiliated with my employer.
          </p>
        </section>
      </div>
    </div>
    </ContentWrapper>
  );
}
