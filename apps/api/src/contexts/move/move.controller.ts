import { createMoveSchema } from '@movemate/contracts';
import type { Request, Response } from 'express';
import { moveIdParamsSchema } from './move.schemas';
import * as service from './move.service';

export async function create(req: Request, res: Response) {
  const data = await service.create(createMoveSchema.parse(req.body));
  res.status(201).json({ data });
}

export async function getCurrent(_req: Request, res: Response) {
  res.json({ data: await service.getCurrent() });
}

export async function advance(req: Request, res: Response) {
  const { id } = moveIdParamsSchema.parse(req.params);
  res.json({ data: await service.advance(id) });
}
