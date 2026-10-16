import { createMoveSchema } from '@movemate/contracts';
import { CircleAlertIcon } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { CreateMoveFields } from '@/components/create-move-fields';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useCreateMove } from '@/features/prepare/use-move';

export function CreateMoveForm() {
  const createMove = useCreateMove();
  const [addressError, setAddressError] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const moveDate = form.get('moveDate');
    const parsed = createMoveSchema.safeParse({
      address: form.get('address'),
      moveDate: moveDate || undefined,
    });
    if (!parsed.success) {
      setAddressError(parsed.error.issues.find((issue) => issue.path[0] === 'address')?.message ?? 'Check the move date.');
      return;
    }
    setAddressError(undefined);
    createMove.mutate(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto grid max-w-md gap-6">
      <div>
        <h1 className="text-title">Start your move</h1>
        <p className="mt-2 text-muted-foreground">Tell us where you are moving. You can add photos and notes next.</p>
      </div>
      <CreateMoveFields idPrefix="create-move" addressError={addressError} disabled={createMove.isPending} />
      {createMove.isError && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Could not create your move</AlertTitle>
          <AlertDescription>{createMove.error.message}</AlertDescription>
        </Alert>
      )}
      <div>
        <Button type="submit" size="lg" disabled={createMove.isPending}>
          {createMove.isPending && <Spinner data-icon="inline-start" />}
          Create move
        </Button>
      </div>
    </form>
  );
}
