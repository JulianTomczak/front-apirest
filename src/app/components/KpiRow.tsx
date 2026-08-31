export type KpiTone = "primary" | "warning" | "success" | "muted";

export interface KpiItem {
  value: string | number;
  label: string;
  hint?: string;
  tone?: KpiTone;
}

interface KpiRowProps {
  items: KpiItem[];
}

export default function KpiRow({ items }: KpiRowProps) {
  return (
    <div className="kpi-row">
      {items.map((item, i) => (
        <div className="kpi-card" key={i}>
          <span className={`kpi-value kpi-value--${item.tone ?? "muted"}`}>{item.value}</span>
          <span className="kpi-label">{item.label}</span>
          {item.hint && <span className="kpi-hint">{item.hint}</span>}
        </div>
      ))}
    </div>
  );
}
