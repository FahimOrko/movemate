import { MAX_NOTE_LENGTH, type Room, roomLabels } from '@movemate/contracts';
import { useId, useState, type FormEvent } from 'react';
import { PhotoAttachField } from '@/components/photo-attach-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type AddFindingFormProps = {
  room: Room;
  onAdd: (note: string, files: File[]) => Promise<unknown>;
  disabled?: boolean;
  /** Offers up to 3 photos with the problem. */
  allowPhotos?: boolean;
};

export function AddFindingForm({ room, onAdd, disabled, allowPhotos }: AddFindingFormProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>();
  const [adding, setAdding] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = note.trim();
    if (!trimmed) return setError('Describe the problem first');
    if (trimmed.length > MAX_NOTE_LENGTH) return setError(`Keep it under ${MAX_NOTE_LENGTH} characters`);
    setError(undefined);
    setAdding(true);
    try {
      await onAdd(trimmed, files);
      setNote('');
      setFiles([]);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not add the problem');
    } finally {
      setAdding(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-2" noValidate>
      <Label htmlFor={inputId}>Describe a problem in the {roomLabels[room].toLowerCase()}</Label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          value={note}
          disabled={disabled || adding}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          placeholder="For example: scratch on the door frame"
          onChange={(event) => setNote(event.target.value)}
        />
        <Button type="submit" variant="secondary" disabled={disabled || adding}>
          {adding && <Spinner data-icon="inline-start" />}
          Add problem
        </Button>
      </div>
      {allowPhotos && <PhotoAttachField files={files} onFilesChange={setFiles} disabled={disabled || adding} />}
      {error && (
        <p id={errorId} className="text-sm text-destructive-text">
          {error}
        </p>
      )}
    </form>
  );
}
