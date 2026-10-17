import type { ProviderDiscount } from '@movemate/contracts';
import { CheckIcon, ExternalLinkIcon } from 'lucide-react';
import { DiscountBadge } from '@/components/discount-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

type ProviderCardProps = {
  name: string;
  highlighted?: boolean;
  url?: string | null;
  discount?: ProviderDiscount | null;
  selected?: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

export function ProviderCard({ name, highlighted = false, url = null, discount = null, selected = false, disabled = false, onSelect }: ProviderCardProps) {
  return (
    <Card variant={highlighted ? 'default' : 'surface'} size={highlighted ? 'default' : 'sm'} className={selected ? 'ring-2 ring-primary' : undefined}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {name}
          {discount && <DiscountBadge discount={discount} />}
        </CardTitle>
      </CardHeader>
      {highlighted && url && (
        <CardContent>
          <Button asChild variant="link" className="px-0">
            <a href={url} target="_blank" rel="noopener noreferrer">
              Get a quote from {name}
              <ExternalLinkIcon data-icon="inline-end" />
            </a>
          </Button>
        </CardContent>
      )}
      <CardFooter>
        <Button variant={selected ? 'default' : 'secondary'} size="sm" aria-pressed={selected} disabled={disabled} onClick={onSelect}>
          {selected && <CheckIcon data-icon="inline-start" />}
          {selected ? 'Selected' : 'Select'}
          <span className="sr-only"> {name}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
