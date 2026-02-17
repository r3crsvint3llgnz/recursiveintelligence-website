import { genPageMetadata } from '../seo'

export const metadata = genPageMetadata({
  title: 'About',
  description:
    'Seth Robins — exploring AI, systems thinking, and philosophy of mind.',
})

export const dynamic = "force-static";
export const revalidate = false;

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">About</h1>

      <div className="space-y-10 text-gray-200">
        <p className="text-xl">
          I&apos;m Seth Robins. I explore how intelligence emerges from systems —
          in AI, in minds, in organizations.
        </p>

        <section>
          <h2 className="text-2xl font-bold mb-4">What You&apos;ll Find Here</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Original Research &amp; Writing</h3>
              <p className="text-gray-400 text-sm">
                Long-form articles exploring AI systems, philosophy of mind, and
                industrial intelligence. I publish as ideas develop.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">AI/ML Briefs</h3>
              <p className="text-gray-400 text-sm">
                Twice-daily curated research summaries. An automated system
                analyzes ~50 AI/ML articles every 12 hours and generates
                synthesized briefs.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">AWS Experiments</h3>
              <p className="text-gray-400 text-sm">
                Projects I&apos;m building to explore ideas — agent frameworks,
                industrial automation prototypes, and research tools.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">The Recursive Garden</h3>
              <p className="text-gray-400 text-sm">
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

        <section>
          <h2 className="text-2xl font-bold mb-4">Why This Exists</h2>
          <p className="text-gray-400 mb-3">
            This is <strong className="text-gray-200">learning in public</strong>. I&apos;m an autistic systems
            thinker with a full-time job elsewhere, and this is my independent
            research platform.
          </p>
          <p className="text-gray-400">
            Revenue from small digital products and support helps fund AWS costs
            for experiments, new hardware for AI research, time to develop open
            tools, and the knowledge infrastructure I&apos;m building.
          </p>
          <p className="text-gray-500 text-sm mt-3">Think of it as a self-sustaining research lab.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Connect</h2>
          <ul className="space-y-2 text-gray-400">
            <li>
              <strong className="text-gray-200">Digital Garden:</strong>{" "}
              <a href="https://recursiveintelligence.xyz" className="text-orange-400 hover:underline">
                recursiveintelligence.xyz
              </a>
            </li>
            <li>
              <strong className="text-gray-200">Substack:</strong>{" "}
              <a href="https://substack.com/@r3crsvint3llgnz" className="text-orange-400 hover:underline">
                @r3crsvint3llgnz
              </a>
            </li>
            <li>
              <strong className="text-gray-200">Mastodon:</strong>{" "}
              <a
                href="https://hachyderm.io/@r3crsvint3llgnz"
                className="text-orange-400 hover:underline"
                rel="me"
              >
                @r3crsvint3llgnz
              </a>
            </li>
            <li>
              <strong className="text-gray-200">GitHub:</strong>{" "}
              <a href="https://github.com/r3crsvint3llgnz" className="text-orange-400 hover:underline">
                r3crsvint3llgnz
              </a>
            </li>
            <li>
              <strong className="text-gray-200">Support:</strong>{" "}
              <a href="https://buymeacoffee.com/sethrobinsw" className="text-orange-400 hover:underline">
                Buy Me a Coffee
              </a>
            </li>
          </ul>
        </section>

        <section className="border-l-4 border-orange-500 pl-4 py-2">
          <p className="text-xs text-gray-500">
            <strong className="text-gray-400">Disclaimer:</strong> This is a personal research project
            representing my independent views. I am employed full-time elsewhere;
            this site is not affiliated with my employer.
          </p>
        </section>
      </div>
    </main>
  );
}
