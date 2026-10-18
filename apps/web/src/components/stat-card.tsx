export type StatCardProps = { label: string; value: string | number };

/** One figure with its label. Render inside a `dl`. */
export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-surface p-4 print:p-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-title">{value}</dd>
    </div>
  );
}
