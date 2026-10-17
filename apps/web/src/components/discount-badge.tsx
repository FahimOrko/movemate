import type { ProviderDiscount } from '@movemate/contracts';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const COPIED_MS = 2000;
const HOVER_CLOSE_MS = 150;

function discountDuration(months: number): string {
  if (months % 12 === 0) return months === 12 ? '1 year' : `${months / 12} years`;
  return `${months} months`;
}

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(undefined);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
  }

  return (
    <Button size="sm" variant="secondary" onClick={() => void copy()}>
      {copied ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
    </Button>
  );
}

type DiscountBadgeProps = { discount: ProviderDiscount; defaultOpen?: boolean };

export function DiscountBadge({ discount, defaultOpen = false }: DiscountBadgeProps) {
  const [open, setOpen] = useState(defaultOpen);
  const closeTimer = useRef<number>(undefined);

  const show = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hideSoon = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), HOVER_CLOSE_MS);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="rounded-4xl outline-none" onMouseEnter={show} onMouseLeave={hideSoon} onFocus={show} aria-label={`${discount.percent}% off, show discount code`}>
          <Badge variant="success">{discount.percent}% off</Badge>
        </button>
      </PopoverTrigger>
      <PopoverContent onMouseEnter={show} onMouseLeave={hideSoon} onOpenAutoFocus={(event) => event.preventDefault()}>
        <p>
          MoveMate users get {discount.percent}% off for {discountDuration(discount.durationMonths)}
        </p>
        <div className="flex items-center justify-between gap-3">
          <code className="rounded-md bg-muted px-2 py-1 font-mono text-sm">{discount.code}</code>
          <CopyCodeButton code={discount.code} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
