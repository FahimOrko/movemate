import type { ChecklistStatus } from '@movemate/contracts';
import { Button } from '@/components/ui/button';

type StatusControlProps = {
  value: ChecklistStatus;
  onChange: (status: ChecklistStatus) => void;
  /** Names the group for screen readers, for example the checklist item title. */
  label: string;
  disabled?: boolean;
};

const options = [
  { status: 'done', text: 'Yes' },
  { status: 'no', text: 'No' },
  { status: 'na', text: 'N/A' },
] as const;

export function StatusControl({ value, onChange, label, disabled }: StatusControlProps) {
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
            onClick={() => onChange(pressed ? 'pending' : status)}
          >
            {text}
          </Button>
        );
      })}
    </div>
  );
}
