import type { ReactNode } from 'react';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

type ProviderRowProps = {
  value: string;
  name: string;
  selected: boolean;
  muted?: boolean;
  /** Sits next to the name and wraps under it when short of space. */
  badge?: ReactNode;
  /** Quiet content aligned to the right edge. */
  trailing?: ReactNode;
  onToggle: () => void;
};

// Radix radios cannot be unchecked, so the click toggles instead and arrow keys select through the same click.
export function ProviderRow({ value, name, selected, muted = false, badge, trailing, onToggle }: ProviderRowProps) {
  return (
    <label
      className={cn(
        'flex min-h-14 min-w-0 cursor-pointer items-center gap-3 px-4 py-2 hover:bg-muted/50 motion-safe:transition-colors has-[:focus-visible]:bg-muted/50',
        selected && 'bg-primary/5 hover:bg-primary/5'
      )}
    >
      <RadioGroupItem value={value} onClick={onToggle} />
      <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <span className={cn('break-words', muted ? 'text-muted-foreground' : 'font-medium')}>{name}</span>
        {badge}
      </span>
      {trailing && <span className="ml-auto shrink-0">{trailing}</span>}
    </label>
  );
}
