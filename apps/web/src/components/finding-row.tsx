import { MAX_NOTE_LENGTH, roomLabels, type AiStatus, type Finding, type Resolution, type ResolveFinding } from '@movemate/contracts';
import { Trash2Icon } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import { EnlargeablePhoto } from '@/components/enlargeable-photo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type FindingRowProps = {
  finding: Finding;
  onResolve: (body: ResolveFinding) => Promise<unknown>;
  onDelete: (finding: Finding) => void;
  disabled?: boolean;
};

type Editing = 'issue' | 'custom';

const statusBadge: Record<AiStatus, { variant: 'warning' | 'secondary' | 'success'; label: string }> = {
  changed: { variant: 'warning', label: 'Changed' },
  unclear: { variant: 'secondary', label: 'Unclear' },
  looks_good: { variant: 'success', label: 'Looks the same' },
};

const resolutionBadge: Record<Resolution, { variant: 'outline' | 'success' | 'destructive' | 'default'; label: string }> = {
  pending: { variant: 'outline', label: 'Needs your answer' },
  ok: { variant: 'success', label: 'Marked OK' },
  issue: { variant: 'destructive', label: 'Marked as an issue' },
  custom: { variant: 'default', label: 'Your own answer' },
};

export function FindingRow({ finding, onResolve, onDelete, disabled }: FindingRowProps) {
  const noteId = useId();
  const errorId = `${noteId}-error`;
  const [editing, setEditing] = useState<Editing>();
  const [note, setNote] = useState(finding.userNote ?? '');
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const isUser = finding.source === 'user';
  const roomLabel = roomLabels[finding.room].toLowerCase();
  const resolution = resolutionBadge[finding.resolution];

  async function resolve(body: ResolveFinding) {
    setSaving(true);
    try {
      await onResolve(body);
      setEditing(undefined);
      setError(undefined);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not save your answer');
    } finally {
      setSaving(false);
    }
  }

  function startEditing(next: Editing) {
    setEditing(next);
    setNote(finding.userNote ?? '');
    setError(undefined);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = note.trim();
    if (editing === 'custom' && !trimmed) return setError('Write your answer first');
    if (trimmed.length > MAX_NOTE_LENGTH) return setError(`Keep it under ${MAX_NOTE_LENGTH} characters`);
    return resolve(editing === 'custom' ? { resolution: 'custom', note: trimmed } : { resolution: 'issue', ...(trimmed && { note: trimmed }) });
  }

  return (
    <li className="flex flex-col gap-3 py-4">
      <div className="flex flex-wrap items-center gap-2">
        {isUser ? (
          <Badge variant="outline">Added by you</Badge>
        ) : (
          finding.aiStatus && <Badge variant={statusBadge[finding.aiStatus].variant}>{statusBadge[finding.aiStatus].label}</Badge>
        )}
        {finding.confidence && <span className="text-sm text-muted-foreground">{finding.confidence} confidence</span>}
        {!isUser && <Badge variant={resolution.variant}>{resolution.label}</Badge>}
      </div>

      {isUser && finding.moveInPhotos.length > 0 && (
        <PhotoGroup title="Photos" photos={finding.moveInPhotos.map((photo) => ({ photo, label: `Photo of the problem in the ${roomLabel}` }))} />
      )}
      {!isUser && (
        <div className="flex flex-wrap gap-4">
          <PhotoGroup title="Before" photos={finding.beforePhotos.map((photo) => ({ photo, label: `Before photo of the ${roomLabel}` }))} />
          <PhotoGroup title="Move-in" photos={finding.moveInPhotos.map((photo) => ({ photo, label: `Move-in photo of the ${roomLabel}` }))} />
        </div>
      )}

      <p className="max-w-prose text-base">{isUser ? finding.userNote : finding.aiSummary}</p>
      {finding.checkText && <p className="text-sm text-muted-foreground">Related check: {finding.checkText}</p>}
      {!isUser && finding.userNote && finding.resolution !== 'pending' && (
        <p className="text-sm">
          <span className="text-muted-foreground">Your note: </span>
          {finding.userNote}
        </p>
      )}

      {isUser ? (
        <div>
          <Button variant="ghost" size="sm" disabled={disabled} onClick={() => onDelete(finding)}>
            <Trash2Icon data-icon="inline-start" />
            Delete
          </Button>
        </div>
      ) : (
        <div role="group" aria-label="Your answer" className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={finding.resolution === 'ok' ? 'default' : 'secondary'}
            aria-pressed={finding.resolution === 'ok'}
            disabled={disabled || saving}
            onClick={() => resolve({ resolution: 'ok' })}
          >
            Looks OK
          </Button>
          <Button
            size="sm"
            variant={finding.resolution === 'issue' ? 'default' : 'secondary'}
            aria-pressed={finding.resolution === 'issue'}
            disabled={disabled || saving}
            onClick={() => startEditing('issue')}
          >
            It is an issue
          </Button>
          <Button
            size="sm"
            variant={finding.resolution === 'custom' ? 'default' : 'secondary'}
            aria-pressed={finding.resolution === 'custom'}
            disabled={disabled || saving}
            onClick={() => startEditing('custom')}
          >
            Write my own
          </Button>
        </div>
      )}

      {editing && (
        <form onSubmit={submit} className="grid gap-2" noValidate>
          <Label htmlFor={noteId}>{editing === 'custom' ? 'Your answer' : 'Note (optional)'}</Label>
          <div className="flex gap-2">
            <Input
              id={noteId}
              value={note}
              autoFocus
              disabled={disabled || saving}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              onChange={(event) => setNote(event.target.value)}
            />
            <Button type="submit" disabled={disabled || saving}>
              {saving && <Spinner data-icon="inline-start" />}
              Save
            </Button>
            <Button type="button" variant="ghost" disabled={saving} onClick={() => setEditing(undefined)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive-text">
          {error}
        </p>
      )}
    </li>
  );
}

function PhotoGroup({ title, photos }: { title: string; photos: { photo: Finding['beforePhotos'][number]; label: string }[] }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">{title}</span>
      {photos.length === 0 ? (
        <span className="text-sm text-muted-foreground">No photo linked</span>
      ) : (
        <div className="flex gap-2">
          {photos.map(({ photo, label }) => (
            <EnlargeablePhoto key={photo.id} photo={photo} label={label} />
          ))}
        </div>
      )}
    </div>
  );
}
