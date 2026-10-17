import { setProgressSchema, setProviderSelectionSchema } from '@movemate/contracts';
import type { Request, Response } from 'express';
import { moveIdParamsSchema } from '../move/move.schemas';
import { progressParamsSchema, selectionParamsSchema } from './guidance.schemas';
import * as service from './guidance.service';

export function getPrepareGuidance(_req: Request, res: Response) {
  res.json({ data: service.getPrepareGuidance() });
}

export function getProviders(_req: Request, res: Response) {
  res.json({ data: service.getProviders() });
}

export async function listProgress(req: Request, res: Response) {
  const { id } = moveIdParamsSchema.parse(req.params);
  res.json({ data: await service.listProgress(id) });
}

export async function setProgress(req: Request, res: Response) {
  const { id, itemKey } = progressParamsSchema.parse(req.params);
  const { status } = setProgressSchema.parse(req.body);
  res.json({ data: await service.setProgress(id, itemKey, status) });
}

export async function getSelection(req: Request, res: Response) {
  const { id } = moveIdParamsSchema.parse(req.params);
  res.json({ data: await service.getSelection(id) });
}

export async function setSelection(req: Request, res: Response) {
  const { id, category } = selectionParamsSchema.parse(req.params);
  const { providerKey } = setProviderSelectionSchema.parse(req.body);
  res.json({ data: await service.setSelection(id, category, providerKey) });
}
