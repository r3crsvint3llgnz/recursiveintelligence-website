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
        className="ri-fade-up mt-6 text-xl md:text-2xl text-gray-200"
        style={{ animationDelay: "120ms" }}
      >
        Exploring AI, systems thinking, and philosophy of mind.
      </p>
      <p
        className="ri-fade-up mt-2 text-lg text-gray-400"
        style={{ animationDelay: "240ms" }}
      >
        Learning in public through experiments, briefs, and research.
      </p>
    </section>
  );
}
