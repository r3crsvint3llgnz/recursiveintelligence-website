import type { Education } from "../../lib/identity";

export default function EducationSection({
  education,
}: {
  education: Education[];
}) {
  return (
    <section className="ind-animate" style={{ animationDelay: "450ms" }}>
      <h2 className="ind-section-heading">Education</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {education.map((ed) => (
          <div key={ed.degree} className="ind-card">
            <p
              className="text-sm font-bold"
              style={{ color: "var(--ind-fg-strong)" }}
            >
              {ed.degree}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--ind-muted)" }}>
              {ed.school}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
