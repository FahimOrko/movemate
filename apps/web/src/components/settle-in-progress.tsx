import { cn } from '@/lib/utils';

export function SettleInProgress({ chosen, total }: { chosen: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: total }, (_, index) => (
          <span key={index} className={cn('h-1.5 w-8 rounded-full motion-safe:transition-colors', index < chosen ? 'bg-primary' : 'bg-border')} />
        ))}
      </div>
      <p className="text-sm font-medium" role="status">
        {chosen} of {total} chosen
      </p>
    </div>
  );
}
