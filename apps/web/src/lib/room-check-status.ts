import type { RoomCheckStatus } from '@movemate/contracts';

export const roomCheckStatusLabels: Record<RoomCheckStatus, string> = {
  pending: 'Not answered',
  ok: 'Looks fine',
  problem: 'Problem',
  na: 'N/A',
};
