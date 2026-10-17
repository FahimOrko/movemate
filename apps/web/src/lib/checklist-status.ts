import type { ChecklistStatus } from '@movemate/contracts';

export const checklistStatusLabels: Record<ChecklistStatus, string> = {
  pending: 'Not answered',
  done: 'Yes',
  no: 'No',
  na: 'N/A',
};
