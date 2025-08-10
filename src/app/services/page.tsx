export const dynamic = "force-static";
export const revalidate = false;

export default function ServicesPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
        Services Overview
      </h1>

      <p className="text-lg text-gray-200">
        Recursive Intelligence offers human-first AI consulting. We translate a fast-moving AI landscape
        into a minimal, high-impact stack that serves people and delights customers.
      </p>

      <hr className="my-8 border-white/10" />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Advisory</h2>
        <ul className="list-disc ml-6 text-gray-200">
          <li>Readiness and risk review</li>
          <li>Use-case discovery and scoping</li>
          <li>Vendor-neutral evaluation and due diligence</li>
        </ul>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-2xl font-semibold">Architect (lightweight)</h2>
        <ul className="list-disc ml-6 text-gray-200">
          <li>AI productivity systems and knowledge ops</li>
          <li>Agent workflows with human-in-the-loop</li>
          <li>Small prototypes that prove value before big bets</li>
          <li>Telemetry so we can measure impact</li>
        </ul>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-2xl font-semibold">Education</h2>
        <ul className="list-disc ml-6 text-gray-200">
          <li>Practical PD for teachers and staff</li>
          <li>Classroom and campus workflows that protect students</li>
          <li>Policy and guardrails that actually help</li>
        </ul>
      </section>

      <section className="space-y-3 mt-10">
        <h2 className="text-2xl font-semibold">Pricing</h2>
        <p className="text-gray-200">$250/hour for advisory and build.</p>
        <p className="text-gray-400">
          Retainers available for ongoing guidance. Pilot discounts for feedback and testimonial.
        </p>
      </section>
    </main>
  );
}
