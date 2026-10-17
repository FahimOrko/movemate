import { MAX_CHECK_LENGTH, type Room, type RoomCheck, roomLabels } from '@movemate/contracts';
import { Trash2Icon } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

type RoomCheckListProps = {
  room: Room;
  checks: RoomCheck[];
  onAdd: (text: string) => Promise<unknown>;
  onDelete: (check: RoomCheck) => void;
  /** Shows placeholder rows while the AI works on this room. */
  analyzing?: boolean;
  disabled?: boolean;
};

export function RoomCheckList({ room, checks, onAdd, onDelete, analyzing, disabled }: RoomCheckListProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [text, setText] = useState('');
  const [error, setError] = useState<string>();
  const [adding, setAdding] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return setError('Write a check first');
    if (trimmed.length > MAX_CHECK_LENGTH) return setError(`Keep it under ${MAX_CHECK_LENGTH} characters`);
    setError(undefined);
    setAdding(true);
    try {
      await onAdd(trimmed);
      setText('');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not add the check');
    } finally {
      setAdding(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{roomLabels[room]}</CardTitle>
        <CardDescription>
          {analyzing ? 'Reading the photos' : `${checks.length} ${checks.length === 1 ? 'check' : 'checks'}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {analyzing ? (
          <div className="flex flex-col gap-2" aria-hidden="true">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ) : checks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No checks yet. Analyze the photos or add your own below.</p>
        ) : (
          <ul className="divide-y">
            {checks.map((check) => (
              <li key={check.id} className="flex items-start gap-3 py-2">
                <p className="min-w-0 flex-1 text-base">{check.text}</p>
                <Badge variant={check.source === 'ai' ? 'secondary' : 'outline'}>{check.source === 'ai' ? 'AI' : 'You'}</Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  aria-label={`Remove check: ${check.text}`}
                  onClick={() => onDelete(check)}
                >
                  <Trash2Icon />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={submit} className="grid gap-2" noValidate>
          <Label htmlFor={inputId}>Add a check for the {roomLabels[room].toLowerCase()}</Label>
          <div className="flex gap-2">
            <Input
              id={inputId}
              value={text}
              disabled={disabled || adding}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              placeholder="Write your own check"
              onChange={(event) => setText(event.target.value)}
            />
            <Button type="submit" variant="secondary" disabled={disabled || adding}>
              {adding && <Spinner data-icon="inline-start" />}
              Add
            </Button>
          </div>
          {error && (
            <p id={errorId} className="text-sm text-destructive-text">
              {error}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
