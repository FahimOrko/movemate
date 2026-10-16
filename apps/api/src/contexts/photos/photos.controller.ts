import { relabelPhotoSchema } from '@movemate/contracts';
import type { Request, Response } from 'express';
import { AppError } from '../../shared/errors';
import { moveIdParamsSchema } from '../move/move.schemas';
import { listPhotosQuerySchema, photoIdParamsSchema, uploadFieldsSchema } from './photos.schemas';
import * as service from './photos.service';

export async function upload(req: Request, res: Response) {
  const { id } = moveIdParamsSchema.parse(req.params);
  const { stage, room } = uploadFieldsSchema.parse(req.body);
  if (!req.file) throw new AppError('validation_error', 'Send the photo in the "file" field');
  res.status(201).json({ data: await service.upload(id, stage, room, req.file.buffer) });
}

export async function list(req: Request, res: Response) {
  const { id } = moveIdParamsSchema.parse(req.params);
  const { stage } = listPhotosQuerySchema.parse(req.query);
  res.json({ data: await service.listByStage(id, stage) });
}

export async function relabel(req: Request, res: Response) {
  const { id } = photoIdParamsSchema.parse(req.params);
  const { room } = relabelPhotoSchema.parse(req.body);
  res.json({ data: await service.relabel(id, room) });
}

export async function remove(req: Request, res: Response) {
  const { id } = photoIdParamsSchema.parse(req.params);
  await service.remove(id);
  res.status(204).end();
}

export async function sendFile(req: Request, res: Response) {
  const { id } = photoIdParamsSchema.parse(req.params);
  const filePath = await service.getFilePath(id);
  res.type('image/jpeg').set('Cache-Control', 'private, max-age=3600');
  await new Promise<void>((resolve, reject) => {
    res.sendFile(filePath, (error) => (error ? reject(error) : resolve()));
  });
}
