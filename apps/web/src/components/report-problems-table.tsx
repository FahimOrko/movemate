import { roomLabels, type ReportRoom } from '@movemate/contracts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { problemParts } from '@/lib/report-problem';
import { roomSectionId } from '@/lib/room-section-id';

export function ReportProblemsTable({ rooms }: { rooms: ReportRoom[] }) {
  const rows = rooms.flatMap((room) => room.problems.map((problem) => ({ room: room.room, problem })));
  if (rows.length === 0) return <p className="text-muted-foreground">No problems recorded.</p>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Room</TableHead>
          <TableHead>Problem</TableHead>
          <TableHead className="text-right">Photos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ room, problem }) => (
          <TableRow key={problem.findingId} className="break-inside-avoid">
            <TableCell className="align-top font-medium">
              <a href={`#${roomSectionId(room)}`} className="rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 print:no-underline">
                {roomLabels[room]}
              </a>
            </TableCell>
            <TableCell className="whitespace-normal">{problemParts(problem).lead}</TableCell>
            <TableCell className="text-right align-top">{problem.beforePhotos.length + problem.moveInPhotos.length}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
