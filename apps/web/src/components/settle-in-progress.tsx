export function SettleInProgress({ handled, total }: { handled: number; total: number }) {
  return (
    <p className="text-sm font-medium" role="status">
      {handled} of {total} handled
    </p>
  );
}
