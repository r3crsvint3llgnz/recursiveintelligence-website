export default function SystemHealthWidget() {
  const buildTimestamp = new Date().toISOString();

  return (
    <footer
      className="mt-12 py-6 ind-animate"
      style={{
        borderTop: "1px solid var(--ind-border)",
        animationDelay: "500ms",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: System status */}
        <div className="flex items-center gap-3">
          <span className="ind-pulse" aria-hidden="true" />
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--ind-accent)" }}
          >
            System Online
          </span>
          <span className="text-xs" style={{ color: "var(--ind-muted)" }}>
            Last updated:{" "}
            <time dateTime={buildTimestamp}>
              {new Date(buildTimestamp).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
          </span>
        </div>

        {/* Right: Research pipeline link */}
        <a
          href="https://recursiveintelligence.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-medium transition-colors"
          style={{ color: "var(--ind-accent)" }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path
              fillRule="evenodd"
              d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
              clipRule="evenodd"
            />
          </svg>
          Recursive Intelligence Research Pipeline
        </a>
      </div>

      <p className="text-xs mt-4" style={{ color: "var(--ind-muted)" }}>
        © {new Date().getFullYear()} Seth Robins — Recursive Intelligence.
        Content sourced from identity.yaml.
      </p>
    </footer>
  );
}
