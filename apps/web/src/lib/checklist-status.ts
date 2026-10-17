import { isHandled, type ChecklistStatus } from '@movemate/contracts';

export const checklistStatusLabels: Record<ChecklistStatus, string> = {
  pending: 'Not answered',
  done: 'Yes',
  no: 'No',
  na: 'N/A',
};

export function countChecklist(entries: { status: ChecklistStatus }[]) {
  const handled = entries.filter((entry) => isHandled(entry.status)).length;
  return {
    handled,
    done: entries.filter((entry) => entry.status === 'done').length,
    na: entries.filter((entry) => entry.status === 'na').length,
    left: entries.length - handled,
  };
}
