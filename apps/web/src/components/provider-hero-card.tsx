import type { ProviderDiscount } from '@movemate/contracts';
import { CalendarCheckIcon, CheckIcon, DropletsIcon, ExternalLinkIcon, ShieldCheckIcon } from 'lucide-react';
import { OfferCode } from '@/components/offer-code';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const points = [
  { icon: ShieldCheckIcon, text: 'A landlord’s insurance is usually for the building, not your belongings.' },
  { icon: DropletsIcon, text: 'Home insurance can help with things like fire, water damage or theft. Check what your policy covers.' },
  { icon: CalendarCheckIcon, text: 'Arrange it before your first night, and check when the cover starts.' },
];

type ProviderHeroCardProps = {
  name: string;
  explainerTitle: string;
  url?: string | null;
  discount?: ProviderDiscount | null;
  selected?: boolean;
  defaultCopied?: boolean;
  onSelect: () => void;
};

export function ProviderHeroCard({ name, explainerTitle, url = null, discount = null, selected = false, defaultCopied = false, onSelect }: ProviderHeroCardProps) {
  return (
    <Card className={cn('[--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]', selected && 'ring-2 ring-primary')}>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
          {name}
          <Badge variant="secondary">Recommended</Badge>
          {selected && <CheckIcon className="size-5 text-primary" aria-label="Selected" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {discount && <OfferCode discount={discount} defaultCopied={defaultCopied} />}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">{explainerTitle}</h3>
          <ul className="flex flex-col gap-3">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-muted-foreground">
                <Icon className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden="true" />
                <span className="min-w-0">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {url && (
            <Button asChild size="lg">
              <a href={url} target="_blank" rel="noopener noreferrer">
                Get a quote from {name}
                <ExternalLinkIcon data-icon="inline-end" />
              </a>
            </Button>
          )}
          <Button size="lg" variant="secondary" aria-pressed={selected} onClick={onSelect}>
            {selected && <CheckIcon data-icon="inline-start" />}
            {selected ? 'Selected' : `Select ${name}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
