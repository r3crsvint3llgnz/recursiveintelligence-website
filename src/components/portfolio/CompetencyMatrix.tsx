import type { CoreCompetencies } from "../../lib/identity";

interface ColumnProps {
  title: string;
  items: string[];
}

function CompetencyColumn({ title, items }: ColumnProps) {
  return (
    <div className="ind-card">
      <h3
        className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: "var(--ind-accent)" }}
      >
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="ind-tag">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CompetencyMatrix({
  competencies,
}: {
  competencies: CoreCompetencies;
}) {
  return (
    <section className="ind-animate" style={{ animationDelay: "400ms" }}>
      <h2 className="ind-section-heading">Core Competencies</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CompetencyColumn
          title="Industrial Stack"
          items={competencies.industrial_stack}
        />
        <CompetencyColumn
          title="Systems Architecture"
          items={competencies.systems_architecture}
        />
        <CompetencyColumn
          title="Data Governance"
          items={competencies.data_governance}
        />
      </div>
    </section>
  );
}
