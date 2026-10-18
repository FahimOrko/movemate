import { MAX_NOTE_LENGTH, type Photo, type RoomCheck, type RoomCheckStatus } from '@movemate/contracts';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import { AnswerControl } from '@/components/answer-control';
import { EnlargeablePhoto } from '@/components/enlargeable-photo';
import { PhotoAttachField } from '@/components/photo-attach-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export type CheckAnswer = { status: 'pending' | 'ok' | 'na' } | { status: 'problem'; note: string; kept: Photo[]; files: File[] };

type RoomCheckAnswerProps = {
  check: RoomCheck;
  onAnswer: (answer: CheckAnswer) => Promise<unknown>;
  onDelete: (check: RoomCheck) => void;
  disabled?: boolean;
};

const options = [
  { status: 'ok', text: 'Yes' },
  { status: 'problem', text: 'Problem' },
  { status: 'na', text: 'N/A' },
] as const satisfies readonly { status: RoomCheckStatus; text: string }[];

export function RoomCheckAnswer({ check, onAnswer, onDelete, disabled }: RoomCheckAnswerProps) {
  const noteId = useId();
  const errorId = `${noteId}-error`;
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(check.problem?.note ?? '');
  const [kept, setKept] = useState<Photo[]>(check.problem?.photos ?? []);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  async function save(answer: CheckAnswer) {
    setSaving(true);
    try {
      await onAnswer(answer);
      setEditing(false);
      setError(undefined);
      setFiles([]);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not save your answer');
    } finally {
      setSaving(false);
    }
  }

  function startEditing() {
    setNote(check.problem?.note ?? '');
    setKept(check.problem?.photos ?? []);
    setFiles([]);
    setError(undefined);
    setEditing(true);
  }

  function onChange(next: RoomCheckStatus) {
    if (next === 'problem') return startEditing();
    setEditing(false);
    return save({ status: next });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = note.trim();
    if (!trimmed) return setError('Describe the problem first');
    if (trimmed.length > MAX_NOTE_LENGTH) return setError(`Keep it under ${MAX_NOTE_LENGTH} characters`);
    return save({ status: 'problem', note: trimmed, kept, files });
  }

  return (
    <li className="flex flex-col gap-3 py-4">
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 text-base wrap-break-word">{check.text}</p>
        <Badge variant={check.source === 'ai' ? 'secondary' : 'outline'}>{check.source === 'ai' ? 'AI' : 'You'}</Badge>
        <Button variant="ghost" size="icon-sm" disabled={disabled || saving} aria-label={`Remove check: ${check.text}`} onClick={() => onDelete(check)}>
          <Trash2Icon />
        </Button>
      </div>
      <AnswerControl value={check.status} reset="pending" options={options} label={check.text} disabled={disabled || saving} onChange={onChange} />

      {check.problem && !editing && (
        <div className="flex flex-col gap-2 rounded-lg border border-warning bg-warning/10 p-3">
          <p className="text-sm font-medium text-warning-text">Problem</p>
          <p className="text-base wrap-break-word">{check.problem.note}</p>
          {check.problem.photos.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {check.problem.photos.map((photo, index) => (
                <li key={photo.id}>
                  <EnlargeablePhoto photo={photo} label={`Problem photo ${index + 1}: ${check.text}`} />
                </li>
              ))}
            </ul>
          )}
          <div>
            <Button variant="ghost" size="sm" disabled={disabled || saving} onClick={startEditing}>
              <PencilIcon data-icon="inline-start" />
              Edit problem
            </Button>
          </div>
        </div>
      )}

      {editing && (
        <form onSubmit={submit} className="grid gap-3" noValidate>
          <div className="grid gap-2">
            <Label htmlFor={noteId}>What is the problem?</Label>
            <Input
              id={noteId}
              value={note}
              autoFocus
              disabled={disabled || saving}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              placeholder="For example: crack in the tile by the sink"
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          <PhotoAttachField files={files} onFilesChange={setFiles} kept={kept} onKeptChange={setKept} disabled={disabled || saving} />
          <div className="flex gap-2">
            <Button type="submit" disabled={disabled || saving}>
              {saving && <Spinner data-icon="inline-start" />}
              Save problem
            </Button>
            <Button type="button" variant="ghost" disabled={saving} onClick={() => setEditing(false)}>
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
