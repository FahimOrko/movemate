import { DownloadIcon, FileTextIcon } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/** Always visible: sticky on desktop, first on mobile. Never printed. */
export function SummaryActions({ reportPrintHref }: { reportPrintHref: string }) {
  return (
    <Card aria-labelledby="summary-actions-title" role="region" className="print:hidden lg:sticky lg:top-6 lg:w-72">
      <CardHeader>
        <CardTitle id="summary-actions-title" className="text-heading">
          Download
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button asChild size="lg">
          <Link to={reportPrintHref}>
            <FileTextIcon data-icon="inline-start" />
            Download report (PDF)
          </Link>
        </Button>
        <Button size="lg" variant="secondary" onClick={() => window.print()}>
          <DownloadIcon data-icon="inline-start" />
          Download summary (PDF)
        </Button>
        <p className="text-sm text-muted-foreground">Opens your browser&apos;s save dialog.</p>
      </CardContent>
    </Card>
  );
}
