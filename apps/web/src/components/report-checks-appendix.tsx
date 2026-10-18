import { checkAnswerLabels, roomLabels, type ReportRoom } from '@movemate/contracts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function ReportChecksAppendix({ rooms }: { rooms: ReportRoom[] }) {
  const withChecks = rooms.filter((room) => room.checks.length > 0);
  if (withChecks.length === 0) return null;
  return (
    <section aria-labelledby="checks-appendix-title" className="flex flex-col gap-4 border-t pt-6">
      <h2 id="checks-appendix-title" className="text-heading">
        Appendix: Room checks
      </h2>
      {withChecks.map((room) => (
        <div key={room.room} className="break-inside-avoid">
          <h3 className="font-medium">{roomLabels[room.room]}</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Check</TableHead>
                <TableHead className="w-32">Answer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {room.checks.map((check) => (
                <TableRow key={check.checkId}>
                  <TableCell className="whitespace-normal">{check.text}</TableCell>
                  <TableCell className="text-muted-foreground">{checkAnswerLabels[check.status]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </section>
  );
}
