import {
  MAX_SUMMARY_LENGTH,
  type AiStatus,
  type BaselineResult,
  type CompareResult,
  type AnswerRoomCheck,
  type CreateFinding,
  type CreateRoomCheck,
  type Finding,
  type Photo,
  type ResolveFinding,
  type Room,
  type RoomCheck,
} from '@movemate/contracts';
import { AppError } from '../../shared/errors';
import { completeJson } from '../../shared/ai/openrouter.client';
import * as moveService from '../move/move.service';
import * as photosService from '../photos/photos.service';
import { baselineUserText, BASELINE_SYSTEM_PROMPT, COMPARE_SYSTEM_PROMPT, compareUserText } from './inspection.prompts';
import * as repository from './inspection.repository';
import { baselineOutputSchema, compareOutputSchema, type CompareOutput } from './inspection.schemas';
import { MAX_AI_CHECKS_PER_ROOM, MAX_AI_FINDINGS_PER_ROOM, MAX_BASELINE_PHOTOS, MAX_COMPARE_PHOTOS_PER_STAGE } from './inspection.types';

function toRoomCheck(row: repository.RoomCheckRow, problem: RoomCheck['problem'] = null): RoomCheck {
  return {
    id: row.id,
    moveId: row.moveId,
    room: row.room,
    text: row.text,
    source: row.source,
    status: row.status,
    problem,
    createdAt: row.createdAt.toISOString(),
  };
}

function linkedPhotos(links: repository.FindingPhotoLink[], photoById: Map<string, Photo>, findingId: string): Photo[] {
  return links
    .filter((link) => link.findingId === findingId)
    .map((link) => photoById.get(link.photoId))
    .filter((photo): photo is Photo => photo !== undefined);
}

export async function listChecks(moveId: string): Promise<RoomCheck[]> {
  await moveService.getById(moveId);
  const [checks, rows, links, photos] = await Promise.all([
    repository.listByMove(moveId),
    repository.listFindings(moveId),
    repository.listFindingPhotoLinks(moveId),
    photosService.listByStage(moveId),
  ]);
  const photoById = new Map(photos.map((photo) => [photo.id, photo]));
  return checks.map((check) => {
    const finding = rows.find((row) => row.source === 'user' && row.roomCheckId === check.id);
    const problem = finding
      ? { findingId: finding.id, note: finding.userNote ?? '', photos: linkedPhotos(links, photoById, finding.id) }
      : null;
    return toRoomCheck(check, problem);
  });
}

