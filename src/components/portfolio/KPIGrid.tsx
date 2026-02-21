import type { KPIItem } from "../../lib/identity";

function KPICard({ metric, label, description }: KPIItem) {
  return (
    <div className="ind-metric">
      <p
        className="text-2xl font-extrabold tracking-tight"
        style={{ color: "var(--ind-accent)" }}
      >
        {metric}
      </p>
      <p
        className="text-sm font-medium mt-1"
        style={{ color: "var(--ind-fg-strong)" }}
      >
        {label}
      </p>
      <p className="text-xs mt-1" style={{ color: "var(--ind-muted)" }}>
        {description}
      </p>
    </div>
  );
}

export default function KPIGrid({ kpi }: { kpi: KPIItem[] }) {
  return (
    <section className="ind-animate" style={{ animationDelay: "100ms" }}>
      <h2 className="ind-section-heading">Key Performance Indicators</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpi.map((item) => (
          <KPICard key={item.label} {...item} />
        ))}
      </div>
    </section>
  );
}
