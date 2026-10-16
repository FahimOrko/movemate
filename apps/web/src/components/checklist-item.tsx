import { useId } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

type ChecklistItemProps = {
  title: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function ChecklistItem({ title, description, checked, disabled, onCheckedChange }: ChecklistItemProps) {
  const id = useId();
  return (
    <div className="flex items-start gap-3 py-3">
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        aria-describedby={description ? `${id}-description` : undefined}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
      />
      <div className="grid gap-0.5">
        <label htmlFor={id} className={cn('cursor-pointer text-base', checked && 'text-muted-foreground line-through', disabled && 'cursor-not-allowed')}>
          {title}
        </label>
        {description && (
          <p id={`${id}-description`} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
