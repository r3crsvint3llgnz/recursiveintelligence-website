const research = [
  {
    title: "MIT's ChatGPT brain connectivity study (2025)",
    description: "Translating findings into Recursive Prompting methodology",
  },
  {
    title: "Neurodivergent AI interaction patterns",
    description: "Building frameworks for cognitive scaffolding",
  },
  {
    title: "Cognitive load and integration overhead",
    description: "Creating tools to maintain executive function during AI collaboration",
  },
  {
    title: "Executive function preservation in AI workflows",
    description: "Developing templates that enhance rather than replace thinking",
  },
];

export default function ResearchApplied() {
  return (
    <section className="py-12 space-y-8">
      <h2 className="text-3xl font-bold text-[color:var(--ri-fg)]">
        Recent Research Applied
      </h2>

      <ul className="space-y-4">
        {research.map((item) => (
          <li
            key={item.title}
            className="glass border-l-4 border-[color:var(--ri-accent)]"
          >
            <h3 className="text-lg font-semibold text-[color:var(--ri-fg)] mb-1">
              {item.title}
            </h3>
            <p className="text-gray-800 dark:text-gray-400 text-sm">{item.description}</p>
          </li>
        ))}
      </ul>

      <div className="space-y-1 pt-4">
        <p className="text-base italic text-gray-800 dark:text-gray-400">
          Each study becomes a practical framework.
        </p>
        <p className="text-base italic text-gray-800 dark:text-gray-400">
          Each framework becomes a tool you can use.
        </p>
      </div>
    </section>
  );
}
