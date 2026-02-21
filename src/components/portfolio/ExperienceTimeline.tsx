import type { Experience, IndependentLeadership } from "../../lib/identity";

export default function ExperienceTimeline({
  experience,
  independent,
}: {
  experience: Experience[];
  independent: IndependentLeadership[];
}) {
  return (
    <section className="ind-animate" style={{ animationDelay: "300ms" }}>
      <h2 className="ind-section-heading">Professional Experience</h2>

      <div className="space-y-0">
        {experience.map((job, i) => (
          <div
            key={`${job.company}-${job.role}`}
            className="ind-timeline-item pb-8 last:pb-0"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-2">
              <h3
                className="text-base font-bold"
                style={{ color: "var(--ind-fg-strong)" }}
              >
                {job.role}
              </h3>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--ind-accent)" }}
              >
                {job.company}
              </span>
              <span className="text-xs" style={{ color: "var(--ind-muted)" }}>
                {job.period}
              </span>
            </div>
            <ul className="space-y-1.5">
              {job.highlights.map((h, j) => (
                <li
                  key={j}
                  className="text-sm leading-relaxed pl-3"
                  style={{
                    color: "var(--ind-fg)",
                    borderLeft: "1px solid var(--ind-border)",
                  }}
                >
                  {h}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Independent Leadership */}
      {independent.length > 0 && (
        <div className="mt-8">
          <h2 className="ind-section-heading">Independent Leadership</h2>
          {independent.map((org) => (
            <div key={org.organization} className="ind-timeline-item pb-6">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-2">
                <h3
                  className="text-base font-bold"
                  style={{ color: "var(--ind-fg-strong)" }}
                >
                  {org.role}
                </h3>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--ind-accent)" }}
                >
                  {org.organization}
                </span>
              </div>
              <ul className="space-y-1.5">
                {org.highlights.map((h, j) => (
                  <li
                    key={j}
                    className="text-sm leading-relaxed pl-3"
                    style={{
                      color: "var(--ind-fg)",
                      borderLeft: "1px solid var(--ind-border)",
                    }}
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
