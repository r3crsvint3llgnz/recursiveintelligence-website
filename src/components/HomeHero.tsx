import Link from 'next/link';

export default function HomeHero() {
  return (
    <section className="ri-hero min-h-[45vh] flex flex-col justify-center max-w-3xl mx-auto py-12 px-4">
      <h1
        className="ri-heading ri-fade-up text-5xl md:text-6xl font-extrabold tracking-tight leading-tight"
        style={{ animationDelay: "0ms" }}
      >
        Recursive Intelligence
      </h1>
      <p
        className="ri-fade-up mt-4 text-2xl md:text-3xl font-normal text-[color:var(--ri-fg)] opacity-90"
        style={{ animationDelay: "80ms" }}
      >
        Stop Being an AI User. Become an AI Architect.
      </p>
      <p
        className="ri-fade-up mt-4 text-lg md:text-xl text-gray-900 dark:text-gray-300 max-w-2xl leading-relaxed"
        style={{ animationDelay: "160ms" }}
      >
        Research keeps confirming the same pattern: passive AI use atrophies
        the thinking it replaces. I&apos;ve been building cognitive scaffolding
        tools my entire life as a neurodivergent thinker. AI is just the new
        terrain. I teach you to use it as a thinking partner, not a thinking
        replacement.
      </p>
      <p
        className="ri-fade-up mt-2 text-base text-gray-800 dark:text-gray-400"
        style={{ animationDelay: "240ms" }}
      >
        Frameworks, briefs, and the Recursive Prompting Handbook.
      </p>
      <div
        className="ri-fade-up flex flex-col sm:flex-row gap-3 mt-8"
        style={{ animationDelay: "320ms" }}
      >
        <a
          href="https://store.recursiveintelligence.io"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-3 rounded-md text-base font-semibold bg-[color:var(--ri-accent)] text-black hover:bg-[color:var(--ri-accent-700)] transition-colors"
          aria-label="Get the Recursive Prompting Handbook from the store"
        >
          Get the Handbook
        </a>
        <Link
          href="/briefs"
          className="inline-flex items-center justify-center px-6 py-3 rounded-md text-base font-semibold border-2 border-[color:var(--ri-accent)] text-[color:var(--ri-accent)] hover:bg-[color:var(--ri-accent)] hover:text-black transition-colors"
          aria-label="Read the latest AI/ML research brief"
        >
          Read Latest Brief
        </Link>
        <Link
          href="/reading-list"
          className="inline-flex items-center justify-center px-6 py-3 rounded-md text-base font-semibold border-2 border-[color:var(--ri-accent)] text-[color:var(--ri-accent)] hover:bg-[color:var(--ri-accent)] hover:text-black transition-colors"
          aria-label="Browse the AI/ML intake feed"
        >
          AI/ML Feed
        </Link>
      </div>
    </section>
  );
}
