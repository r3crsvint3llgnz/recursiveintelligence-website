/*
  Homepage — editorial grid layout.
  Static only: no data fetching, no async, no <main> wrapper.
*/
import Link from "next/link";
import ValueProp from "../components/ValueProp";
import ResearchApplied from "../components/ResearchApplied";

export default function Page() {
  return (
    <div className="ri-grid-editorial py-8">

      {/* Hero row: flat typographic (60%) + secondary glass stack (40%) */}
      <div className="grid lg:grid-cols-[3fr_2fr] gap-8 items-center min-h-[45vh] py-8">

        {/* Hero — flat, no card background */}
        <div>
          <span className="ri-category-label mb-3 block">Featured</span>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] font-space-grotesk mb-5">
            Stop Being an AI User.<br />
            Become an AI Architect.
          </h1>
          <p className="text-lg text-[color:var(--ri-muted)] leading-relaxed max-w-prose mb-2">
            Research keeps confirming the same pattern: passive AI use atrophies
            the thinking it replaces. I&apos;ve been building cognitive scaffolding
            tools my entire life as a neurodivergent thinker. AI is just the new
            terrain.
          </p>
          <p className="text-sm text-[color:var(--ri-muted)] mb-8">
            Frameworks, briefs, and the Recursive Prompting Handbook.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://store.recursiveintelligence.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-base font-semibold bg-[color:var(--ri-accent)] text-black hover:bg-[color:var(--ri-accent-700)] transition-colors"
              aria-label="Get the Recursive Prompting Handbook"
            >
              Get the Handbook
            </a>
            <Link
              href="/briefs"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-base font-semibold border border-[color:var(--ri-accent)]/60 text-[color:var(--ri-accent)] hover:border-[color:var(--ri-accent)] hover:bg-[rgba(255,102,0,0.08)] transition-colors"
            >
              Latest Brief
            </Link>
          </div>
        </div>

        {/* Secondary stack — glass cards */}
        <div className="flex flex-col gap-4">
          <div className="glass p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="ri-category-label">Briefs</span>
              <span className="ri-live-badge">live</span>
            </div>
            <h3 className="text-lg font-bold mb-1">AI/ML Briefs</h3>
            <p className="text-sm text-[color:var(--ri-muted)] mb-4">
              Twice-daily synthesis from ~50 sources — autonomous agent, AM and PM runs.
            </p>
            <Link href="/briefs" className="ri-link text-sm">
              View briefs →
            </Link>
          </div>

          <div className="glass p-5">
            <span className="ri-category-label mb-3 block">Reading</span>
            <h3 className="text-lg font-bold mb-1">AI/ML Feed</h3>
            <p className="text-sm text-[color:var(--ri-muted)] mb-4">
              The intake pipeline — what goes into the briefs.
            </p>
            <Link href="/reading-list" className="ri-link text-sm">
              Browse feed →
            </Link>
          </div>
        </div>
      </div>

      {/* Bold stripe divider */}
      <div className="ri-stripe-bold my-2" aria-hidden="true" />

      {/* 3-col secondary grid */}
      <div className="grid md:grid-cols-3 gap-4 py-8">
        <div className="glass p-5">
          <span className="ri-category-label mb-3 block">Dispatches</span>
          <h3 className="text-lg font-bold mb-2">Field Reports</h3>
          <p className="text-sm text-[color:var(--ri-muted)] mb-4">
            Applied cognitive science, industrial AI, and methodology from practice.
          </p>
          <Link href="/blog" className="ri-link text-sm">
            Read dispatches →
          </Link>
        </div>

        <div className="glass p-5">
          <span className="ri-category-label mb-3 block">Garden</span>
          <h3 className="text-lg font-bold mb-2">Recursive Garden</h3>
          <p className="text-sm text-[color:var(--ri-muted)] mb-4">
            Notes, experiments, and thinking in progress.
          </p>
          <a
            href="https://recursiveintelligence.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="ri-link text-sm"
          >
            Enter the Garden →
          </a>
        </div>

        <div className="glass p-5">
          <span className="ri-category-label mb-3 block">Follow</span>
          <h3 className="text-lg font-bold mb-2">Substack</h3>
          <p className="text-sm text-[color:var(--ri-muted)] mb-4">
            Articles, methodology updates, and thinking in progress — delivered directly.
          </p>
          <a
            href="https://substack.recursiveintelligence.io"
            target="_blank"
            rel="noopener noreferrer"
            className="ri-link text-sm"
          >
            Follow on Substack →
          </a>
        </div>
      </div>

      {/* Section marker: Methodology */}
      <div className="ri-section-marker">
        <span className="ri-section-marker-label">{'// Methodology'}</span>
      </div>
      <ValueProp />

      {/* Section marker: Research Applied */}
      <div className="ri-section-marker">
        <span className="ri-section-marker-label">{'// Research Applied'}</span>
      </div>
      <ResearchApplied />

    </div>
  );
}
