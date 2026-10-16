import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type CreateMoveFieldsProps = {
  idPrefix: string;
  addressError?: string;
  disabled?: boolean;
};

export function CreateMoveFields({ idPrefix, addressError, disabled }: CreateMoveFieldsProps) {
  const addressId = `${idPrefix}-address`;
  const errorId = `${addressId}-error`;
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor={addressId}>Address</Label>
        <Input
          id={addressId}
          name="address"
          autoComplete="street-address"
          placeholder="Aurakatu 12 B 7, Turku"
          disabled={disabled}
          aria-invalid={addressError ? true : undefined}
          aria-describedby={addressError ? errorId : undefined}
        />
        {addressError && (
          <p id={errorId} className="text-sm text-destructive-text">
            {addressError}
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-date`}>Move date (optional)</Label>
        <Input id={`${idPrefix}-date`} name="moveDate" type="date" disabled={disabled} />
      </div>
    </>
  );
}
