import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { MAX_PHOTOS_PER_ROOM, phaseOrder, type Photo, type PhotoStage, type Room } from '@movemate/contracts';
import sharp from 'sharp';
import { env } from '../../env';
import { AppError } from '../../shared/errors';
import * as moveService from '../move/move.service';
import * as repository from './photos.repository';

const acceptedFormats = ['jpeg', 'png', 'webp'];
const maxEdgePx = 1600;
const stagePhase = { before: 'before_photos', move_in: 'move_in' } as const;

function uploadRoot(): string {
  return path.resolve(env.UPLOAD_DIR);
}

function toPhoto(row: repository.PhotoRow): Photo {
  return {
    id: row.id,
    moveId: row.moveId,
    stage: row.stage,
    room: row.room,
    width: row.width,
    height: row.height,
    createdAt: row.createdAt.toISOString(),
    url: `/api/photos/${row.id}/file`,
  };
}

async function getRow(id: string): Promise<repository.PhotoRow> {
  const row = await repository.findPhotoById(id);
  if (!row) throw new AppError('not_found', 'Photo not found');
  return row;
}

// The format comes from the file's bytes, never from the client's MIME type or extension.
async function normalizeImage(buffer: Buffer) {
  try {
    const { format } = await sharp(buffer).metadata();
    if (!format || !acceptedFormats.includes(format)) throw new Error('Unsupported format');
    return await sharp(buffer)
      .rotate()
      .resize(maxEdgePx, maxEdgePx, { fit: 'inside', withoutEnlargement: true })
      .jpeg()
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new AppError('validation_error', 'Upload a JPEG, PNG or WebP photo');
  }
}

async function assertRoomHasSpace(moveId: string, stage: PhotoStage, room: Room): Promise<void> {
  if ((await repository.countInRoom(moveId, stage, room)) >= MAX_PHOTOS_PER_ROOM) {
    throw new AppError('validation_error', `A room can have at most ${MAX_PHOTOS_PER_ROOM} photos per stage`);
  }
}

export async function upload(moveId: string, stage: PhotoStage, room: Room, buffer: Buffer): Promise<Photo> {
  await moveService.assertPhaseReached(moveId, stagePhase[stage]);
  await assertRoomHasSpace(moveId, stage, room);
  const { data, info } = await normalizeImage(buffer);
  const filePath = path.join(moveId, `${randomUUID()}.jpg`);
  const absolutePath = path.join(uploadRoot(), filePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, data);
  try {
    return toPhoto(await repository.insertPhoto({ moveId, stage, room, filePath, width: info.width, height: info.height }));
  } catch (error) {
    await fs.rm(absolutePath, { force: true });
    throw error;
  }
}

export async function listByStage(moveId: string, stage?: PhotoStage): Promise<Photo[]> {
  await moveService.getById(moveId);
  return (await repository.listPhotos(moveId, stage)).map(toPhoto);
}

export async function relabel(id: string, room: Room): Promise<Photo> {
  const row = await getRow(id);
  if (row.room !== room) await assertRoomHasSpace(row.moveId, row.stage, room);
  const updated = await repository.updateRoom(id, room);
  if (!updated) throw new AppError('not_found', 'Photo not found');
  return toPhoto(updated);
}

export async function remove(id: string): Promise<void> {
  const row = await getRow(id);
  const move = await moveService.getById(row.moveId);
  if (phaseOrder.indexOf(move.phase) >= phaseOrder.indexOf('report')) {
    throw new AppError('invalid_phase_transition', 'Photos cannot be deleted once the report exists');
  }
  await repository.deletePhoto(id);
  try {
    await fs.rm(path.join(uploadRoot(), row.filePath), { force: true });
  } catch (error) {
    console.error('Could not delete photo file:', error instanceof Error ? error.message : 'unknown error');
  }
}

// Returns an absolute path only for a stored photo, and only inside UPLOAD_DIR.
export async function getFilePath(id: string): Promise<string> {
  const row = await getRow(id);
  const root = uploadRoot();
  const absolutePath = path.resolve(root, row.filePath);
  if (!absolutePath.startsWith(root + path.sep)) throw new AppError('not_found', 'Photo not found');
  return absolutePath;
}

export async function readFile(id: string): Promise<Buffer> {
  return fs.readFile(await getFilePath(id));
}
