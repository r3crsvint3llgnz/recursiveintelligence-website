import type { CaseStudyWorkshop } from "../../lib/identity";

export default function CaseStudySpotlight({
  study,
}: {
  study: CaseStudyWorkshop;
}) {
  return (
    <section className="ind-animate" style={{ animationDelay: "200ms" }}>
      <h2 className="ind-section-heading">Case Study</h2>

      <div className="ind-spotlight">
        <div className="relative z-10">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "var(--ind-accent-dim)" }}
          >
            Featured Engagement
          </p>
          <h3
            className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4"
            style={{ color: "var(--ind-fg-strong)" }}
          >
            {study.title}
          </h3>

          {/* Methodology callout */}
          <div
            className="rounded-lg px-5 py-4 mb-6"
            style={{
              background: "rgba(16, 185, 129, 0.06)",
              border: "1px solid rgba(16, 185, 129, 0.12)",
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: "var(--ind-accent)" }}
            >
              Methodology
            </p>
            <p
              className="text-base font-medium italic"
              style={{ color: "var(--ind-fg-strong)" }}
            >
              &ldquo;{study.methodology}&rdquo;
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: "var(--ind-muted)" }}
              >
                Role
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--ind-fg)" }}
              >
                {study.team_role}
              </p>
            </div>
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: "var(--ind-muted)" }}
              >
                Impact
              </p>
              <p
                className="text-lg font-bold"
                style={{ color: "var(--ind-accent)" }}
              >
                {study.impact}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
