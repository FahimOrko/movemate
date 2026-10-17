export function discountDuration(months: number): string {
  if (months % 12 === 0) return months === 12 ? '1 year' : `${months / 12} years`;
  return `${months} months`;
}