export async function answerCheck(id: string, input: AnswerRoomCheck): Promise<RoomCheck> {
  const check = await repository.findCheckById(id);
  if (!check) throw new AppError('not_found', 'Check not found');
  await moveService.assertPhaseReached(check.moveId, 'move_in');
  const photoIds = input.status === 'problem' ? (input.photoIds ?? []) : [];
  if (input.status === 'problem') await photosService.assertAttachable(check.moveId, check.room, photoIds);
  await repository.answerCheck(check, input.status, input.status === 'problem' ? { note: input.note, photoIds } : undefined);
  const answered = (await listChecks(check.moveId)).find((candidate) => candidate.id === id);
  if (!answered) throw new AppError('not_found', 'Check not found');
  return answered;
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
// Rooms that succeed are kept. If every room fails, the last AI failure is thrown.
async function forEachRoom(rooms: Room[], analyze: (room: Room) => Promise<void>): Promise<Room[]> {
  const failedRooms: Room[] = [];
  let lastFailure: AppError | undefined;
  for (const room of rooms) {
    try {
      await analyze(room);
    } catch (error) {
      if (!(error instanceof AppError && error.code === 'ai_failure')) throw error;
      failedRooms.push(room);
      lastFailure = error;
    }
  }
  if (lastFailure && failedRooms.length === rooms.length) throw lastFailure;
  return failedRooms;
}

export async function runBaseline(moveId: string, onlyRooms?: Room[]): Promise<BaselineResult> {
  await moveService.assertPhaseReached(moveId, 'before_photos');
  const groups = groupByRoom(await photosService.listByStage(moveId, 'before'));
  if (groups.size === 0) throw new AppError('invalid_phase_transition', 'Add before photos first');
  const rooms = [...groups.keys()].filter((room) => !onlyRooms || onlyRooms.includes(room));

  const failedRooms = await forEachRoom(rooms, (room) => analyzeRoom(moveId, room, groups.get(room) ?? []));
  if (failedRooms.length === 0) await moveService.applyEvent(moveId, 'BeforePhotosAnalyzed');
  return { checks: await listChecks(moveId), failedRooms };
}

const statusRank: Record<AiStatus, number> = { changed: 0, unclear: 1, looks_good: 2 };

function cutSummary(summary: string): string {
  if (summary.length <= MAX_SUMMARY_LENGTH) return summary;
  const cut = summary.slice(0, MAX_SUMMARY_LENGTH - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 1)).trimEnd()}…`;
}

// The model numbers the images 1..M across both sets. Each index is mapped to the photo itself, so the photo's own stage
// decides where it is shown, and an out-of-range or repeated index is dropped.
function toDrafts(output: CompareOutput, images: Photo[], checks: repository.RoomCheckRow[]): repository.AiFindingDraft[] {
  return output.findings
    .map((finding) => {
      const roomCheckId = finding.check_number === null ? null : (checks[finding.check_number - 1]?.id ?? null);
      const photoIds = [...new Set([...finding.before_photo_indexes, ...finding.move_in_photo_indexes].map((index) => images[index - 1]?.id))];
      return {
        roomCheckId,
        aiStatus: finding.status,
        aiSummary: cutSummary(finding.summary),
        confidence: finding.confidence,
        photoIds: photoIds.filter((id): id is string => id !== undefined),
      };
    })
    .filter((draft) => draft.aiStatus !== 'looks_good' || draft.roomCheckId !== null)
    .sort((a, b) => statusRank[a.aiStatus] - statusRank[b.aiStatus])
    .slice(0, MAX_AI_FINDINGS_PER_ROOM);
}

async function compareRoom(moveId: string, room: Room, before: Photo[], moveIn: Photo[]): Promise<void> {
  const usedBefore = before.slice(0, MAX_COMPARE_PHOTOS_PER_STAGE);
  const usedMoveIn = moveIn.slice(0, MAX_COMPARE_PHOTOS_PER_STAGE);
  const images = [...usedBefore, ...usedMoveIn];
  const checks = (await repository.listByMove(moveId)).filter((check) => check.room === room);
  const output = await completeJson({
    system: COMPARE_SYSTEM_PROMPT,
    text: compareUserText(room, usedBefore.length, usedMoveIn.length, checks.map((check) => check.text)),
    images: await Promise.all(images.map((photo) => photosService.readFile(photo.id))),
    schema: compareOutputSchema,
  });
  await repository.replaceAiFindings(moveId, room, toDrafts(output, images, checks));
}

export async function listFindings(moveId: string): Promise<Finding[]> {
  await moveService.getById(moveId);
  const [rows, links, photos, checks] = await Promise.all([
    repository.listFindings(moveId),
    repository.listFindingPhotoLinks(moveId),
    photosService.listByStage(moveId),
    repository.listByMove(moveId),
  ]);
  const photoById = new Map(photos.map((photo) => [photo.id, photo]));
  const checkTextById = new Map(checks.map((check) => [check.id, check.text]));
  const linked = (findingId: string, stage: Photo['stage']) =>
    linkedPhotos(links, photoById, findingId).filter((photo) => photo.stage === stage);

  return rows.map((row) => ({
    id: row.id,
    moveId: row.moveId,
    room: row.room,
    roomCheckId: row.roomCheckId,
    checkText: row.roomCheckId ? (checkTextById.get(row.roomCheckId) ?? null) : null,
    source: row.source,
    aiStatus: row.aiStatus,
    aiSummary: row.aiSummary,
    confidence: row.confidence,
    resolution: row.resolution,
    userNote: row.userNote,
    beforePhotos: linked(row.id, 'before'),
    moveInPhotos: linked(row.id, 'move_in'),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function runCompare(moveId: string, onlyRooms?: Room[]): Promise<CompareResult> {
  await moveService.assertPhaseReached(moveId, 'move_in');
  const photos = await photosService.listByStage(moveId);
  // Photos the user attached to their own problems are close-ups and details, not room views, so the AI skips them.
  const userPhotoIds = new Set(await repository.listUserFindingPhotoIds(moveId));
  const before = groupByRoom(photos.filter((photo) => photo.stage === 'before'));
  const moveIn = groupByRoom(photos.filter((photo) => photo.stage === 'move_in' && !userPhotoIds.has(photo.id)));
  const photoRooms = new Set([...before.keys(), ...moveIn.keys()]);
  const comparable = [...photoRooms].filter((room) => before.has(room) && moveIn.has(room));
  const rooms = comparable.filter((room) => !onlyRooms || onlyRooms.includes(room));
  if (rooms.length === 0) throw new AppError('invalid_phase_transition', 'Add before and move-in photos of the same room first');
  const skippedRooms = [...photoRooms].filter((room) => !comparable.includes(room));

  const failedRooms = await forEachRoom(rooms, (room) => compareRoom(moveId, room, before.get(room) ?? [], moveIn.get(room) ?? []));
  await moveService.applyEvent(moveId, 'MoveInCompared');
  return { findings: await listFindings(moveId), failedRooms, skippedRooms };
}

async function getFindingRow(id: string): Promise<repository.FindingRow> {
  const row = await repository.findFindingById(id);
  if (!row) throw new AppError('not_found', 'Finding not found');
  return row;
}

async function findingById(moveId: string, id: string): Promise<Finding> {
  const finding = (await listFindings(moveId)).find((candidate) => candidate.id === id);
  if (!finding) throw new AppError('not_found', 'Finding not found');
  return finding;
}

// A check's problem follows the check's answer, so it is changed there.
function assertNotCheckProblem(row: repository.FindingRow): void {
  if (row.source === 'user' && row.roomCheckId) {
    throw new AppError('invalid_phase_transition', 'Change the room check answer instead');
  }
}

export async function resolveFinding(id: string, input: ResolveFinding): Promise<Finding> {
  const row = await getFindingRow(id);
  assertNotCheckProblem(row);
  const note = input.resolution === 'ok' ? null : (input.note ?? row.userNote);
  const updated = await repository.updateResolution(id, input.resolution, note);
  if (!updated) throw new AppError('not_found', 'Finding not found');
  await moveService.applyEvent(row.moveId, 'FindingResolved');
  return findingById(row.moveId, id);
}

export async function addFinding(moveId: string, input: CreateFinding): Promise<Finding> {
  await moveService.assertPhaseReached(moveId, 'move_in');
  const photoIds = input.photoIds ?? [];
  await photosService.assertAttachable(moveId, input.room, photoIds);
  const row = await repository.insertUserFinding(moveId, input.room, { note: input.note, photoIds });
  return findingById(moveId, row.id);
}

export async function deleteFinding(id: string): Promise<void> {
  const row = await getFindingRow(id);
  if (row.source === 'ai') throw new AppError('invalid_phase_transition', 'AI findings cannot be deleted. Answer them instead');
  assertNotCheckProblem(row);
  await repository.deleteFinding(id);
}
