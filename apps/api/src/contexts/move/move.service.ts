import { phaseOrder, type CreateMove, type Move, type Phase } from '@movemate/contracts';
import fs from 'node:fs/promises';
import path from 'node:path';
import { db } from '../../db/client';
import { env } from '../../env';
import { AppError } from '../../shared/errors';
import * as repository from './move.repository';
import type { MoveEvent } from './move.types';

// What each event unlocks. A row is added in the slice that raises the event.
const eventTable: Record<MoveEvent, { requires: Phase | null; unlocks: Phase | null }> = {
  MoveCreated: { requires: null, unlocks: 'prepare' },
  BeforePhotosAnalyzed: { requires: 'before_photos', unlocks: 'move_in' },
  MoveInCompared: { requires: 'move_in', unlocks: null },
  FindingResolved: { requires: 'move_in', unlocks: null },
  ReportGenerated: { requires: 'move_in', unlocks: 'report' },
};

const advanceBlockedMessage: Partial<Record<Phase, string>> = {
  move_in: 'Generate the report to continue',
  summary: 'This is the last phase',
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
  return unlocks && phaseIndex(unlocks) > phaseIndex(move.phase) ? setPhase(id, unlocks) : move;
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

// Uploads are emptied here, not through photos.service: photos depends on move, so move cannot call it.
export async function resetAll(): Promise<void> {
  if (env.NODE_ENV === 'production' && !env.ENABLE_RESET) throw new AppError('not_found', 'Route not found');
  const uploadRoot = path.resolve(env.UPLOAD_DIR);
  await db.transaction(async (tx) => {
    await repository.deleteAllMoves(tx);
    await fs.mkdir(uploadRoot, { recursive: true });
    const entries = await fs.readdir(uploadRoot);
    await Promise.all(entries.map((entry) => fs.rm(path.join(uploadRoot, entry), { recursive: true, force: true })));
  });
}
