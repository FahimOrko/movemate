import { useState } from 'react';
import { StartOverDialog } from '@/components/start-over-dialog';
import { Button } from '@/components/ui/button';
import { useReset } from './use-reset';

export function StartOverButton() {
  const [open, setOpen] = useState(false);
  const reset = useReset();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset.reset();
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Start over
      </Button>
      <StartOverDialog
        open={open}
        onOpenChange={handleOpenChange}
        onConfirm={() => reset.mutate()}
        pending={reset.isPending}
        error={reset.isError ? 'Could not delete everything. Try again.' : undefined}
      />
    </>
  );
}
