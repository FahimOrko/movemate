import type { Room } from '@movemate/contracts';

/** Anchor id of a room section in the report; the Summary links to it. */
export const roomSectionId = (room: Room) => `room-${room}`;
