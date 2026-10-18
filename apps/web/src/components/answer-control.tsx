import { Button } from '@/components/ui/button';

export type AnswerOption<T extends string> = { status: T; text: string };

type AnswerControlProps<T extends string> = {
  value: T;
  onChange: (status: T) => void;
  /** The unanswered value; pressing the active option goes back to it. */
  reset: T;
  options: readonly AnswerOption<T>[];
  /** Names the group for screen readers, for example the checklist item title. */
  label: string;
  disabled?: boolean;
};

export function AnswerControl<T extends string>({ value, onChange, reset, options, label, disabled }: AnswerControlProps<T>) {
  return (
    <div role="group" aria-label={`Answer for ${label}`} className="flex shrink-0 items-center gap-1">
      {options.map(({ status, text }) => {
        const pressed = value === status;
        return (
          <Button
            key={status}
            type="button"
            size="sm"
            variant={pressed ? 'default' : 'secondary'}
            aria-pressed={pressed}
            disabled={disabled}
            aria-disabled={disabled || undefined}
            onClick={() => onChange(pressed ? reset : status)}
          >
            {text}
          </Button>
        );
      })}
    </div>
  );
}
