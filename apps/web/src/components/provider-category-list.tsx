import type { Provider } from '@movemate/contracts';
import { ExternalLinkIcon, HandshakeIcon } from 'lucide-react';
import { DiscountBadge } from '@/components/discount-badge';
import { ProviderRow } from '@/components/provider-row';
import { Badge } from '@/components/ui/badge';
import { RadioGroup } from '@/components/ui/radio-group';

const NOT_NEEDED = 'not-needed';

export type ProviderOption = Pick<Provider, 'key' | 'name'> & Partial<Pick<Provider, 'url' | 'discount'>> & { tag?: string };

type ProviderCategoryListProps = {
  label: string;
  options: ProviderOption[];
  selectedKey: string | null;
  notNeeded: boolean;
  onChoose: (providerKey: string) => void;
  onToggleNotNeeded: () => void;
};

export function ProviderCategoryList({ label, options, selectedKey, notNeeded, onChoose, onToggleNotNeeded }: ProviderCategoryListProps) {
  const value = selectedKey ?? (notNeeded ? NOT_NEEDED : '');
  return (
    <RadioGroup aria-label={label} value={value} className="gap-0 divide-y overflow-hidden rounded-xl border">
      {options.map((option) => (
        <ProviderRow
          key={option.key}
          value={option.key}
          name={option.name}
          selected={value === option.key}
          badge={
            (option.tag || option.discount) && (
              <>
                {option.tag && (
                  <Badge variant="secondary">
                    <HandshakeIcon aria-hidden="true" />
                    {option.tag}
                  </Badge>
                )}
                {option.discount && <DiscountBadge discount={option.discount} />}
              </>
            )
          }
          trailing={
            option.url && (
              <a
                href={option.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Get a quote<span className="sr-only"> from {option.name}, opens in a new tab</span>
                <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
              </a>
            )
          }
          onToggle={() => onChoose(option.key)}
        />
      ))}
      <ProviderRow value={NOT_NEEDED} name="Not needed (N/A)" muted selected={value === NOT_NEEDED} onToggle={onToggleNotNeeded} />
    </RadioGroup>
  );
}
