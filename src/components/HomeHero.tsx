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
        Practical AI Methodology Meets Cognitive Science
      </p>
      <p
        className="ri-fade-up mt-4 text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed"
        style={{ animationDelay: "160ms" }}
      >
        Turning peer-reviewed research into frameworks for human-AI collaboration
        that enhance thinking rather than replace it.
      </p>
      <p
        className="ri-fade-up mt-2 text-base text-gray-400"
        style={{ animationDelay: "240ms" }}
      >
        Tools and weekly implementation guides.
      </p>
      <div
        className="ri-fade-up flex flex-col sm:flex-row gap-3 mt-8"
        style={{ animationDelay: "320ms" }}
      >
        <a
          href="https://recursiveintelligence.substack.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-3 rounded-md text-base font-semibold bg-[color:var(--ri-accent)] text-black hover:bg-[color:var(--ri-accent-700)] transition-colors"
        >
          Subscribe to Newsletter
        </a>
        <a
          href="https://github.com/r3crsvint3llgnz/recursive-prompting"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-3 rounded-md text-base font-semibold border-2 border-[color:var(--ri-accent)] text-[color:var(--ri-accent)] hover:bg-[color:var(--ri-accent)] hover:text-black transition-colors"
        >
          View Research
        </a>
      </div>
    </section>
  );
}
