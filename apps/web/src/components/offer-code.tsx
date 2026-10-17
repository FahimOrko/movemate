import type { ProviderDiscount } from '@movemate/contracts';
import { CopyCodeButton } from '@/components/discount-badge';
import { discountDuration } from '@/lib/discount';

type OfferCodeProps = { discount: ProviderDiscount; defaultCopied?: boolean };

export function OfferCode({ discount, defaultCopied = false }: OfferCodeProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-muted p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium">
          {discount.percent}% off for {discountDuration(discount.durationMonths)}
        </p>
        <p className="text-sm text-muted-foreground">MoveMate offer. Use this code when you get your quote.</p>
      </div>
      <div className="flex items-center gap-2">
        <code className="rounded-md bg-background px-2.5 py-1.5 font-mono text-sm">{discount.code}</code>
        <CopyCodeButton code={discount.code} defaultCopied={defaultCopied} />
      </div>
    </div>
  );
}
