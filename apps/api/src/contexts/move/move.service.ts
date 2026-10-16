import { phaseOrder, type CreateMove, type Move, type Phase } from '@movemate/contracts';
import { AppError } from '../../shared/errors';
import * as repository from './move.repository';
import type { MoveEvent } from './move.types';

// What each event unlocks. A row is added in the slice that raises the event.
const eventTable: Record<MoveEvent, { requires: Phase | null; unlocks: Phase }> = {
  MoveCreated: { requires: null, unlocks: 'prepare' },
};

const advanceBlockedMessage: Partial<Record<Phase, string>> = {
  move_in: 'Generate the report to continue',
  settle_in: 'This is the last phase',
};

function phaseIndex(phase: Phase): number {
  return phaseOrder.indexOf(phase);
}

function toMove(row: repository.MoveRow): Move {
  return {
    id: row.id,
    address: row.address,
    moveDate: row.moveDate,
    phase: row.phase,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function create(input: CreateMove): Promise<Move> {
  return toMove(await repository.insertMove(input));
}

export async function getCurrent(): Promise<Move | null> {
  const row = await repository.findLatestMove();
  return row ? toMove(row) : null;
}

export async function getById(id: string): Promise<Move> {
  const row = await repository.findMoveById(id);
  if (!row) throw new AppError('not_found', 'Move not found');
  return toMove(row);
}

export async function advance(id: string): Promise<Move> {
  const move = await getById(id);
  const blocked = advanceBlockedMessage[move.phase];
  const next = phaseOrder[phaseIndex(move.phase) + 1];
  if (blocked || !next) throw new AppError('invalid_phase_transition', blocked ?? 'Cannot advance');
  return setPhase(id, next);
}

export async function applyEvent(id: string, event: MoveEvent): Promise<Move> {
  const move = await getById(id);
  const { requires, unlocks } = eventTable[event];
  if (requires && phaseIndex(move.phase) < phaseIndex(requires)) {
    throw new AppError('invalid_phase_transition', `${event} needs the ${requires} phase`);
  }
  // Unlocking never moves the phase backwards.
  return phaseIndex(unlocks) > phaseIndex(move.phase) ? setPhase(id, unlocks) : move;
}

export async function assertPhaseReached(id: string, phase: Phase): Promise<void> {
  const move = await getById(id);
  if (phaseIndex(move.phase) < phaseIndex(phase)) {
    throw new AppError('invalid_phase_transition', `The ${phase} phase is not unlocked yet`);
  }
}

async function setPhase(id: string, phase: Phase): Promise<Move> {
  const row = await repository.updatePhase(id, phase);
  if (!row) throw new AppError('not_found', 'Move not found');
  return toMove(row);
}
