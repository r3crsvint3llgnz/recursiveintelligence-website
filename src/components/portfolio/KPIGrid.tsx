import type { KPI } from "../../lib/identity";

interface KPICardProps {
  value: string;
  label: string;
  subtext?: string;
}

function KPICard({ value, label, subtext }: KPICardProps) {
  // Extract the leading metric (e.g. "€4M", "6,000+", "$6M")
  const metricMatch = value.match(/^([€$]?[\d,.]+[MBK+%]*)/);
  const metric = metricMatch ? metricMatch[1] : "";
  const description = metricMatch ? value.slice(metric.length).trim() : value;

  return (
    <div className="ind-metric">
      <p
        className="text-2xl font-extrabold tracking-tight"
        style={{ color: "var(--ind-accent)" }}
      >
        {metric || "→"}
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
      {subtext && (
        <p
          className="text-xs mt-2 italic"
          style={{ color: "var(--ind-accent-dim)" }}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}

export default function KPIGrid({ kpi }: { kpi: KPI }) {
  return (
    <section className="ind-animate" style={{ animationDelay: "100ms" }}>
      <h2 className="ind-section-heading">Key Performance Indicators</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          value={kpi.realized_ebitda}
          label="Realized EBITDA Impact"
          subtext="Architectural Enablement — enabled through cross-functional team coordination"
        />
        <KPICard
          value={kpi.targeted_ebitda}
          label="Targeted EBITDA Pipeline"
          subtext="Architectural Enablement — cross-functional agentic systems & AI optimization"
        />
        <KPICard
          value={kpi.peak_adoption}
          label="Peak Adoption"
        />
        <KPICard
          value={kpi.workshop_roi}
          label="Workshop ROI"
        />
        <KPICard
          value={kpi.user_growth}
          label="User Growth"
        />
      </div>
    </section>
  );
}
