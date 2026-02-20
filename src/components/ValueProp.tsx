export default function ValueProp() {
  return (
    <section className="py-12 space-y-6">
      <h2 className="text-3xl font-bold text-[color:var(--ri-fg)]">
        What I Do
      </h2>

      <div className="space-y-4">
        <p className="text-xl font-light text-gray-900 dark:text-gray-300">
          Most people missed what the MIT brain study actually proved.
        </p>
        <p className="text-xl font-light text-gray-900 dark:text-gray-300">I didn&apos;t.</p>

        <p className="text-base text-gray-800 dark:text-gray-400 leading-relaxed">
          I take research from cognitive science, neuroscience, and AI—the
          studies everyone&apos;s arguing about but few understand—and build
          practical frameworks you can use immediately.
        </p>

        <div className="glass mt-6 space-y-3">
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
      </div>
    </section>
  );
}
