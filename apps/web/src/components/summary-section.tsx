import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SummarySectionProps = { id: string; title: string; children: ReactNode };

/** Titled card used for each Summary section. Print drops the card chrome. */
export function SummarySection({ id, title, children }: SummarySectionProps) {
  return (
    <Card aria-labelledby={id} role="region" className="break-inside-avoid-page print:rounded-none print:py-0 print:shadow-none">
      <CardHeader>
        <CardTitle id={id} className="text-heading">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">{children}</CardContent>
    </Card>
  );
}
