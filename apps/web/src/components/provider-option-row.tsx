import { CheckIcon } from 'lucide-react';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

type ProviderOptionRowProps = {
  providerKey: string;
  name: string;
  selected: boolean;
  compact?: boolean;
  onToggle: () => void;
};

// Radix radios cannot be unchecked, so the click toggles instead and arrow keys select through the same click.
export function ProviderOptionRow({ providerKey, name, selected, compact = false, onToggle }: ProviderOptionRowProps) {
  return (
    <label
      className={cn(
        'flex min-w-0 cursor-pointer items-center gap-3 rounded-xl bg-card px-4 shadow-soft ring-1 ring-border motion-safe:transition-shadow has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50 hover:bg-muted',
        compact ? 'py-2.5' : 'py-3.5',
        selected && 'ring-2 ring-primary'
      )}
    >
      <RadioGroupItem value={providerKey} onClick={onToggle} />
      <span className="min-w-0 flex-1 break-words font-medium">{name}</span>
      {selected && <CheckIcon className="size-4 shrink-0 text-primary" aria-hidden="true" />}
    </label>
  );
}
