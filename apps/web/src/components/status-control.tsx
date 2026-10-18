import type { ChecklistStatus } from '@movemate/contracts';
import { AnswerControl } from '@/components/answer-control';

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

export function StatusControl(props: StatusControlProps) {
  return <AnswerControl {...props} reset="pending" options={options} />;
}
