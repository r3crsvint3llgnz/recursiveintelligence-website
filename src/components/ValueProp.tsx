export default function ValueProp() {
  return (
    <section className="py-10 space-y-5">
      <h2 className="text-3xl font-bold text-[color:var(--ri-fg)]">
        What I Do
      </h2>
      <p className="text-base text-[color:var(--ri-muted)] leading-relaxed">
        Practical frameworks from real research — cognitive science, neuroscience,
        and AI — built to be used immediately, not archived.
      </p>
      <div className="glass space-y-3">
        <p className="text-[color:var(--ri-accent)] font-medium">
          → No theory without practice.
        </p>
        <p className="text-[color:var(--ri-accent)] font-medium">
          → No recommendations without evidence.
        </p>
        <p className="text-[color:var(--ri-accent)] font-medium">
          → No tools without teaching you why they work.
        </p>
      </div>
    </section>
  );
}
