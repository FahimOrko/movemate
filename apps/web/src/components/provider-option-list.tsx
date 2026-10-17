import type { Provider } from '@movemate/contracts';
import { ProviderOptionRow } from '@/components/provider-option-row';
import { RadioGroup } from '@/components/ui/radio-group';

type ProviderOptionListProps = {
  label: string;
  options: Pick<Provider, 'key' | 'name'>[];
  selectedKey: string | null;
  compact?: boolean;
  onChoose: (providerKey: string) => void;
};

export function ProviderOptionList({ label, options, selectedKey, compact = false, onChoose }: ProviderOptionListProps) {
  return (
    <RadioGroup aria-label={label} value={selectedKey ?? ''}>
      {options.map((option) => (
        <ProviderOptionRow key={option.key} providerKey={option.key} name={option.name} compact={compact} selected={selectedKey === option.key} onToggle={() => onChoose(option.key)} />
      ))}
    </RadioGroup>
  );
}
