import { roomLabels, type Photo, type ReportIssue as ReportIssueData } from '@movemate/contracts';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/format';

function ReportPhotos({ title, photos, room }: { title: string; photos: Photo[]; room: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">{title}</span>
      {photos.length === 0 ? (
        <span className="text-sm text-muted-foreground">No photo linked</span>
      ) : (
        <div className="flex flex-wrap gap-3">
          {photos.map((photo) => (
            <figure key={photo.id} className="flex flex-col gap-1">
              <img src={photo.url} alt={`${title} photo of the ${room}`} className="aspect-4/3 w-48 rounded-lg border object-cover print:w-40" />
              <figcaption className="text-xs text-muted-foreground">Uploaded at {formatDateTime(photo.createdAt)}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

export function ReportIssue({ issue }: { issue: ReportIssueData }) {
  const room = roomLabels[issue.room].toLowerCase();
  return (
    <li className="flex flex-col gap-3 py-4 break-inside-avoid">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-heading">{roomLabels[issue.room]}</span>
        <Badge variant={issue.kind === 'custom' ? 'default' : 'destructive'}>{issue.kind === 'custom' ? 'Your own note' : 'Marked as an issue'}</Badge>
      </div>
      <div className="flex flex-wrap gap-4">
        <ReportPhotos title="Before" photos={issue.beforePhotos} room={room} />
        <ReportPhotos title="Move-in" photos={issue.moveInPhotos} room={room} />
      </div>
      <p className="max-w-prose text-base">{issue.text}</p>
      {issue.note && (
        <p className="text-sm">
          <span className="text-muted-foreground">Your note: </span>
          {issue.note}
        </p>
      )}
    </li>
  );
}
