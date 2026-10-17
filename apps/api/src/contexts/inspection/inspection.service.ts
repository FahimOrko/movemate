import type { BaselineResult, CreateRoomCheck, Photo, Room, RoomCheck } from '@movemate/contracts';
import { AppError } from '../../shared/errors';
import { completeJson } from '../../shared/ai/openrouter.client';
import * as moveService from '../move/move.service';
import * as photosService from '../photos/photos.service';
import { baselineUserText, BASELINE_SYSTEM_PROMPT } from './inspection.prompts';
import * as repository from './inspection.repository';
import { baselineOutputSchema } from './inspection.schemas';
import { MAX_AI_CHECKS_PER_ROOM, MAX_BASELINE_PHOTOS } from './inspection.types';

function toRoomCheck(row: repository.RoomCheckRow): RoomCheck {
  return {
    id: row.id,
    moveId: row.moveId,
    room: row.room,
    text: row.text,
    source: row.source,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listChecks(moveId: string): Promise<RoomCheck[]> {
  await moveService.getById(moveId);
  return (await repository.listByMove(moveId)).map(toRoomCheck);
}

export async function addCheck(moveId: string, input: CreateRoomCheck): Promise<RoomCheck> {
  await moveService.assertPhaseReached(moveId, 'before_photos');
  return toRoomCheck(await repository.insertCheck(moveId, input.room, input.text, 'user'));
}

export async function deleteCheck(id: string): Promise<void> {
  if (!(await repository.deleteCheck(id))) throw new AppError('not_found', 'Check not found');
}

function groupByRoom(photos: Photo[]): Map<Room, Photo[]> {
  const groups = new Map<Room, Photo[]>();
  for (const photo of photos) groups.set(photo.room, [...(groups.get(photo.room) ?? []), photo]);
  return groups;
}

async function analyzeRoom(moveId: string, room: Room, photos: Photo[]): Promise<void> {
  const used = photos.slice(0, MAX_BASELINE_PHOTOS);
  const images = await Promise.all(used.map((photo) => photosService.readFile(photo.id)));
  const { checks } = await completeJson({
    system: BASELINE_SYSTEM_PROMPT,
    text: baselineUserText(room, used.length),
    images,
    schema: baselineOutputSchema,
  });
  await repository.replaceAiChecks(moveId, room, checks.slice(0, MAX_AI_CHECKS_PER_ROOM));
}

// Rooms run one after another to stay inside the free tier's request limits.
export async function runBaseline(moveId: string, onlyRooms?: Room[]): Promise<BaselineResult> {
  await moveService.assertPhaseReached(moveId, 'before_photos');
  const groups = groupByRoom(await photosService.listByStage(moveId, 'before'));
  if (groups.size === 0) throw new AppError('invalid_phase_transition', 'Add before photos first');
  const rooms = [...groups.keys()].filter((room) => !onlyRooms || onlyRooms.includes(room));

  const failedRooms: Room[] = [];
  let lastFailure: AppError | undefined;
  for (const room of rooms) {
    try {
      await analyzeRoom(moveId, room, groups.get(room) ?? []);
    } catch (error) {
      if (!(error instanceof AppError && error.code === 'ai_failure')) throw error;
      failedRooms.push(room);
      lastFailure = error;
    }
  }
  if (lastFailure && failedRooms.length === rooms.length) throw lastFailure;
  if (failedRooms.length === 0) await moveService.applyEvent(moveId, 'BeforePhotosAnalyzed');
  return { checks: await listChecks(moveId), failedRooms };
}
