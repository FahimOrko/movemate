import { MAX_NOTE_LENGTH, type Room, roomLabels } from '@movemate/contracts';
import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type AddFindingFormProps = {
  room: Room;
  onAdd: (note: string) => Promise<unknown>;
  disabled?: boolean;
};

export function AddFindingForm({ room, onAdd, disabled }: AddFindingFormProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [note, setNote] = useState('');
  const [error, setError] = useState<string>();
  const [adding, setAdding] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = note.trim();
    if (!trimmed) return setError('Describe the issue first');
    if (trimmed.length > MAX_NOTE_LENGTH) return setError(`Keep it under ${MAX_NOTE_LENGTH} characters`);
    setError(undefined);
    setAdding(true);
    try {
      await onAdd(trimmed);
      setNote('');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not add the issue');
    } finally {
      setAdding(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-2" noValidate>
      <Label htmlFor={inputId}>Add an issue yourself in the {roomLabels[room].toLowerCase()}</Label>
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
          Add issue
        </Button>
      </div>
      {error && (
        <p id={errorId} className="text-sm text-destructive-text">
          {error}
        </p>
      )}
    </form>
  );
}
