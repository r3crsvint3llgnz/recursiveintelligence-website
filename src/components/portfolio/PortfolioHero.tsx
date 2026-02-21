import type { Identity } from "../../lib/identity";

export default function PortfolioHero({ data }: { data: Identity }) {
  const { name, label, location, summary } = data.basics;

  return (
    <section className="py-12 ind-animate">
      <div className="flex flex-col gap-1 mb-6">
        <p className="ind-section-heading !border-0 !mb-0 !pb-0">
          Industrial AI Portfolio
        </p>
        <h1
          className="text-4xl md:text-5xl font-extrabold tracking-tight"
          style={{ color: "var(--ind-fg-strong)" }}
        >
          {name}
        </h1>
        <p
          className="text-lg md:text-xl font-medium mt-1"
          style={{ color: "var(--ind-accent)" }}
        >
          {label}
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--ind-muted)" }}>
          📍 {location}
        </p>
      </div>

      <p
        className="text-base leading-relaxed max-w-2xl"
        style={{ color: "var(--ind-fg)" }}
      >
        {summary}
      </p>

      <div className="flex flex-wrap gap-3 mt-8">
        <a
          href="/api/resume-pdf"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-colors"
          style={{
            background: "var(--ind-accent)",
            color: "var(--ind-bg)",
          }}
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
            <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
          </svg>
          Download Resume (PDF)
        </a>
        <a
          href={`mailto:${data.basics.email}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-colors border"
          style={{
            borderColor: "var(--ind-accent)",
            color: "var(--ind-accent)",
          }}
        >
          Contact
        </a>
      </div>
    </section>
  );
}
