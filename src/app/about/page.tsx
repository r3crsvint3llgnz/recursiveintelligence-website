export const dynamic = "force-static";
export const revalidate = false;

export default function AboutPage() {
  return (
    <main className="ri-page-bg max-w-3xl mx-auto py-12 px-4">
      <h1 className="ri-heading text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
        About Recursive Intelligence
      </h1>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Vision</h2>
        <p className="text-gray-200">
          Delight customers through more human interaction, amplified by intelligent systems that create value neither could alone.
        </p>
      </section>

      <section className="ri-section space-y-2">
        <h2 className="text-2xl font-semibold">Mission</h2>
        <p className="text-gray-200">
          Translate a fast-moving AI landscape into actionable strategy and adaptive systems so people can focus on creativity and care while machines provide structure and orchestration.
        </p>
      </section>

      <section className="ri-section">
        <h2 className="text-2xl font-semibold">Core values</h2>
        <ul className="ri-list list-disc ml-6 text-gray-200 space-y-1.5 mt-2">
          <li>Clarity over hype</li>
          <li>People first, always</li>
          <li>Recursion as a practice</li>
          <li>Intelligence is emergent</li>
          <li>Teach the system to teach</li>
          <li>Thoughtful agnosticism</li>
        </ul>
      </section>

      <section className="ri-section">
        <h2 className="text-2xl font-semibold">Who this is for</h2>
        <ul className="ri-list list-disc ml-6 text-gray-200 space-y-1.5 mt-2">
          <li>Individuals and small teams who want expert guidance and fast validation</li>
          <li>Small to mid businesses exploring automation and agent workflows</li>
          <li>Education partners adopting safe, human-centered AI</li>
        </ul>
      </section>

      <section className="ri-section">
        <h2 className="text-2xl font-semibold">How we work</h2>
        <ul className="ri-list list-disc ml-6 text-gray-200 space-y-1.5 mt-2">
          <li>Start small, ship fast, measure what matters</li>
          <li>Identify a minimal, high-impact stack (no tool sprawl)</li>
          <li>Document decisions and tradeoffs so leadership stays aligned</li>
        </ul>
      </section>

      <section className="ri-section">
        <h2 className="text-2xl font-semibold">Availability & guardrails</h2>
        <ul className="ri-list list-disc ml-6 text-gray-200 space-y-1.5 mt-2">
          <li>Limited monthly capacity to preserve quality</li>
          <li>We avoid conflicts of interest between client engagements</li>
          <li>No proprietary information is shared across clients</li>
        </ul>
      </section>
    </main>
  );
}
