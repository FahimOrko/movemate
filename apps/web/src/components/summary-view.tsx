import type { ProviderCategory, ProviderDiscount, ReportSummary } from '@movemate/contracts';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import { providerCategoryLabels } from '@/lib/provider-categories';

export type ChosenProvider = { category: ProviderCategory; name: string; discount: ProviderDiscount | null };

type SummaryViewProps = { summary: ReportSummary; chosen: ChosenProvider[]; reportHref: string };

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-title">{value}</dd>
    </div>
  );
}

export function SummaryView({ summary, chosen, reportHref }: SummaryViewProps) {
  return (
    <article aria-labelledby="summary-title" className="flex flex-col gap-8">
      <header>
        <h1 id="summary-title" className="text-title">
          Your move, summed up
        </h1>
        <p className="mt-2 text-base">{summary.address}</p>
        {summary.moveDate && <p className="text-sm text-muted-foreground">Move date {formatDate(summary.moveDate)}</p>}
      </header>

      <Card variant="surface">
        <CardHeader>
          <CardTitle>Move-in report</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Rooms documented" value={summary.roomsDocumented} />
            <Stat label="OK" value={summary.counts.ok} />
            <Stat label="Issues" value={summary.counts.issues} />
            <Stat label="Your own notes" value={summary.counts.custom} />
          </dl>
          <Link to={reportHref} className="w-fit text-primary underline underline-offset-4 print:hidden">
            Open the saved report
          </Link>
        </CardContent>
      </Card>

      {summary.watchListDueDate && (
        <section aria-labelledby="watch-title">
          <h2 id="watch-title" className="text-heading">
            30-day watch list
          </h2>
          <p className="mt-2 text-muted-foreground">Check your watch list items by {formatDate(summary.watchListDueDate)}.</p>
        </section>
      )}

      <section aria-labelledby="providers-title">
        <h2 id="providers-title" className="text-heading">
          Your providers
        </h2>
        {chosen.length === 0 ? (
          <p className="mt-2 text-muted-foreground">You have not chosen any providers.</p>
        ) : (
          <ul className="mt-2 divide-y">
            {chosen.map(({ category, name, discount }) => (
              <li key={category} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <span className="text-muted-foreground">{providerCategoryLabels[category]}</span>
                <span>
                  {name}
                  {discount && <span className="ml-2 text-sm text-muted-foreground">Discount code {discount.code}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-heading">Your move is documented and your next steps are set. Welcome home.</p>
    </article>
  );
}
