import { CircleAlertIcon } from 'lucide-react';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type AiErrorAlertProps = {
  title: string;
  message: string;
  /** Omit when retrying cannot help, for example when AI is not configured. */
  onRetry?: () => void;
  retrying?: boolean;
};

export function AiErrorAlert({ title, message, onRetry, retrying }: AiErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {onRetry && (
        <AlertAction>
          <Button variant="secondary" size="sm" disabled={retrying} onClick={onRetry}>
            {retrying && <Spinner data-icon="inline-start" />}
            Try again
          </Button>
        </AlertAction>
      )}
    </Alert>
  );
}
