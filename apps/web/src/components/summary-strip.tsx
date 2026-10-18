export type StripStat = { label: string; value: string | number };

export function SummaryStrip({ stats, label }: { stats: StripStat[]; label: string }) {
  return (
    <dl aria-label={label} className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border bg-surface p-4 sm:grid-cols-4 print:grid-cols-4 print:border-0 print:p-0">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dt className="text-sm text-muted-foreground">{stat.label}</dt>
          <dd className="text-title">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
