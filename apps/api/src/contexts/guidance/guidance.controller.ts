import { setProgressSchema } from '@movemate/contracts';
import type { Request, Response } from 'express';
import { moveIdParamsSchema } from '../move/move.schemas';
import { progressParamsSchema } from './guidance.schemas';
import * as service from './guidance.service';

export function getPrepareGuidance(_req: Request, res: Response) {
  res.json({ data: service.getPrepareGuidance() });
}

export async function listProgress(req: Request, res: Response) {
  const { id } = moveIdParamsSchema.parse(req.params);
  res.json({ data: await service.listProgress(id) });
}

export async function setProgress(req: Request, res: Response) {
  const { id, itemKey } = progressParamsSchema.parse(req.params);
  const { completed } = setProgressSchema.parse(req.body);
  res.json({ data: await service.setProgress(id, itemKey, completed) });
}
