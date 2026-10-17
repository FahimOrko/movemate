import { CircleAlertIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';

type StartOverDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending?: boolean;
  error?: string;
};

export function StartOverDialog({ open, onOpenChange, onConfirm, pending, error }: StartOverDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>Start over?</DialogTitle>
          <DialogDescription>Delete this move, all photos, findings and reports? This cannot be undone.</DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button variant="secondary" disabled={pending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={pending} aria-busy={pending} onClick={onConfirm}>
            {pending && <Spinner data-icon="inline-start" />}
            Delete everything
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
